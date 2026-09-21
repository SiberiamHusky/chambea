import json
import os
from urllib import error as urllib_error
from urllib import request as urllib_request

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Cargar variables de entorno
load_dotenv()

# Inicializar FastAPI
app = FastAPI(
    title="Chambea AI Bot",
    description="Asistente AI para perfiles de empleador y trabajador",
    version="4.0.0",
)

# Configurar CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, cambia esto a tu dominio frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def resolve_provider() -> str:
    configured_provider = os.getenv("LLM_PROVIDER")
    if configured_provider:
        return configured_provider.strip().lower()

    use_ollama = os.getenv("USE_OLLAMA", "").strip().lower()
    if use_ollama == "true":
        return "ollama"

    return "gemini"


LLM_PROVIDER = resolve_provider()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models",
).rstrip("/")

# Definir modelos de datos
class ChatMessage(BaseModel):
    role: str  # "user" o "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: dict | None = None  # Información adicional del perfil (ej: nombre, empresa, etc.)

class SuggestionRequest(BaseModel):
    type: str  # "bio", "company_description", "general"
    context: dict  # Información del perfil para personalizar la sugerencia

# Prompt base para el asistente
SYSTEM_PROMPT = """
Eres un asistente experto en ayudar a usuarios de Chambea (tanto empleadores como trabajadores) a mejorar su perfil en la plataforma de búsqueda de trabajo. Tu objetivo es:
1. Dar consejos prácticos y personalizados según el rol del usuario (trabajador o empleador).
2. Ayudar a redactar biografías, descripciones de empresa y descripciones de habilidades claras y atractivas.
3. Responder preguntas sobre cómo destacar en la plataforma.
4. Ser amigable, profesional y enfocado en el usuario.

Si el usuario proporciona información de contexto (nombre, empresa, experiencia, habilidades, rol), úsala para personalizar tus respuestas.
Responde en español.
"""


def get_active_model() -> str:
    return GEMINI_MODEL if LLM_PROVIDER == "gemini" else OLLAMA_MODEL


def format_context(context: dict | None) -> str:
    if not context:
        return ""

    lines: list[str] = []
    for key, value in context.items():
        if value not in (None, "", [], {}):
            lines.append(f"- {key}: {value}")
    return "\n".join(lines)


def call_gemini(messages: list[dict[str, str]]) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("Falta configurar GEMINI_API_KEY en el entorno del bot.")

    system_parts: list[str] = []
    contents: list[dict[str, object]] = []

    for message in messages:
        role = message["role"]
        content = message["content"].strip()
        if not content:
            continue

        if role == "system":
            system_parts.append(content)
            continue

        gemini_role = "model" if role == "assistant" else "user"
        contents.append(
            {
                "role": gemini_role,
                "parts": [{"text": content}],
            }
        )

    if not contents:
        contents.append({"role": "user", "parts": [{"text": "Hola"}]})

    payload: dict[str, object] = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 700,
        },
    }

    if system_parts:
        payload["system_instruction"] = {
            "parts": [{"text": "\n\n".join(system_parts)}]
        }

    url = f"{GEMINI_API_URL}/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    request = urllib_request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib_error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini respondió con error HTTP {exc.code}: {detail}") from exc
    except urllib_error.URLError as exc:
        raise RuntimeError(f"No se pudo conectar con Gemini: {exc.reason}") from exc

    candidates = result.get("candidates", [])
    if not candidates:
        raise RuntimeError("Gemini no devolvió candidatos de respuesta.")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in parts).strip()
    if not text:
        raise RuntimeError("Gemini devolvió una respuesta vacía.")

    return text


def call_ollama(messages: list[dict[str, str]]) -> str:
    try:
        import ollama
    except ImportError as exc:
        raise RuntimeError(
            "El proveedor configurado es Ollama, pero el paquete 'ollama' no está instalado."
        ) from exc

    response = ollama.chat(model=OLLAMA_MODEL, messages=messages)
    return response["message"]["content"]


def generate_text(messages: list[dict[str, str]]) -> str:
    if LLM_PROVIDER == "gemini":
        return call_gemini(messages)
    if LLM_PROVIDER == "ollama":
        return call_ollama(messages)
    raise RuntimeError(
        f"Proveedor no soportado: {LLM_PROVIDER}. Usa 'gemini' u 'ollama'."
    )

@app.get("/")
def read_root():
    return {
        "message": "Chambea AI Bot está funcionando!",
        "version": "4.0.0",
        "engine": "Gemini" if LLM_PROVIDER == "gemini" else "Ollama",
        "provider": LLM_PROVIDER,
        "model": get_active_model(),
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Endpoint para el chat interactivo"""
    try:
        # Preparar los mensajes para el modelo
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Añadir contexto si existe
        context_str = format_context(request.context)
        if context_str:
            messages.append(
                {
                    "role": "system",
                    "content": f"Contexto del usuario:\n{context_str}",
                }
            )
        
        # Añadir el historial de chat
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})
        
        return {"response": generate_text(messages)}
    
    except Exception as e:
        error_msg = (
            f"Error al conectar con el proveedor {LLM_PROVIDER}: {str(e)}"
        )
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/suggestions")
async def get_suggestions(request: SuggestionRequest):
    """Endpoint para obtener sugerencias predefinidas personalizadas"""
    try:
        # Obtener el rol del usuario del contexto (si existe)
        user_role = request.context.get("userRole", "employer")
        context_str = format_context(request.context) or "Sin contexto adicional."
        
        # Construir prompt según el tipo de sugerencia y el rol del usuario
        if request.type == "bio":
            if user_role == "worker":
                prompt = f"""
Genera 3 sugerencias de biografía para un trabajador en Chambea, personalizadas con esta información:
{context_str}

Las sugerencias deben ser:
- Profesionales pero amigables
- Entre 50 y 150 palabras
- Destacar la experiencia, habilidades y valores del trabajador

Devuelve solo las 3 sugerencias, cada una en una línea separada, sin números ni viñetas.
"""
            else:
                prompt = f"""
Genera 3 sugerencias de biografía para un empleador en Chambea, personalizadas con esta información:
{context_str}

Las sugerencias deben ser:
- Profesionales pero amigables
- Entre 50 y 150 palabras
- Destacar la experiencia y valores del empleador

Devuelve solo las 3 sugerencias, cada una en una línea separada, sin números ni viñetas.
"""
        elif request.type == "company_description":
            prompt = f"""
Genera 3 sugerencias de descripción de empresa para Chambea, personalizadas con esta información:
{context_str}

Las sugerencias deben ser:
- Atractivas para candidatos
- Claras sobre la misión y valores de la empresa
- Entre 80 y 200 palabras

Devuelve solo las 3 sugerencias, cada una en una línea separada, sin números ni viñetas.
"""
        elif request.type == "skills":
            prompt = f"""
Genera 3 sugerencias de descripción de habilidades para un trabajador en Chambea, personalizadas con esta información:
{context_str}

Las sugerencias deben ser:
- Profesionales y claras
- Entre 30 y 100 palabras
- Destacar las habilidades más relevantes del trabajador

Devuelve solo las 3 sugerencias, cada una en una línea separada, sin números ni viñetas.
"""
        else:  # general
            if user_role == "worker":
                prompt = f"""
Genera 3 consejos prácticos para mejorar el perfil de trabajador en Chambea, considerando:
{context_str}

Los consejos deben ser accionables y específicos.
Devuelve solo los 3 consejos, cada uno en una línea separada, sin números ni viñetas.
"""
            else:
                prompt = f"""
Genera 3 consejos prácticos para mejorar el perfil de empleador en Chambea, considerando:
{context_str}

Los consejos deben ser accionables y específicos.
Devuelve solo los 3 consejos, cada uno en una línea separada, sin números ni viñetas.
"""

        response = generate_text(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ]
        )
        
        # Parsear las sugerencias (separadas por líneas)
        suggestions = [line.strip("- ").strip() for line in response.split("\n") if line.strip()]
        
        # Si no se parsearon bien, usar fallback
        if not suggestions or len(suggestions) < 3:
            return {"suggestions": get_fallback_suggestions(request.type, user_role)}
        
        return {"suggestions": suggestions[:3]}
    
    except Exception as e:
        print(f"Error: {str(e)}")
        # Obtener el rol del usuario para fallback
        user_role = request.context.get("userRole", "employer")
        # Fallback a sugerencias predefinidas
        return {"suggestions": get_fallback_suggestions(request.type, user_role)}

def get_fallback_suggestions(type: str, user_role: str = "employer") -> list[str]:
    """Sugerencias predefinidas en caso de error"""
    if user_role == "worker":
        if type == "bio":
            return [
                "Profesional dedicado con experiencia en mi sector, buscando nuevas oportunidades para crecer y contribuir.",
                "Con años de experiencia, me especializo en ofrecer soluciones de calidad y trabajar en equipo.",
                "Apasionado por mi trabajo, siempre busco aprender y mejorar mis habilidades para brindar los mejores resultados."
            ]
        elif type == "skills":
            return [
                "Experto en desarrollo web con conocimientos en HTML, CSS, JavaScript y React. Capaz de crear interfaces responsivas y funcionales.",
                "Habilidades en gestión de proyectos, trabajo en equipo y comunicación efectiva. Siempre buscando optimizar procesos.",
                "Experiencia en atención al cliente, resolución de problemas y manejo de herramientas de oficina."
            ]
        else:  # general
            return [
                "Agrega una foto profesional a tu perfil y completa todos los campos de información.",
                "Destaca tus habilidades más relevantes y añade ejemplos de trabajos anteriores si es posible.",
                "Mantén tu perfil actualizado y responde rápidamente a las ofertas de trabajo que te interesen."
            ]
    else:
        if type == "bio":
            return [
                "Como emprendedor con experiencia, me especializo en conectar talento con oportunidades que impulsan el crecimiento empresarial.",
                "Profesional dedicado a la excelencia y al desarrollo de equipos de alto rendimiento. Busco colaboradores que compartan nuestra visión.",
                "Con años en el mercado, mi objetivo es construir relaciones laborales duraderas y mutuamente beneficiosas."
            ]
        elif type == "company_description":
            return [
                "Empresa innovadora dedicada a transformar el sector tecnológico con soluciones creativas y un equipo apasionado.",
                "Organización comprometida con el desarrollo de sus colaboradores y la creación de valor para nuestros clientes.",
                "Startup dinámica que busca revolucionar la forma en que operamos en el mercado actual."
            ]
        else:  # general
            return [
                "Agrega una foto profesional a tu perfil y completa todos los campos de información de tu empresa.",
                "Publica ofertas de trabajo detalladas y actualiza regularmente tus publicaciones.",
                "Destaca los beneficios y la cultura de tu empresa para atraer a los mejores candidatos."
            ]

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

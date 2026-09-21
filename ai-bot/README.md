# Chambea AI Bot

Asistente de inteligencia artificial para ayudar a los empleadores a mejorar su perfil en la plataforma Chambea.

## Características

- **Chat interactivo**: Responde preguntas personalizadas sobre cómo mejorar el perfil de empleador.
- **Sugerencias inteligentes**: Genera sugerencias personalizadas para biografías y descripciones de empresa.
- **API REST**: Fácil de integrar con el frontend de Chambea.
- **Multi-motor**: Soporte para **Ollama (gratis, local)** y OpenAI.

## Tecnologías

- **FastAPI**: Framework web para Python.
- **Ollama**: Para ejecutar modelos de lenguaje locales (gratis).
- **OpenAI API**: Como alternativa (requiere clave API).
- **Python-dotenv**: Para gestionar variables de entorno.

## Instalación y Configuración (Ollama - Recomendado, Gratis!)

### Paso 1: Instalar Ollama
1. Descarga Ollama desde [https://ollama.com/](https://ollama.com/) e instálalo.
2. Abre una terminal y verifica que esté funcionando:
   ```bash
   ollama --version
   ```

### Paso 2: Descargar un modelo de lenguaje
El modelo **recomendado para velocidad** es **phi3** (muy pequeño y rápido, perfecto para desarrollo):
```bash
ollama pull phi3
```

Otros modelos:
- **Más rápidos**:
  - `tinyllama`: El más rápido, pero menos preciso.
  - `phi3`: Equilibrio perfecto entre velocidad y calidad.
- **Equilibrados**:
  - `llama3.2`: Bueno en español, un poco más lento.
  - `mistral`: Buen rendimiento general.
- **Mayor calidad**:
  - `llama3.1`: Excelente, pero requiere más recursos.

### Paso 3: Instalar dependencias del bot
1. Ve al directorio del bot:
   ```bash
   cd ai-bot
   ```
2. Crea un entorno virtual:
   ```bash
   python -m venv venv
   ```
3. Activa el entorno virtual:
   - **Windows**:
     ```bash
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
4. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

### Paso 4: Configurar variables de entorno
El archivo `.env` ya está configurado para usar Ollama y el modelo `phi3` (rápido). Si quieres cambiar algo:
```env
USE_OLLAMA=true
OLLAMA_MODEL=phi3  # Cambia esto por el modelo que prefieras
PORT=8001  # Puerto del servidor (no usar 3001, que es el backend)
```

## Ejecución

1. **Asegúrate de que Ollama esté corriendo** (debería estar en segundo plano después de instalarlo).
2. Inicia el bot:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```
3. El servidor estará disponible en `http://localhost:8001`.

## 🚀 Tips para acelerar el bot

Si el bot se tarda mucho en responder, prueba estos consejos:

### 1. Usa un modelo más pequeño
El modelo `phi3` es ideal para velocidad. Si quieres aún más velocidad, prueba `tinyllama`:
```bash
ollama pull tinyllama
```
Luego cambia `OLLAMA_MODEL=tinyllama` en el archivo `.env`.

### 2. Cierra otras aplicaciones
Ollama usa la CPU/GPU de tu equipo. Cierra apps que consumen muchos recursos para que el bot responda más rápido.

### 3. Verifica que Ollama esté usando GPU (si tienes)
Si tienes una tarjeta gráfica NVIDIA, Ollama la usará automáticamente. Asegúrate de tener los drivers actualizados.

### 4. Reduce la longitud de las respuestas
Si las respuestas son muy largas, el bot tarda más. En el archivo `main.py`, puedes ajustar los prompts para pedir respuestas más concisas.

## Uso con OpenAI (Alternativa)

Si prefieres usar OpenAI en lugar de Ollama (más rápido, pero requiere API key):
1. Edita el archivo `.env`:
   ```env
   USE_OLLAMA=false
   OPENAI_API_KEY=tu_clave_aqui
   OPENAI_MODEL=gpt-4o-mini  # Modelo rápido y económico
   ```
2. Sigue los pasos de instalación igual (no necesitas Ollama).

## Endpoints

### 1. GET /
Ruta de prueba para verificar que el servidor está funcionando.

**Respuesta**:
```json
{
  "message": "Chambea AI Bot está funcionando!",
  "version": "2.0.0",
  "engine": "Ollama",
  "model": "phi3"
}
```

### 2. POST /api/chat
Endpoint para el chat interactivo.

**Solicitud**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "¿Cómo puedo mejorar mi perfil?"
    }
  ],
  "context": {
    "employer_type": "empresa",
    "company_name": "Tech Corp",
    "bio": "Empresa de tecnología"
  }
}
```

**Respuesta**:
```json
{
  "response": "Para mejorar tu perfil, te recomiendo..."
}
```

### 3. POST /api/suggestions
Endpoint para obtener sugerencias predefinidas.

**Tipos de sugerencias**:
- `bio`: Sugerencias para la biografía del empleador.
- `company_description`: Sugerencias para la descripción de la empresa.
- `general`: Consejos generales para mejorar el perfil.

**Solicitud**:
```json
{
  "type": "bio",
  "context": {
    "employer_type": "empresa",
    "years_as_employer": 5,
    "company_name": "Tech Corp"
  }
}
```

**Respuesta**:
```json
{
  "suggestions": [
    "Sugerencia 1...",
    "Sugerencia 2...",
    "Sugerencia 3..."
  ]
}
```

## Próximos pasos

- [ ] Agregar soporte para más modelos de lenguaje.
- [ ] Mejorar la personalización de las sugerencias.
- [ ] Agregar sistema de autenticación para el API.
- [ ] Implementar logging avanzado.

# Documentación Técnica - Proyecto Chambea

## 📋 Índice
- [Descripción General](#descripción-general)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Módulos Principales](#módulos-principales)
- [Sistema de Configuración](#sistema-de-configuración)
- [Sistema de Excepciones y Filtros](#sistema-de-excepciones-y-filtros)
- [Base de Datos y Entidades](#base-de-datos-y-entidades)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Comunicación en Tiempo Real](#comunicación-en-tiempo-real)
- [Estructura de Archivos](#estructura-de-archivos)
- [Bot AI](#bot-ai)

---

## ✅ Actualizaciones 2026-06-26 (UX de perfiles y mejora visual del bot)

### Frontend: Bot AI más legible en edición de perfil
- `client/src/components/ProfileAssistant.tsx` fue ajustado para mejorar lectura y uso del chat:
  - El contenedor del asistente se amplió para ocupar más ancho en escritorio.
  - El área de conversación aumentó su altura útil para mostrar respuestas más largas sin sentirse comprimida.
  - El encabezado del bot ahora usa jerarquía visual más clara.
  - Las burbujas de mensajes se hicieron más anchas y con mejor interlineado.
  - Las sugerencias rápidas ganaron más padding y separación vertical.
  - El campo de entrada inferior se amplió para escribir preguntas con más comodidad.
- Resultado visual:
  - El bot ocupa mejor el espacio disponible.
  - Las respuestas del asistente se leen con mayor claridad.
  - La experiencia general del chat es más cercana a un modal de conversación real y no a una tarjeta pequeña.

### Frontend: `ProfileEditPage` reorganizado y unificado
- `client/src/pages/ProfileEditPage.tsx` fue reestructurado para mejorar consistencia visual del formulario de edición:
  - Los botones `Volver al perfil` y `Guardar cambios` se cambiaron de texto a iconos.
  - Ambos iconos quedaron alineados horizontalmente en la cabecera.
  - El formulario dejó de depender de distribuciones improvisadas por bloque y ahora usa una grilla uniforme para los campos.
  - Los campos largos como `Bio`, `Descripción`, `Sitio web` y otros textos extensos ahora ocupan todo el ancho lógico cuando conviene.
  - Se reorganizó el orden de los campos del bloque `Empresa` para agrupar mejor identidad, clasificación, contacto y descripción.
- En `client/src/App.css` se añadieron nuevas clases para soportar esa estructura:
  - `.edit-profile-form`
  - `.edit-profile-header`
  - `.edit-profile-grid`
  - `.edit-profile-field`
  - `.edit-profile-field-span`
  - `.edit-profile-textarea`
- Esto permitió un layout más limpio, uniforme y responsive en la edición de perfil.

### Frontend: selector de archivo reemplazado por iconos
- En `client/src/pages/ProfileEditPage.tsx` se reemplazó el input de archivo visible (`Seleccionar archivo`) por un flujo más limpio:
  - El `input[type="file"]` quedó oculto.
  - Se añadieron botones con icono para subir/cambiar logo.
  - Se mantuvo la vista previa del logo actual o seleccionado.
  - Se conservó el botón para quitar logo como acción separada.
- Se agregaron referencias (`useRef`) para disparar el selector de archivo desde botones icon-only.
- En `client/src/App.css` se añadieron estilos específicos:
  - `.edit-profile-logo-card`
  - `.edit-profile-logo-preview`
  - `.edit-profile-logo-actions`
  - `.edit-profile-logo-meta`
  - `.edit-profile-icon-btn`
- Resultado:
  - El área de logo se integra mejor con el resto del formulario.
  - Se elimina el aspecto nativo inconsistente del selector de archivos del navegador.

### Frontend: campos del formulario con mayor contraste
- En `client/src/App.css` se reforzó el estilo base de `.form-input`:
  - Borde actualizado a `1px solid #111111`.
- Este cambio aplica a:
  - `input`
  - `select`
  - `textarea`
- Objetivo:
  - Hacer que los cuadros de texto y selección resalten más dentro de la tarjeta de edición.

### Frontend: consistencia tipográfica en la vista `Mi perfil`
- `client/src/pages/ProfilePage.tsx` fue ajustado para que el título principal:
  - `Mi perfil`
  use la clase `.page-title`.
- Con esto, el encabezado de la vista de perfil ahora coincide con la jerarquía visual usada en títulos como `Editar perfil`.

### Verificación realizada
- Se revisaron diagnósticos después de los cambios en:
  - `client/src/components/ProfileAssistant.tsx`
  - `client/src/pages/ProfileEditPage.tsx`
  - `client/src/pages/ProfilePage.tsx`
  - `client/src/App.css`
- No quedaron errores reportados por el editor tras los ajustes aplicados.

### Resultado general del día
- La edición de perfil quedó más ordenada, más uniforme y visualmente más profesional.
- El bot AI ahora tiene una interfaz más amplia y cómoda para leer respuestas largas.
- La vista de perfil mantiene una tipografía más consistente con el resto del frontend.

---

## ✅ Actualizaciones 2026-06-21 (Admin real completo)

### Backend: Rol admin real y autorización
- Se agregó el nuevo valor `admin` al enum `UserType` en `src/shared/enums/db.enum.ts`.
- El flujo normal de selección de rol en `POST /user/select-role` sigue limitado a `worker` y `employer`.
- El rol `admin` no puede elegirse desde la UI de selección de rol; queda reservado para administración.
- Se añadió promoción automática a admin por correo usando la variable de entorno `ADMIN_EMAILS`.
- La promoción ocurre en:
  - `src/modules/auth/auth.service.ts` al iniciar sesión.
  - `src/modules/auth/strategies/jwt-user.strategy.ts` al validar el token.
- Si el correo está en `ADMIN_EMAILS`, el backend actualiza automáticamente:
  - `user_type = admin`
  - `account_status = active`

### Backend: Nuevo módulo `admin/`
- Se creó `src/modules/admin/admin.module.ts`.
- Se creó `src/modules/admin/admin.controller.ts` con endpoints protegidos por:
  - `JwtUserAuthGuard`
  - `AdminAuthGuard`
- Se creó `src/modules/auth/guards/admin-auth.guard.ts` para restringir acceso solo a usuarios con `user.user_type === admin`.
- Se creó `src/modules/admin/admin.service.ts` con la lógica del panel.

### Endpoints de administración
- `GET /admin/overview`
  - Devuelve métricas generales del panel:
    - Total de empresas
    - Total de empleos
    - Total de empleos activos
    - Total de empleos sin empresa asociada
- `GET /admin/companies`
  - Devuelve el listado de empresas con resumen administrativo:
    - Nombre
    - RIF
    - Industria
    - Tamaño
    - Estado de verificación
    - Conteo de empleos
    - Conteo de empleos activos
    - Fecha del empleo más reciente
- `GET /admin/companies/:id/jobs`
  - Devuelve el detalle de una empresa y sus empleos registrados.

### Frontend: Soporte para rol admin
- `client/src/types/index.ts` actualizado para soportar `role: 'admin'`.
- `client/src/services/authService.ts` ahora mapea `user_type=admin` del backend al cliente.
- `client/src/hooks/useAuth.tsx` mantiene la selección manual de rol solo para `worker` y `employer`.
- `client/src/App.tsx` actualizado con:
  - `RequireRole` compatible con `admin`
  - Ruta protegida `/admin`
  - Enlace `Panel admin` dentro del menú del usuario admin autenticado

### Frontend: Panel de administración
- Se creó `client/src/services/adminService.ts` para consumir la API de administración.
- Se creó `client/src/pages/AdminDashboardPage.tsx` con:
  - Tarjetas de métricas
  - Buscador de empresas por nombre, RIF o industria
  - Lista lateral de empresas registradas
  - Panel de detalle de empresa
  - Listado de empleos por empresa
- Ajustes de UX aplicados al panel:
  - Se eliminó el subtítulo de la cabecera para dejar solo `Panel de Admin`.
  - Las descripciones de empleos quedaron alineadas a la izquierda.
  - Los títulos de empleos quedaron sin sangría visual.
  - La metadata `work_mode` y `rate_type` se tradujo al español:
    - `remote` → `Remoto`
    - `hybrid` → `Hibrido`
    - `onsite` → `Presencial`
    - `hourly` → `Por hora`
    - `fixed` → `Monto fijo`
  - Si el estado de verificación de la empresa es `pending`, no se muestra en la UI.

### Frontend: Vista detalle de empleo
- `client/src/pages/JobDetailPage.tsx` actualizado para que el mensaje:
  - `Inicia sesión para ver acciones disponibles.`
  no se muestre cuando el usuario autenticado tiene rol `admin`.

### Configuración de entorno para admin
- Se añadió en `.env`:

```env
ADMIN_EMAILS=admin@chambea.local
```

- Esta variable permite definir uno o varios correos admin separados por comas.
- Ejemplo:

```env
ADMIN_EMAILS=admin@chambea.local,otroadmin@empresa.com
```

### Usuario admin local de desarrollo
- Se creó un usuario admin local en la base de datos para pruebas de desarrollo.
- Credenciales configuradas:
  - Email: `admin@chambea.local`
  - Contraseña: `AdminChambea2026!`
- Estado esperado del usuario:
  - `user_type = admin`
  - `account_status = active`
  - `email_verified = true`

### Verificación funcional
1. Reiniciar backend para cargar `ADMIN_EMAILS` del `.env`.
2. Iniciar sesión con `admin@chambea.local`.
3. Abrir `/admin`.
4. Validar:
  - Visualización del panel
  - Listado de empresas
  - Selección de empresa
  - Visualización de empleos asociados
  - Acceso al detalle de empleo sin mensaje de login

### Notas
- El panel admin actual es de lectura administrativa:
  - Ver empresas
  - Ver métricas
  - Ver empleos por empresa
- Como mejora futura se pueden agregar acciones administrativas:
  - Verificar empresas
  - Activar/desactivar empleos
  - Eliminar empleos
  - Suspender cuentas

---

## ✅ Actualizaciones 2026-06-21 (Bot AI con Ollama para Empleadores y Trabajadores)

### Bot AI: Servicio en Python con soporte para ambos roles
- **Directorio** `ai-bot/` con servicio independiente:
  - `main.py`: Servidor FastAPI con endpoints de chat y sugerencias.
  - `requirements.txt`: Dependencias (fastapi, uvicorn, python-dotenv, ollama).
  - `.env.example` y `.env`: Configuración del modelo y puerto.
  - `README.md`: Documentación detallada del bot.
  - **Funcionalidades clave**:
    - Endpoint `GET /`: Health check y estado del bot.
    - Endpoint `POST /api/chat`: Chat interactivo personalizado para ambos roles.
    - Endpoint `POST /api/suggestions`: 
      - Para empleadores: sugerencias de biografía, descripción de empresa y consejos generales.
      - Para trabajadores: sugerencias de biografía, descripción de habilidades y consejos generales.
    - Soporte para modelos locales de Ollama (phi3, llama3.2, tinyllama, etc.).
    - Prompts personalizados en español para ambos roles.

### Frontend: Asistente AI adaptado para ambos roles
- **Actualizado componente** `client/src/components/ProfileAssistant.tsx`:
  - Nuevo prop `userRole` para especificar el rol del usuario (worker o employer).
  - UI adaptada según el rol:
    - Mensaje de bienvenida personalizado.
    - Botones de sugerencias específicos para cada rol (incluye “Ayúdame a describir mis habilidades” para workers).
    - Indicador del rol del usuario en la cabecera.
  - Conectado al servicio Python en `http://localhost:8001`.
  - Mejorado el indicador de carga:
    - Spinner animado en botones mientras se generan sugerencias.
    - Mensaje “Escribiendo…” en el chat mientras el bot responde.
  - Deshabilitados botones y entrada de texto mientras el bot carga.
- **Configuración del bot**:
  - URL del API del bot en `const AI_BOT_API_URL = "http://localhost:8001"`.
  - Modelo por defecto en `const DEFAULT_MODEL = "phi3"`.

### Configuración de Ollama
- **Modelos rápidos recomendados**:
  - `phi3`: Equilibrio perfecto entre velocidad y calidad (predeterminado).
  - `tinyllama`: Modelo extremadamente rápido, aunque menos preciso.
- **Endpoint compatible con OpenAI**: Ollama ofrece una API compatible con la de OpenAI en `http://localhost:11434/v1`, para reutilizar código existente sin clave API.

### Ejecución del Bot AI
1. Instalar Ollama desde [https://ollama.com/](https://ollama.com/).
2. Descargar un modelo: `ollama pull phi3`.
3. Navegar al directorio `ai-bot/`.
4. Crear entorno virtual: `python -m venv venv`.
5. Activar entorno: `.venv\Scripts\activate` (Windows).
6. Instalar dependencias: `pip install -r requirements.txt`.
7. Ejecutar bot: `python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload`.
8. El bot estará disponible en `http://localhost:8001/`.

### Próximos pasos sugeridos
- Integrar el ProfileAssistant en las páginas de onboarding y edición de perfil para trabajadores.
- Migrar el bot a un subdominio o puerto específico en producción.
- Implementar autenticación para el API del bot.
- Añadir logging y monitoreo.
- Probar otros modelos de Ollama y ajustar los prompts.

---

## ✅ Actualizaciones 2026-06-20 (Tailwind, Homepage y Asistente AI)

### Frontend: Configuración de Tailwind CSS
- Instaladas dependencias: `tailwindcss@^3`, `postcss`, `autoprefixer` en `client/`.
- Creados archivos de configuración:
  - `client/tailwind.config.js`: Configuración básica de Tailwind, incluyendo soporte para JSX/TSX y paleta de colores personalizada.
  - `client/postcss.config.js`: Configuración de PostCSS con `tailwindcss` y `autoprefixer`.
- Actualizado `client/src/index.css`: Incluye directivas `@tailwind base`, `@tailwind components` y `@tailwind utilities`.
- Configurado `client/vite.config.ts`: (Nota: para Tailwind 4, pero revertido a 3 para mayor compatibilidad; Vite config está limpio para Tailwind 3.)

### Frontend: Página Principal Rediseñada
- **HomePage.tsx**:
  - Eliminada la sección hero grande para usuarios no autenticados.
  - Ahora muestra directamente las ofertas de trabajo como contenido principal para todos los usuarios.
  - Actualizada para cargar ofertas tanto para usuarios autenticados (con `jobService.searchJobsAuthenticated`) como para visitantes (con `jobsService.listJobs`).
  - Añadidas funciones helpers (`getJobId`, `getJobTitle`, `getCompanyName`, `getWorkMode`) para manejar ambos tipos de datos.
  - Mantenido el botón flotante de chat para usuarios autenticados.
  - Mantenido el botón de crear oferta solo para empleadores autenticados.
  
- **App.tsx (Navegación)**:
  - Añadido botón de “Iniciar Sesión” en la barra de navegación para visitantes no autenticados.
  - Eliminado el botón de “Registrarse” para simplificar la UI, manteniendo solo el botón principal de login.

### Frontend: Asistente AI para Perfiles de Empleador
- **Nuevo componente** `client/src/components/ProfileAssistant.tsx`:
  - Chatbot interactivo que ayuda a los empleadores a mejorar su perfil.
  - Funcionalidades principales:
    - Sugerencias predefinidas para biografía, descripción de empresa y consejos generales.
    - Interfaz de chat para preguntas personalizadas (simulada, lista para conectar a API real).
    - Botón flotante en la esquina inferior derecha para abrir/cerrar el asistente.
    - Función `onSuggestion` para aplicar automáticamente las sugerencias a los campos del formulario.
    
- **Integración en páginas**:
  - `client/src/pages/EmployerOnboardingPage.tsx`:
    - Añadido el componente `ProfileAssistant` que lee el estado del formulario.
    - Añadida función `handleSuggestion` para aplicar las sugerencias al estado del formulario.
  - `client/src/pages/ProfileEditPage.tsx`:
    - Añadido el componente `ProfileAssistant` solo para usuarios con rol `employer`.
    - Añadida función `handleSuggestion` para aplicar las sugerencias al estado del formulario de edición.

### Backend: Corrección de Configuración de BD
- **.env**: Corregido typo `DB_PORT==5436` → `DB_PORT=5436`.
- **docker-compose.yml**:
  - Actualizado para usar credenciales del `.env`: `POSTGRES_USER=user`, `POSTGRES_PASSWORD=clave`, `POSTGRES_DB=chambea`.
  - Actualizado puerto `5436:5432` para coincidir con la configuración del proyecto.

### Próximos pasos sugeridos
- Migrar estilos personalizados de `App.css` a clases de Tailwind CSS gradualmente.
- Conectar el asistente AI a una API real (OpenAI, Anthropic, o servicio propio).
- Añadir más sugerencias predefinidas según necesidades de los empleadores.
- Mejorar la UI del asistente con animaciones y temas personalizados.

---

## 🎯 Descripción General

**Chambea** es una API backend desarrollada con NestJS que funciona como una plataforma de servicios para conectar trabajadores (workers) con empleadores (employers). Similar a plataformas como Upwork o Fiverr, pero enfocada al mercado hispanohablante.

### Tecnologías Principales
- **Framework**: NestJS (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT (RS256) + Google OAuth
- **WebSockets**: Socket.IO para chat en tiempo real
- **Documentación**: Swagger/OpenAPI
- **Logging**: Pino
- **Email**: Nodemailer con plantillas Pug
- **Validación**: class-validator y class-transformer

---

## ✅ Actualizaciones 2025-11-10 (Aplicaciones y Frontend)

### Backend (Aplicaciones)
- Añadido endpoint `GET /applications/my` protegido con `JwtUserAuthGuard` para que un trabajador autenticado obtenga sus propias postulaciones.
- Implementado método de servicio `listMine(user: User)` que:
  - Verifica que el `user.user_type` sea `WORKER`.
  - Resuelve el perfil `Worker` del usuario.
  - Retorna las postulaciones ordenadas por `created_at DESC`.
- La entidad `JobApplication` carga de forma eager las relaciones `job` y `worker`, por lo que el endpoint incluye `job` y `worker` embebidos.

Ejemplo de respuesta (`200 OK`):
```json
[
  {
    "application_id": "a1b2c3-...",
    "status": "applied",
    "cover_letter": "(si existe)",
    "created_at": "2025-11-10T14:30:00.000Z",
    "updated_at": "2025-11-10T14:30:00.000Z",
    "job": {
      "job_id": "j123-...",
      "title": "Desarrollador Frontend",
      "company": {
        "company_id": "c789-...",
        "company_name": "TechCorp Solutions C.A."
      }
    },
    "worker": {
      "id": "w456-..."
    }
  }
]
```

### Cliente (Servicios de Aplicaciones)
- `client/src/services/applicationsService.ts`:
  - `ApplicationItem` ahora incluye `cover_letter?: string`.
  - `listMyApplications()` mapea la respuesta del backend a:
    - `id` ← `application_id`
    - `status` ← `status`
    - `applied_at` ← `created_at`
    - `cover_letter` ← `cover_letter`
    - `job.id` ← `job.job_id`
    - `job.title` ← `job.title`
    - `job.company_name` ← `job.company.company_name`
  - Se mantiene `listApplicationsByJob()` para empleador y se expandió previamente el modelo `EmployerApplicationItem` con `first_name`, `last_name` y `cover_letter`.

### Frontend (Vistas)
- Empleador (`EmployerJobApplicationsPage.tsx`):
  - Tarjetas más grandes con sombra y bordes redondeados.
  - Visualización del nombre y apellido del postulante; iniciales en avatar.
  - Sección “Carta de presentación” visible.
  - Botones con colores más contrastados y alto uniforme (`44px`).
  - Ajuste de tamaño consistente entre acciones (preseleccionar, entrevista, contratar, rechazar).

- Trabajador (`WorkerApplicationsPage.tsx`):
  - Tarjetas más grandes, badge de estado con color y etiqueta en español.
  - Fecha en formato `es-ES`.
  - Se eliminó la sección de “Carta de presentación” conforme a requerimiento.
  - Botones con altura uniforme (`44px`); “Retirar postulación” disponible solo si el estado es aplicado/pending.

### Notas de Accesibilidad y UX
- Botones de acción en ambas vistas con altura uniforme para mejorar la consistencia visual.
- Colores de estado normalizados: `Aplicado`, `Preseleccionado`, `Entrevista`, `Contratado`, `Rechazado`, `Retirado`.

### Próximos pasos sugeridos
- Filtros por estado y buscador (título/empresa) en “Mis postulaciones”.
- Paginación en listados con muchas entradas.
- Opcional: estados con iconos y descripciones breves.

---

## ✅ Actualizaciones 2025-11-12 (Perfil, Empresa y UX)

### Backend (Empresa)
- `company.entity.ts`: El campo `company_logo_url` es `nullable` (`@Column({ nullable: true })`). Permite almacenar `string | null`.
- `update-company.dto.ts`: `company_logo_url?: string` con `@IsOptional()` y `@IsUrl()`. Para borrar el logo se debe enviar `null`; una cadena vacía falla la validación de `@IsUrl()`.
- `company.service.ts`: `update()` usa `Object.assign(company, dto)`; al recibir `company_logo_url: null` persiste `NULL` en BD.
- `employer.service.ts`: `updateCompany()` pasa `company_logo_url` directamente al servicio de compañía. Endpoint relevante: `PATCH /employer/companies/:id`.

### Frontend (Perfil y Empresa)
- `client/src/services/employerService.ts`: `UpdateCompanyPayload['company_logo_url']` actualizado a `string | null` para permitir limpiar el logo sin errores de tipos.
- `client/src/pages/ProfilePage.tsx`:
  - Botón “Quitar” del logo ahora envía `{ company_logo_url: null }` al backend.
  - Botón “Borrar cuenta” convertido a icono-only circular, junto al botón de editar. Usa la clase `icon-button` (36x36, borde redondo) y mantiene `aria-label`, `title` y `aria-busy` durante la operación.
  - Contenedor `hero-actions` ajustado a fila (`display: flex`, `flexDirection: 'row'`, `gap: 8`) para alinear los iconos lado a lado.
- `client/src/pages/ProfileEditPage.tsx`:
  - `handleRemoveCompanyLogo` actualizado para enviar `{ company_logo_url: null }` al limpiar el logo.
  - Botón de quitar logo cambiado a icon-only (solo ícono de basurero), conservando `aria-label` y `title`.
- `client/src/pages/EmployerOnboardingPage.tsx`: Botón de limpiar logo en onboarding actualizado a icon-only (sin texto “Quitar”), manteniendo la accesibilidad.
- `client/src/App.css`: Se reutiliza `.icon-button` para estilo circular consistente (inline-flex, 36x36, `border-radius: 9999px`).

### Accesibilidad y UX
- Todos los botones icon-only incluyen `aria-label` y `title` descriptivos.
- Botones que realizan operaciones asíncronas exponen `aria-busy` y se deshabilitan mientras cargan.
- Se estandariza la presentación de iconos para limpieza/borrado mediante un ícono de basurero.

### Comportamiento esperado y pruebas rápidas
- Limpieza de logo de empresa:
  - Acciones en Perfil y Editar Perfil envían `company_logo_url: null`.
  - El backend omite `@IsUrl()` por `@IsOptional()` y persiste `NULL` en columna `company_logo_url`.
  - Tras refrescar, el logo ya no aparece.
- Borrado de cuenta (Perfil):
  - Al hacer clic en el icono de basurero, se muestra confirmación.
  - Se llama `userService.deleteMe()`, se cierra sesión y se navega a `/`.

### Racional técnico
- `@IsOptional()` solo omite validación cuando el valor es `undefined` o `null`. Por eso sustituimos la cadena vacía por `null` para limpieza de campos opcionales con validación específica (`@IsUrl`).
- Mantener el tipo `string | null` en el cliente evita errores de TypeScript y asegura payloads correctos para el backend.

---

## 🏗️ Arquitectura del Proyecto

### Estructura Modular
El proyecto sigue la arquitectura modular de NestJS con separación clara de responsabilidades:

```
src/
├── modules/          # Módulos de funcionalidad
├── config/           # Configuraciones
├── exceptions/       # Excepciones personalizadas
├── filters/          # Filtros de manejo de errores
├── shared/           # Recursos compartidos
└── templates/        # Plantillas de email
```

### Patrón de Diseño
- **Módulos**: Cada funcionalidad principal está encapsulada en su propio módulo
- **Servicios**: Lógica de negocio separada de controladores
- **Repositorios**: Acceso a datos abstraído
- **DTOs**: Validación y transformación de datos
- **Guards**: Protección de rutas con autenticación/autorización

---

## 📦 Módulos Principales

### 1. Módulo de Autenticación (`auth/`)

**Propósito**: Manejo completo de autenticación y autorización

**Componentes**:
- `auth.controller.ts`: Endpoints de login, registro, OAuth
- `auth.service.ts`: Lógica de autenticación, generación de tokens
- `auth.module.ts`: Configuración del módulo con JWT y Passport

**Estrategias**:
- `strategies/jwt-user.strategy.ts`: Validación de tokens JWT
- `strategies/google.strategy.ts`: Autenticación con Google OAuth

**Guards**:
- Protección de rutas que requieren autenticación
- Validación de roles de usuario

**DTOs**:
- Validación de datos de login/registro
- Transformación de respuestas de autenticación

### 2. Módulo de Usuario (`user/`)

**Propósito**: Gestión de perfiles y datos de usuarios

**Componentes**:
- `user.controller.ts`: CRUD de usuarios, gestión de perfiles
- `user.entity.ts`: Entidad principal con campos de usuario
- `user.repository.ts`: Acceso a datos de usuarios
- `user.query.service.ts`: Consultas complejas y filtros
- `user.module.ts`: Configuración del módulo

**Características de la Entidad User**:
- **Tipos de usuario**: Admin, Worker, Employer, Pending
- **Estados de cuenta**: Pending verification, Active, Suspended, etc.
- **Verificación**: Email y teléfono con códigos
- **Campos principales**: email, nombre, apellido, teléfono, foto de perfil
- **Relaciones**: Mensajes enviados y recibidos

### 3. Módulo de Worker (`worker/`)

**Propósito**: Gestión específica de perfiles de trabajadores

**Componentes**:
- `worker.controller.ts`: Endpoints específicos para workers
- `worker.entity.ts`: Datos profesionales del trabajador
- `worker.service.ts`: Lógica de negocio para workers
- `worker.repository.ts`: Acceso a datos de workers

**Características de la Entidad Worker**:
- **Perfil profesional**: biografía, años de experiencia
- **Sistema de tarifas**: tipo, monto, moneda
- **Disponibilidad**: estado actual del worker
- **Verificación de identidad**: tipo y número de documento (V, E, P, G)
- **Ubicación**: dirección base para servicios
- **Relación**: Conectado a User mediante foreign key

### 4. Módulo de Employer (`employer/`)

**Propósito**: Gestión específica de perfiles de empleadores y empresas

**Componentes**:
- `employer.controller.ts`: Endpoints específicos para employers
- `employer.entity.ts`: Datos del empleador
- `employer.service.ts`: Lógica de negocio para employers
- `company.entity.ts`: Entidad de empresas
- `address.entity.ts`: Entidad de direcciones

**Características de la Entidad Employer**:
- **employer_id**: UUID (Primary Key) (**CORREGIDO**)
- **Relación con User**: ManyToOne mediante user_id
- **Relación con Company**: ManyToOne mediante company_id
- **Campos**: position, department, hire_date
- **Timestamps**: createdAt, updatedAt

**Características de la Entidad Company**:
- **company_id**: UUID (Primary Key) (**CORREGIDO**)
- **Información básica**: name, description, industry
- **Configuración**: size, website, phone
- **Relación con Address**: OneToOne para ubicación
- **Timestamps**: createdAt, updatedAt

**Endpoints del Controller**:
- `GET /employer` - Obtener todos los employers
- `GET /employer/profile` - Obtener perfil del employer autenticado
- `GET /employer/:id` - Obtener employer por ID
- `PATCH /employer/:id` - Actualizar employer
- `PATCH /employer/profile` - Actualizar perfil del employer autenticado

**Correcciones Recientes**:
- ✅ Corregido uso de `_id` por `employer_id` en employer.controller.ts
- ✅ Corregido uso de `_id` por `company_id` en employer.service.ts
- ✅ Eliminados métodos duplicados en employer.controller.ts
- ✅ Implementado manejo correcto de NotFoundException
- ✅ Corregida asignación de `company_address_id` en createEmployer
- ✅ Ajustada sintaxis de NotFoundException.RESOURCE_NOT_FOUND

#### Actualizaciones 2025-10-28 (Employer/Company y Frontend)

**Backend (NestJS)**
- Endpoints añadidos para lectura del perfil y empresa del empleador autenticado:
  - `GET /employer/me` → Devuelve el perfil del empleador del usuario autenticado, incluyendo asociaciones con `user` y `company`.
  - `GET /employer/companies/my` → Devuelve la empresa asociada al empleador actual. Incluye la dirección (`company_address`) si existe.
- Estructura actual de creación/actualización de empresa:
  - `POST /employer/companies` y `PATCH /employer/companies/:id` aceptan `company_address` como objeto anidado. Ejemplo de payload:

```json
{
  "company_name": "TechCorp Solutions C.A.",
  "company_rif": "J-12345678-3",
  "industry": "technology",
  "company_size": "startup",
  "company_description": "Empresa líder en soluciones tecnológicas",
  "company_website": "https://techcorp.example",
  "company_phone": "+58-212-1234567",
  "company_email": "contacto@techcorp.example",
  "employee_count": 150,
  "founded_year": 2010,
  "company_logo_url": "https://techcorp.example/logo.png",
  "company_address": {
    "country": "Venezuela",
    "state": "Miranda",
    "city": "Guatire",
    "address_line": "Av. Principal, Torre X",
    "postal_code": "1060"
  }
}
```

- Entidades relevantes:
  - `Company`: `company_id`, `company_name`, `company_rif`, `industry`, `company_size`, `employee_count`, `founded_year`, `company_logo_url`, relación `ManyToOne` con `Address` como `company_address`.
  - `Address`: `country`, `state`, `city`, `address_line`, `postal_code`, etc.

**Frontend (React/Vite)**
- Servicios (`client/src/services/employerService.ts`):
  - Añadidos métodos de lectura: `getMyProfile()` y `getMyCompany()`.
  - Tipos exportados: `EmployerProfile` y `Company` para tipar las respuestas.
- Perfil de usuario (`client/src/pages/ProfilePage.tsx`):
  - Carga condicional de datos de empleador y empresa cuando `user.role === 'employer'`.
  - Renderiza detalles de empresa (nombre, RIF, industria, tamaño, empleados, fundación, website, email, teléfono, logo y dirección).
  - Enlace de “Configurar empresa” actualizado a `"/onboarding/employer?step=company"` si no existe empresa.
- Onboarding de empleador (`client/src/pages/EmployerOnboardingPage.tsx`):
  - Soporte de query params para navegar directo al paso de empresa:
    - `step=company` (o `step=2` o `company=1`) → setea `currentStep=2` y `employer_type='company'`.
  - Selects de “Industria” y “Tamaño” usan objetos `{ value, label }` para evitar errores (`TypeError: opt.replace is not a function`).
  - Validación de RIF con dígito verificador calculado en cliente antes de enviar.

**Verificación funcional**
- Iniciar backend `npm run start:dev` en `http://localhost:3001` y frontend `npm run dev` en `http://localhost:5173`.
- Iniciar sesión como usuario con rol `employer` y completar onboarding.
- Visitar `/profile` y confirmar:
  - Bloque “Perfil de Empleador” muestra tipo, bio y años.
  - Bloque “Empresa” muestra los campos si existe; si no, el enlace lleva directo al paso de empresa.

**Notas y próximas mejoras**
- Redirigir automáticamente al perfil si ya existe empresa al abrir `onboarding/employer?step=company`.
- Mapear en el perfil los valores de `industry` y `company_size` a etiquetas en español.
- Endpoints de lectura documentados arriba reemplazan antiguas rutas (`/employer/profile`); usar las nuevas rutas en integraciones futuras.

### 5. Módulo de Admin (`admin/`)

**Propósito**: Centralizar acceso administrativo para visualizar empresas registradas y empleos asociados

**Componentes**:
- `admin.module.ts`: Registro del módulo administrativo
- `admin.controller.ts`: Endpoints protegidos del panel admin
- `admin.service.ts`: Lógica de agregación y lectura del dashboard
- `auth/guards/admin-auth.guard.ts`: Guard de autorización por rol admin

**Funcionalidades**:
- Métricas globales del sistema para administración
- Listado de empresas con resumen operativo
- Consulta de empleos por empresa
- Protección por JWT + validación de rol admin

### 6. Módulo de Chat (`chat/`)

**Propósito**: Sistema de mensajería en tiempo real

**Componentes**:
- `chat.controller.ts`: Endpoints REST para historial de mensajes
- `chat.gateway.ts`: WebSocket gateway para tiempo real
- `chat.service.ts`: Lógica de mensajería
- `chat-message.entity.ts`: Entidad de mensajes

**Funcionalidades**:
- **WebSockets**: Conexión en tiempo real con Socket.IO
- **Autenticación JWT**: Validación de tokens en WebSocket
- **Salas de chat**: Usuarios pueden unirse a conversaciones
- **Persistencia**: Mensajes guardados en base de datos
- **Eventos**: `join`, `createMessage`, `disconnect`

### 7. Módulo de Email (`mail/`)

**Propósito**: Envío de emails transaccionales

**Componentes**:
- `email.service.ts`: Servicio de envío de emails
- `email.module.ts`: Configuración de Nodemailer

**Funcionalidades**:
- **Plantillas**: Uso de Pug para emails HTML
- **Emails transaccionales**: Verificación, recuperación de contraseña
- **Configuración SMTP**: Configurable por variables de entorno

---

## ⚙️ Sistema de Configuración

### Estructura de Configuración (`config/`)

**Archivos principales**:
- `index.ts`: Configuración principal que combina todas las configs
- `database.config.ts`: Configuración de MongoDB (legacy)
- `jwt.config.ts`: Configuración de claves JWT (RS256)
- `typeorm.config.ts`: Configuración de TypeORM y PostgreSQL

**Características**:
- **Variables de entorno**: Todas las configs son configurables
- **Tipado**: Interfaces TypeScript para type safety
- **Configuración global**: Disponible en toda la aplicación
- **Múltiples entornos**: Development, production, testing

### Variables de Entorno Importantes (Actualizadas 2025-10-24)
```env
# Servidor
PORT=3001
NODE_ENV=development
CLUSTERING=false

# Base de datos (Docker: chambea-postgres-1)
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASSWORD=
DB_NAME=chambea

# JWT
JWT_PRIVATE_KEY=<base64_private_key>
JWT_PUBLIC_KEY=<base64_public_key>
JWT_EXPIRATION_TIME=15min

# Admin
ADMIN_EMAILS=admin@chambea.local
```

- El backend lee `PORT` desde `src/config/index.ts` (por defecto `3009` si no está definido); usamos `3001` en `.env`.
- El frontend usa `client/src/services/api.ts` con `baseURL = http://localhost:3001`.
- El contenedor de Postgres fue creado históricamente con `POSTGRES_USER=user` y DB `chambea`. Si prefieres credenciales del `docker-compose.yml` (`cheli/chelita123`), recrea el contenedor: `docker compose down -v && docker compose up -d`.
- Para asignar contraseña al usuario actual `user`: `docker exec -it chambea-postgres-1 psql -U user -d chambea -c "ALTER USER user WITH PASSWORD 'tu_password_segura';"` y actualiza `DB_PASSWORD` en `.env`.
- En Windows, si PowerShell bloquea scripts, ejecuta los comandos con `cmd.exe /c`:
  - Backend: `cmd.exe /c "npm run start:dev"`
  - Frontend: `cmd.exe /c "npm run dev"`

---

## 🚨 Sistema de Excepciones y Filtros

### Excepciones Personalizadas (`exceptions/`)

**Estructura**:
- `exceptions.constants.ts`: Códigos de error estructurados
- `exceptions.interface.ts`: Interfaces para respuestas de excepción
- `bad-request.exception.ts`: Errores 400
- `unauthorized.exception.ts`: Errores 401
- `forbidden.exception.ts`: Errores 403
- `not-found.exception.ts`: Errores 404 (**IMPLEMENTADO**)
- `internal-server-error.exception.ts`: Errores 500

**Códigos de Error**:
- **10001-10016**: Bad Request (parámetros, validación)
- **20001-20011**: Unauthorized (autenticación, tokens)
- **30001-30006**: Internal Server Error (servidor, BD)
- **40001-40005**: Forbidden (permisos, rate limiting)
- **50001-50003**: Not Found (recursos no encontrados) (**IMPLEMENTADO**)

**NotFoundException - Características**:
- **Herencia**: Extiende HttpException de NestJS
- **Constructor**: Acepta message y cause opcional
- **Propiedades**: errorCode, message, cause
- **Uso**: `throw new NotFoundException({ message: "Recurso no encontrado", cause: error })`
- **Códigos disponibles**: RESOURCE_NOT_FOUND (50001)

### Filtros de Excepción (`filters/`)

**Filtros disponibles**:
- `all-exception.filter.ts`: Captura todas las excepciones
- `validator-exception.filter.ts`: Errores de validación de DTOs
- `bad-request-exception.filter.ts`: Manejo específico de 400
- `unauthorized-exception.filter.ts`: Manejo específico de 401
- `forbidden-exception.filter.ts`: Manejo específico de 403
- `not-found-exception.filter.ts`: Manejo específico de 404 (**IMPLEMENTADO**)
- `internal-server-error-exception.filter.ts`: Manejo específico de 500

**Características**:
- **Logging**: Registro detallado de errores con Pino
- **Respuestas estructuradas**: Formato consistente de error
- **Trace IDs**: Seguimiento de requests para debugging
- **Manejo global**: Aplicados a nivel de aplicación

---

## 🗄️ Base de Datos y Entidades

### Configuración de TypeORM

**Características**:
- **Base de datos**: PostgreSQL
- **ORM**: TypeORM con decoradores
- **Migraciones**: Sistema de migraciones automático
- **Sincronización**: Auto-sync en desarrollo, migraciones en producción

### Entidades Principales

#### User Entity
```typescript
- _id: UUID (Primary Key)
- email: string (unique)
- password: string (nullable, select: false)
- user_type: UserType enum (WORKER, EMPLOYER, PENDING)
- first_name: string (nullable)
- last_name: string (nullable)
- phone: string (nullable)
- profile_picture_url: string (nullable)
- account_status: AccountStatus enum (default: PENDING_VERIFICATION)
- email_verified, phone_verified: boolean (default: false)
- verificationCode: number (nullable)
- verificationCodeExpiry: Date (nullable)
- createdAt, updatedAt: timestamps
- last_login_date: timestamp (nullable)
- Relaciones: sentMessages[], receivedMessages[]
```

#### Worker Entity
```typescript
- id: UUID (Primary Key)
- user: User (ManyToOne relationship)
- bio: string
- years_of_experience: number
- availability_status: string
- rate_type, rate_amount, rate_currency: sistema de tarifas
- base_location_address_id: string
- identity_document_type_enum: IdentityDocumentType
- identity_document_number: string
- identity_verified_status: boolean
```

#### Employer Entity (**ACTUALIZADO**)
```typescript
- employer_id: UUID (Primary Key)
- user: User (ManyToOne relationship via user_id)
- company: Company (ManyToOne relationship via company_id)
- position: string
- department: string
- hire_date: Date
- createdAt, updatedAt: timestamps
```

#### Company Entity (**ACTUALIZADO**)
```typescript
- company_id: UUID (Primary Key)
- name: string
- description: string
- industry: string
- size: CompanySize enum
- website: string (nullable)
- phone: string (nullable)
- address: Address (OneToOne relationship via company_address_id)
- createdAt, updatedAt: timestamps
```

#### ChatMessage Entity
```typescript
- id: UUID (Primary Key)
- senderId, receiverId: string
- sender, receiver: User (ManyToOne relationships)
- content: text
- createdAt: timestamp
```

---

## 🔐 Autenticación y Seguridad

### Sistema JWT

**Configuración**:
- **Algoritmo**: RS256 (claves asimétricas)
- **Claves**: Private/Public key en base64
- **Expiración**: Configurable (default: 1h)
- **Verificación**: Automática en guards

### Estrategias de Passport

**JWT Strategy**:
- Validación de tokens en headers Authorization
- Extracción automática de payload de usuario
- Protección de rutas con `@UseGuards(JwtAuthGuard)`
- Promoción automática a `admin` cuando el correo autenticado existe en `ADMIN_EMAILS`

**Google OAuth Strategy**:
- Integración con Google OAuth 2.0
- Registro/login automático con datos de Google
- Manejo de usuarios existentes y nuevos

### Guards y Decoradores

**Protección de rutas**:
- `@UseGuards(JwtUserAuthGuard)`: Requiere autenticación
- `@UseGuards(AdminAuthGuard)`: Requiere rol `admin`
- `@GetUser()`: Decorator para obtener usuario actual
- Validación automática de tokens en WebSockets

---

## 💬 Comunicación en Tiempo Real

### WebSocket Gateway

**Configuración**:
- **Librería**: Socket.IO
- **CORS**: Habilitado para frontend
- **Autenticación**: JWT en query params

**Eventos principales**:
- `connection`: Autenticación de cliente
- `join`: Unirse a sala de chat
- `createMessage`: Enviar mensaje
- `disconnect`: Desconexión de cliente

**Características**:
- **Autenticación JWT**: Validación en handshake
- **Logging**: Registro detallado de conexiones
- **Manejo de errores**: Desconexión automática si falla auth
- **Salas**: Sistema de rooms para conversaciones privadas

---

## 📁 Estructura de Archivos

### Convenciones de Nomenclatura

**Archivos de módulo**:
- `*.module.ts`: Configuración del módulo
- `*.controller.ts`: Endpoints REST
- `*.service.ts`: Lógica de negocio
- `*.entity.ts`: Entidades de base de datos
- `*.repository.ts`: Acceso a datos
- `*.gateway.ts`: WebSocket gateways

**DTOs y Validación**:
- `dto/`: Carpeta con Data Transfer Objects
- `*-req.dto.ts`: DTOs de request
- `*-res.dto.ts`: DTOs de response
- Validación con decoradores de class-validator

**Testing**:
- `*.spec.ts`: Unit tests
- `*.e2e-spec.ts`: Integration tests
- Configuración con Jest

### Shared Resources

**Enums**:
- `UserType`: Admin, Worker, Employer, Pending
- `AccountStatus`: Estados de cuenta
- `IdentityDocumentType`: Tipos de documento
- `NodeEnv`: Entornos de aplicación

**Types**:
- Tipos TypeScript compartidos
- Interfaces comunes
- Utilidades de tipado

---

## 🚀 Configuración de Desarrollo

### Scripts Principales
```json
{
  "start:dev": "nest start --watch",
  "build": "nest build",
  "migration:generate": "Generar migraciones",
  "migration:run": "Ejecutar migraciones",
  "test": "jest",
  "lint": "eslint --fix"
}
```

### Herramientas de Calidad
- **ESLint**: Linting con Airbnb config
- **Prettier**: Formateo de código
- **Husky**: Git hooks para pre-commit
- **Commitlint**: Conventional commits
- **Lint-staged**: Linting en staged files

### Docker
- **Dockerfile**: Configuración para contenedor
- **docker-compose.yml**: Orquestación con PostgreSQL
- **Multi-stage build**: Optimización de imagen

---

## 🖥️ Cliente Frontend

**Stack y ubicación**
- Cliente React + Vite + TypeScript en `client/`.
- Punto de entrada `client/src/main.tsx` y rutas en `client/src/App.tsx`.

**Autenticación (frontend)**
- `services/authService.ts`: login, registro, perfil, logout; integra con backend Nest en `http://localhost:3001`.
- `services/api.ts`: instancia Axios con `baseURL`, añade `Authorization: Bearer <token>` y maneja 401 redirigiendo a `/login`.
- `hooks/useAuth.tsx`: Context + hook para estado de auth (token + usuario), persistencia y helpers (`login`, `register`, `logout`, `getProfile`).

**Páginas y componentes**
- `pages/LoginPage.tsx` + `components/Login.tsx`: formulario de inicio de sesión con estados de carga/errores.
- `pages/RegisterPage.tsx` + `components/Register.tsx`: formulario de registro (nombre, apellido, email, contraseña) y beneficios.
- `App.tsx`: define rutas públicas `/login`, `/register` y protegidas, envuelve con `AuthProvider`.

**Estilos y branding (App.css)**
- Se agregaron estilos para layout de dos columnas (`.login-page`, `.login-page-container`), tarjeta de formulario (`.login-form`) y sidebar de beneficios.
- Se eliminó el enlace “Inicia sesión” del bloque de beneficios en registro para que esa sección contenga solo ventajas.
- Se actualizó el color del enlace “Inicia sesión” en el footer del registro: `.login-footer a { color: #0b3b2a; hover: #0a2f22 }`.
- Enlaces de “Registrarse” usan `.register-link` con el color de marca.
- Layout responsivo para pantallas <900px.

**Ejecución del cliente**
- Arrancar: `cd client && npm run dev` (Vite en `http://localhost:5173/`).
- Detener: `Ctrl+C` en la terminal o parar el proceso en el IDE.

**Notas de integración**
- El frontend asume backend en `http://localhost:3001`; actualizar `client/src/services/api.ts` si cambia.
- Interceptores Axios gestionan expiración del token y redirección.

---

## 📝 Notas para Desarrollo Futuro

### Patrones Implementados
1. **Repository Pattern**: Separación de acceso a datos
2. **Service Layer**: Lógica de negocio encapsulada
3. **DTO Pattern**: Validación y transformación de datos
4. **Exception Handling**: Manejo centralizado de errores
5. **Configuration Pattern**: Configuración tipada y centralizada

### Consideraciones de Escalabilidad
- **Clustering**: Soporte para múltiples procesos
- **Logging estructurado**: Pino para performance
- **Migraciones**: Control de versiones de BD
- **Separación de concerns**: Módulos independientes

### Áreas de Mejora Identificadas
1. **Testing**: Aumentar cobertura de tests
2. **Documentación**: Swagger más detallado
3. **Monitoring**: Métricas y health checks
4. **Caching**: Redis para performance
5. **Rate Limiting**: Protección contra abuse

---

## 📘 Detalle de Módulo Applications (Nuevo)

**Propósito**
- Gestiona postulaciones de trabajos: crear, actualizar y eliminar.

**Entidades utilizadas**
- `JobApplication`, `JobPosting`, `Worker` (registradas con `TypeOrmModule.forFeature`).

**DTOs**
- `CreateJobApplicationDto`: `job_posting_id`, `cover_letter`.
- `UpdateJobApplicationDto`: `status?` (`JobApplicationStatus`), `cover_letter?`.

**Endpoints**
- `POST /applications`: Crea una postulación. Solo `Worker`. Previene duplicados.
- `PATCH /applications/{id}`: Actualiza `status` o `cover_letter`. Solo autor.
- `DELETE /applications/{id}`: Elimina una postulación. Solo autor.

**Autenticación y seguridad**
- `@UseGuards(JwtUserAuthGuard)` y `@GetUser()` para extraer usuario.
- Excepciones usadas: `BadRequestException.RESOURCE_ALREADY_EXISTS`, `NotFoundException.RESOURCE_NOT_FOUND`,
  `UnauthorizedException.UNAUTHORIZED`, `ForbiddenException.FORBIDDEN`, `InternalServerErrorException.UNEXPECTED`.

**Swagger**
- Endpoints documentados con `@ApiTags('Applications')` y respuestas de error comunes.

**Integración**
- `ApplicationsModule` + `ApplicationsController` + `ApplicationsService`.
- `AppModule` actualizado para importar `ApplicationsModule`.

**Estado**
- Servidor verificado con `npm.cmd run start:dev`.

**Pruebas rápidas (cURL)**
```bash
# Crear postulación (requiere token de usuario Worker)
curl -X POST http://localhost:3001/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "job_posting_id": "00000000-0000-0000-0000-000000000000",
    "cover_letter": "Me interesa este puesto por..."
  }'

# Actualizar postulación
curl -X PATCH http://localhost:3001/applications/APP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "UNDER_REVIEW"
  }'

# Eliminar postulación
curl -X DELETE http://localhost:3001/applications/APP_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Notas**
- En desarrollo, la tabla `job_applications` se crea automáticamente (auto-sync de TypeORM).

---

## 📋 Changelog Reciente

### Versión 0.0.7 - [Enero 2025]

**🆕 Nuevas Funcionalidades**
- ✅ **Módulo Applications**: Endpoints `POST /applications`, `PATCH /applications/{id}`, `DELETE /applications/{id}`.
- ✅ **DTOs**: `UpdateJobApplicationDto` creado; barrel `dtos/index.ts` actualizado.

**🔧 Integraciones**
- ✅ `ApplicationsModule` registrado en `AppModule`.
- ✅ Uso consistente de `JwtUserAuthGuard` y `@GetUser()` en controladores.

**⚙️ Validaciones y Reglas**
- ✅ Solo usuarios `Worker` pueden postular.
- ✅ Prevención de postulaciones duplicadas por `job_posting_id`.
- ✅ Solo el autor puede actualizar o eliminar su postulación.

**📚 Documentación**
- ✅ Swagger extendido para endpoints de Applications con respuestas de error.

**🚀 Estado del Proyecto**
- ✅ Compila y arranca en puerto `3001` usando `npm.cmd run start:dev`.

### Versión 0.0.6 - [Enero 2025]

**🆕 Nuevas Funcionalidades**:
- ✅ **NotFoundException completamente implementada**: Nueva excepción personalizada para errores 404
- ✅ **IHttpNotFoundExceptionResponse**: Interface para respuestas de Not Found
- ✅ **not-found-exception.filter.ts**: Filtro específico para manejo de 404
- ✅ **Documentación técnica actualizada**: Reflejando todos los cambios recientes
- ✅ **Worker: dirección base como texto libre**: El campo `base_location_address` en `Worker` y su DTO ahora acepta texto libre para la dirección personal del trabajador (antes `base_location_address_id` tipo UUID). Sin relación con `Address` de `Company`.

**🔧 Correcciones Críticas en Módulo Employer**:
- ✅ **employer.controller.ts**: 
  - Corregido uso incorrecto de `employer._id` por `employer.employer_id`
  - Eliminados métodos duplicados (findAll, getProfile, findOne, update, updateProfile)
  - Limpieza de código y estructura mejorada
- ✅ **employer.service.ts**: 
  - Corregidos múltiples usos de `_id` por `company_id` para entidad Company
  - Corregida asignación de `company_address_id` en método createEmployer
  - Ajustada sintaxis de NotFoundException.RESOURCE_NOT_FOUND
- ✅ **Consistencia de Primary Keys**: 
  - User: `_id` (UUID)
  - Employer: `employer_id` (UUID) 
  - Company: `company_id` (UUID)

**🔧 Correcciones en Sistema de Excepciones**:
- ✅ **not-found.exception.ts**: 
  - Corregido constructor para pasar `cause` correctamente a HttpException
  - Ajustada declaración de propiedad `cause` como `Error | undefined`
  - Implementación completa siguiendo el patrón de otras excepciones

**🏗️ Mejoras de Arquitectura**:
- ✅ **Sistema de excepciones**: Completado con NotFoundException siguiendo el patrón establecido
- ✅ **Manejo de errores**: Filtros específicos para cada tipo de excepción HTTP
- ✅ **Servidor estable**: Todas las rutas del employer funcionando correctamente
- ✅ **TypeScript**: Cero errores de compilación después de las correcciones

**🐛 Bugs Solucionados**:
- ✅ Errores de consulta a BD por nombres de campo incorrectos
- ✅ Referencias inconsistentes entre entidades relacionadas
- ✅ Falta de manejo específico para recursos no encontrados
- ✅ Métodos duplicados en controladores
- ✅ Errores de TypeScript en sistema de excepciones

**🚀 Estado del Proyecto**:
- ✅ Servidor ejecutándose correctamente en puerto 3001
- ✅ Todas las rutas mapeadas sin errores
- ✅ Sistema de excepciones completamente funcional
- ✅ Módulos employer, user, chat, auth funcionando correctamente

### Versión 0.0.5 - [Enero 2025]

**🆕 Funcionalidades Previas**:
- ✅ Base del sistema de excepciones
- ✅ Estructura inicial de módulos
- ✅ Configuración de TypeORM y PostgreSQL

---

*Última actualización: Junio 2026*

---

## 📘 Detalle de Módulo Worker (Actualización)

**Entidad `Worker`**
- Perfil profesional: biografía, años de experiencia
- Sistema de tarifas: tipo, monto, moneda
- Disponibilidad: estado actual del worker
- Verificación de identidad: tipo y número de documento (V, E, P, G)
- Ubicación: `base_location_address` (texto libre). Representa la dirección personal del trabajador. No se vincula con `Address` de `Company`.
- Relación: Conectado a `User` mediante foreign key

**DTO `CreateWorkerProfileDto`**
- Campo `base_location_address?: string`
- Ejemplo: `"Av. Principal, Edif. Sol, Apto 3B, Caracas, Miranda, Venezuela"`
- Nota: Campo opcional. Si no se provee, el perfil se crea sin dirección base.

**Racional del cambio**
- Evitar confusión con `company_address_id` y el modelo `Address` de empresas.
- Permitir ingreso rápido de direcciones personales sin normalización obligatoria.
- Posibilidad futura: dividir en `country`, `state`, `city`, `street`, si se requiere normalización.
*Versión del proyecto: 0.0.7*
 
---

## 🚀 Actualizaciones 2025-11-07

### Resumen
- Se mejoró la presentación de la lista de empleos en la Home con un grid responsivo y tarjetas estilizadas.
- Se añadieron badges de modalidad de trabajo (Remoto, Híbrido, Presencial).
- Se ajustaron márgenes y paddings para evitar contenido pegado a los bordes.
- Se actualizó el botón de “Ver detalle” a estilo primario.

### Frontend: Estilos Globales
- `client/src/App.css`:
  - `grid`: Rejilla responsiva (`repeat(auto-fill, minmax(280px, 1fr))`) con `gap` uniforme.
  - `card`, `card-body`, `card-title`, `card-subtitle`, `card-text`, `card-actions`: Tarjetas con sombra, borde sutil y hover suave.
  - `card-meta` y `badge-workmode`: Badges para modalidad de trabajo con variantes `remote`, `hybrid`, `onsite`.
  - Ajustes de espaciado: márgenes refinados en subtítulo y texto para mejor legibilidad.
  - `.section`: Contenedor global con `max-width`, `margin: 0 auto` y `padding` horizontal para evitar contenido pegado a los bordes; incluye ajustes responsivos.

### Frontend: HomePage
- `client/src/pages/HomePage.tsx`:
  - Inserta `card-meta` con `badge-workmode` mostrando la modalidad de trabajo del empleo.
  - Presupuesto se renderiza en `card-text` solo si existe.
  - Botón “Ver detalle” actualizado a `btn btn-primary` para mayor énfasis.

### Verificación
- La Home muestra tarjetas consistentes, con título, empresa, badge de modalidad y CTA claro.
- El contenido respeta los márgenes laterales gracias a la clase `.section`.

### Próximos pasos sugeridos
- Unificar estilos en `JobDetailPage` y `JobCreatePage` usando las clases nuevas.
- Añadir logos de empresa y ubicación a las tarjetas.
- Ajustar paletas de `badge-workmode` según branding final.

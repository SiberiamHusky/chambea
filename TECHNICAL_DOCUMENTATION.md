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
- **Tipos de usuario**: Worker, Employer, Pending
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

### 5. Módulo de Chat (`chat/`)

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

### 6. Módulo de Email (`mail/`)

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

### Variables de Entorno Importantes
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=cheli
DB_PASSWORD=chelita123
DB_NAME=snorlarm

# JWT
JWT_PRIVATE_KEY=base64_encoded_private_key
JWT_PUBLIC_KEY=base64_encoded_public_key
JWT_EXPIRATION_TIME=1h

# Servidor
PORT=3009
NODE_ENV=development
CLUSTERING=false
```

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

**Google OAuth Strategy**:
- Integración con Google OAuth 2.0
- Registro/login automático con datos de Google
- Manejo de usuarios existentes y nuevos

### Guards y Decoradores

**Protección de rutas**:
- `@UseGuards(JwtAuthGuard)`: Requiere autenticación
- `@User()`: Decorator para obtener usuario actual
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
- `UserType`: Worker, Employer, Pending
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

## 📋 Changelog Reciente

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

*Última actualización: Enero 2025*

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
*Versión del proyecto: 0.0.6*
# 🎯 Nikra Backend

**Sistema de Digitalización de Campañas Promocionales para CCA Ceuta**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 📋 Índice

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Documentation](#api-documentation)
- [Arquitectura](#arquitectura)
- [Módulos](#módulos)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)

## 🎯 Descripción

Nikra es un sistema backend diseñado para la **digitalización de campañas promocionales** de CCA Ceuta. El sistema permite gestionar usuarios, campañas promocionales, participaciones de clientes, comercios asociados y generar reportes de exportación.

### Funcionalidades Principales

- 🔐 **Autenticación JWT** con refresh tokens
- 👥 **Gestión de usuarios** con perfiles completos
- 🎯 **Campañas promocionales** con carteles e imágenes
- 🎫 **Sistema de participaciones** con validaciones de negocio
- 🏪 **Gestión de comercios asociados**
- 📊 **Exportación de datos** a Excel y CSV
- 🖼️ **Upload de imágenes** (avatares, carteles, logos)

## ✨ Características

### 🔒 Seguridad
- Autenticación JWT con tokens de acceso (15 min) y refresh (7 días)
- Hash de contraseñas con bcrypt
- Rate limiting y validación de entrada
- Headers de seguridad con Helmet.js
- CORS configurado

### 🚀 Performance
- Arquitectura MVC optimizada
- Validaciones de entrada y sanitización
- Paginación en endpoints de listado
- Compresión de respuestas
- Cache headers para archivos estáticos

### 📱 API Features
- Documentación Swagger completa
- Validación de DTOs con class-validator
- Manejo centralizado de errores
- Logging estructurado
- Endpoints RESTful

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | ^11.1.6 | Framework principal |
| **TypeScript** | ^5.0.0 | Lenguaje de programación |
| **PostgreSQL** | 15-alpine | Base de datos principal |
| **Redis** | 7-alpine | Cache y sesiones |
| **TypeORM** | ^0.3.20 | ORM para PostgreSQL |
| **JWT** | ^11.0.1 | Autenticación |
| **Multer** | ^2.0.2 | Upload de archivos |
| **ExcelJS** | ^4.4.0 | Generación de Excel |

## 🚀 Instalación

### Prerequisitos

- **Node.js** 18+ 
- **npm** 8+
- **Docker** y **Docker Compose**
- **Git**

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd nikra-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nikra_db

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Aplicación
NODE_ENV=development
PORT=3000
```

## 🔧 Configuración

### Base de datos con Docker

```bash
# Iniciar servicios de base de datos
npm run db:up

# Verificar estado
npm run db:status

# Ver logs
npm run db:logs
```

### Migraciones

```bash
# Generar migración
npm run migration:generate -- src/database/migrations/NombreMigracion

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert
```

## 🏃‍♂️ Uso

### Desarrollo

```bash
# Iniciar en modo desarrollo
npm run start:dev

# Iniciar en modo debug
npm run start:debug

# Compilar proyecto
npm run build
```

### Producción

```bash
# Compilar
npm run build

# Iniciar aplicación
npm run start:prod
```

## 📚 API Documentation

### Swagger UI

Una vez iniciada la aplicación, accede a la documentación interactiva:

```
http://localhost:3000/api/docs
```

### Endpoints Principales

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| **Auth** | `/auth/*` | Autenticación y autorización |
| **Users** | `/users/*` | Gestión de usuarios |
| **Campaigns** | `/campaigns/*` | Campañas promocionales |
| **Participants** | `/participations/*` | Participaciones |
| **Associates** | `/associates/*` | Comercios asociados |
| **Export** | `/export/*` | Exportación de datos |
| **Upload** | `/upload/*` | Carga de archivos |

### Ejemplo de autenticación

```bash
# Registro de usuario
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellidos": "García",
    "dni": "12345678Z",
    "direccion": "Calle Mayor 123",
    "email": "juan@example.com",
    "password": "Password123!"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123!"
  }'

# Usar token en requests
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🏗️ Arquitectura

### Patrón MVC

```
┌─────────────────────────────────────────┐
│            CONTROLADOR                  │
│  • HTTP Controllers                     │
│  • Request/Response Handling            │
│  • Authentication & Validation         │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│              MODELO                     │
│  • Services (Business Logic)            │
│  • Entities (Data Models)               │
│  • DTOs (Data Transfer Objects)        │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            CAPA DE DATOS                │
│  • PostgreSQL                           │
│  • Redis Cache                          │
│  • File Storage                         │
└─────────────────────────────────────────┘
```

## 📦 Módulos

### 🔐 Auth Module
- Registro y login de usuarios
- Generación de tokens JWT
- Renovación de tokens
- Validación de sesiones

### 👥 Users Module
- CRUD de usuarios
- Gestión de perfiles
- Búsqueda y filtrado
- Soft delete

### 🎯 Campaigns Module
- Gestión de campañas promocionales
- Estados y validaciones
- Clonación de campañas
- Upload de carteles

### 🎫 Participations Module
- Sistema de participaciones
- Validaciones de negocio (límites diarios)
- Integración con usuarios y comercios
- Histórico de participaciones

### 🏪 Associates Module
- Gestión de comercios asociados
- Estados activo/inactivo
- Upload de logos
- Búsqueda optimizada

### 📊 Export Module
- Exportación a Excel (ExcelJS)
- Exportación a CSV
- Filtros y estadísticas
- Generación de reportes

### 🖼️ Upload Module
- Upload de avatares de usuarios
- Upload de carteles de campañas
- Upload de logos de comercios
- Validación de tipos y tamaños
- Servicio seguro de archivos

## 🧪 Testing

### Ejecutar tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Tests con coverage
npm run test:cov

# Todos los tests
npm run test:all

# Tests con scripts CURL
npm run test:poo
```

### Scripts de prueba

- `test-curl-endpoints.sh` - Pruebas completas de todos los endpoints
- `curl-quick-test.sh` - Pruebas rápidas de endpoints esenciales

## 🐳 Despliegue

### Docker Compose

```bash
# Servicios de desarrollo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

### Variables de entorno de producción

Asegúrate de cambiar estas variables en producción:

```env
NODE_ENV=production
JWT_SECRET=your-production-secret-key
JWT_REFRESH_SECRET=your-production-refresh-secret
DB_PASSWORD=your-secure-db-password
```

## 📁 Estructura del proyecto

```
nikra-backend/
├── docs/                    # Documentación
├── src/
│   ├── auth/               # Módulo de autenticación
│   ├── users/              # Módulo de usuarios
│   ├── campaigns/          # Módulo de campañas
│   ├── participations/     # Módulo de participaciones
│   ├── associates/         # Módulo de comercios
│   ├── export/             # Módulo de exportación
│   ├── upload/             # Módulo de upload
│   ├── common/             # Utilidades comunes
│   ├── config/             # Configuraciones
│   ├── database/           # Migraciones
│   ├── app.module.ts       # Módulo principal
│   └── main.ts             # Punto de entrada
├── test/                   # Tests
├── uploads/                # Archivos subidos
├── scripts/                # Scripts de utilidad
├── docker-compose.yml      # Configuración Docker
└── package.json
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta al equipo de desarrollo:

- **Email**: [mailto:creative.feelve@gmail.com](mailto:creative.feelve@gmail.com)
- **Equipo**: Equipo Desarrollo Creativefeel

---


# 🎯 Diagrama de Arquitectura de Despliegue en Render

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS/SSL
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     RENDER PLATFORM                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         📱 FRONTEND (Tu Aplicación Cliente)            │    │
│  │         https://tu-frontend.onrender.com               │    │
│  └────────────────────────┬───────────────────────────────┘    │
│                           │ API Calls                           │
│                           │                                     │
│  ┌────────────────────────▼───────────────────────────────┐    │
│  │         🚀 BACKEND (nikra-backend)                     │    │
│  │         https://nikra-backend.onrender.com             │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────┐        │    │
│  │  │  NestJS Application                      │        │    │
│  │  │  - Auth Module (JWT)                    │        │    │
│  │  │  - Users Module                         │        │    │
│  │  │  - Campaigns Module                     │        │    │
│  │  │  - Participations Module                │        │    │
│  │  │  - Associates Module                    │        │    │
│  │  │  - Export Module                        │        │    │
│  │  │  - Upload Module                        │        │    │
│  │  └──────────────────────────────────────────┘        │    │
│  │                           │                           │    │
│  │                           │ TypeORM                   │    │
│  │                           │                           │    │
│  └───────────────────────────┼───────────────────────────┘    │
│                              │                                 │
│  ┌───────────────────────────▼───────────────────────────┐    │
│  │         🗄️ POSTGRESQL DATABASE (nikra-db)            │    │
│  │         Internal: dpg-xxxxx-postgres.render.com       │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────┐        │    │
│  │  │  Tables:                                 │        │    │
│  │  │  - users                                 │        │    │
│  │  │  - campaigns                             │        │    │
│  │  │  - participations                        │        │    │
│  │  │  - associates                            │        │    │
│  │  │  - migrations                            │        │    │
│  │  └──────────────────────────────────────────┘        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         💾 PERSISTENT DISK (/app/uploads)              │    │
│  │         - avatars/                                     │    │
│  │         - campaigns/                                   │    │
│  │         - associates/                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Despliegue

```
┌─────────────────┐
│  1. Git Push    │
│  main branch    │
└────────┬────────┘
         │
         │ Webhook
         ▼
┌─────────────────┐
│  2. Render      │
│  Detecta cambio │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Build       │
│  npm ci         │
│  npm run build  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. Start       │
│  npm run        │
│  start:prod     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. Health      │
│  Check OK       │
│  Status: Live   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. Execute     │
│  Migrations     │
│  (Manual)       │
└─────────────────┘
```

## 🔐 Flujo de Autenticación

```
┌──────────────┐
│   Cliente    │
└──────┬───────┘
       │
       │ POST /auth/login
       │ { email, password }
       ▼
┌──────────────┐
│   Backend    │
│   Auth       │
│   Module     │
└──────┬───────┘
       │
       │ Verify credentials
       ▼
┌──────────────┐
│  PostgreSQL  │
│  users table │
└──────┬───────┘
       │
       │ User found
       ▼
┌──────────────┐
│   Backend    │
│   Generate   │
│   JWT Tokens │
└──────┬───────┘
       │
       │ Return tokens
       │ { access_token, refresh_token }
       ▼
┌──────────────┐
│   Cliente    │
│   Store      │
│   Tokens     │
└──────────────┘
```

## 📁 Flujo de Upload de Archivos

```
┌──────────────┐
│   Cliente    │
└──────┬───────┘
       │
       │ POST /upload/avatar
       │ FormData { file }
       │ Authorization: Bearer <token>
       ▼
┌──────────────┐
│   Backend    │
│   Auth Guard │
└──────┬───────┘
       │
       │ Token válido
       ▼
┌──────────────┐
│   Upload     │
│   Module     │
│   Validate   │
└──────┬───────┘
       │
       │ File válido
       ▼
┌──────────────┐
│ Save to Disk │
│ /app/uploads │
│ /avatars/    │
└──────┬───────┘
       │
       │ File path
       ▼
┌──────────────┐
│  PostgreSQL  │
│  Update user │
│  avatar_url  │
└──────┬───────┘
       │
       │ Success
       ▼
┌──────────────┐
│   Cliente    │
│   Display    │
│   Avatar     │
└──────────────┘
```

## 🗄️ Estructura de Base de Datos

```
┌──────────────────────────────────────────────────────┐
│                     nikra_db                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐         ┌────────────┐             │
│  │   users    │         │  campaigns │             │
│  ├────────────┤         ├────────────┤             │
│  │ id         │         │ id         │             │
│  │ nombre     │         │ nombre     │             │
│  │ apellidos  │         │ descripcion│             │
│  │ dni        │         │ cartel_url │             │
│  │ email      │         │ fecha_ini  │             │
│  │ password   │         │ fecha_fin  │             │
│  │ avatar_url │         │ estado     │             │
│  │ role       │         │ created_at │             │
│  │ created_at │         └─────┬──────┘             │
│  └─────┬──────┘               │                    │
│        │                      │                    │
│        │    ┌─────────────────┴───────────┐        │
│        │    │                             │        │
│        │    ▼                             ▼        │
│  ┌─────┴──────────┐              ┌────────────┐   │
│  │ participations │              │ associates │   │
│  ├────────────────┤              ├────────────┤   │
│  │ id             │              │ id         │   │
│  │ user_id        │◄─────────┐   │ nombre     │   │
│  │ campaign_id    │          │   │ direccion  │   │
│  │ associate_id   ├──────────┘   │ logo_url   │   │
│  │ fecha_compra   │              │ estado     │   │
│  │ importe        │              │ created_at │   │
│  │ estado         │              └────────────┘   │
│  │ created_at     │                               │
│  └────────────────┘                               │
│                                                    │
│  ┌────────────┐                                   │
│  │ migrations │                                   │
│  ├────────────┤                                   │
│  │ id         │                                   │
│  │ timestamp  │                                   │
│  │ name       │                                   │
│  └────────────┘                                   │
│                                                    │
└──────────────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida del Servicio

```
┌─────────────────────────────────────────────────────┐
│                  Render Service                     │
└─────────────────────────────────────────────────────┘

    Inicialización
         │
         ▼
    ┌─────────┐
    │ Build   │ npm ci && npm run build
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Deploy  │ npm run start:prod
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Running │ Status: Live
    └────┬────┘
         │
         ├─────► Health Check (cada 30s)
         │
         ├─────► Log Output (continuo)
         │
         ├─────► Metrics (CPU, RAM, Response Time)
         │
         │
    ┌────▼────┐
    │ Update  │ Git push → Auto redeploy
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Build   │ Ciclo se repite
    └─────────┘
```

## 💾 Gestión de Almacenamiento

```
┌──────────────────────────────────────────────────┐
│         Persistent Disk (/app/uploads)           │
├──────────────────────────────────────────────────┤
│                                                  │
│  uploads/                                        │
│  ├── avatars/                                    │
│  │   ├── user-1-avatar.jpg                      │
│  │   ├── user-2-avatar.png                      │
│  │   └── ...                                    │
│  │                                              │
│  ├── campaigns/                                 │
│  │   ├── campaign-1-cartel.jpg                 │
│  │   ├── campaign-2-cartel.png                 │
│  │   └── ...                                   │
│  │                                              │
│  └── associates/                                │
│      ├── associate-1-logo.jpg                  │
│      ├── associate-2-logo.png                  │
│      └── ...                                   │
│                                                  │
│  ⚠️ IMPORTANTE: Sin disco persistente,          │
│     estos archivos se pierden al redesplegar    │
│                                                  │
└──────────────────────────────────────────────────┘
```

## 🌐 Configuración de Red

```
┌───────────────────────────────────────────────────────┐
│                    NETWORKING                         │
└───────────────────────────────────────────────────────┘

Internet
   │
   │ HTTPS (443)
   │ SSL/TLS Certificate (Auto-managed by Render)
   │
   ▼
Render Load Balancer
   │
   │ HTTP (Internal)
   │
   ▼
Backend Service (nikra-backend)
   │ Port: 3000
   │ Internal IP: 10.x.x.x
   │
   ├──────► PostgreSQL (nikra-db)
   │        Port: 5432
   │        Internal: dpg-xxxx.oregon-postgres.render.com
   │        External: Available (for migrations from local)
   │
   └──────► Persistent Disk
            Mount: /app/uploads
            Size: 10 GB

🔒 Security:
- ✅ HTTPS obligatorio
- ✅ SSL certificate auto-renovado
- ✅ PostgreSQL accesible solo internamente (default)
- ✅ Environment variables encriptadas
```

## 📊 Monitoreo y Logs

```
┌───────────────────────────────────────────────────┐
│              MONITORING & LOGS                    │
└───────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Metrics   │     │    Logs     │     │   Events    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ - CPU Usage │     │ - App logs  │     │ - Deploys   │
│ - RAM Usage │     │ - Errors    │     │ - Restarts  │
│ - Response  │     │ - Requests  │     │ - Builds    │
│   Time      │     │ - Database  │     │ - Errors    │
│ - Requests  │     │   queries   │     │             │
│   per sec   │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      └───────────────────┴───────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │   Render Dashboard  │
              │   - Real-time view  │
              │   - Historical data │
              │   - Alerts          │
              └─────────────────────┘
```

## 🔄 Proceso de CI/CD

```
┌──────────────────────────────────────────────────────┐
│            Continuous Deployment Flow                │
└──────────────────────────────────────────────────────┘

Developer                  GitHub                 Render
    │                        │                      │
    │ git push main          │                      │
    ├───────────────────────►│                      │
    │                        │                      │
    │                        │ Webhook              │
    │                        ├─────────────────────►│
    │                        │                      │
    │                        │                   ┌──┴──┐
    │                        │                   │Build│
    │                        │                   └──┬──┘
    │                        │                      │
    │                        │                   ┌──▼──┐
    │                        │                   │Test │
    │                        │                   └──┬──┘
    │                        │                      │
    │                        │                   ┌──▼───┐
    │                        │                   │Deploy│
    │                        │                   └──┬───┘
    │                        │                      │
    │                        │      Deploy Success  │
    │                        │◄─────────────────────┤
    │                        │                      │
    │  Email Notification    │                      │
    │◄───────────────────────┤                      │
    │                        │                      │
    │                                              │
    │  Access: https://nikra-backend.onrender.com  │
    └──────────────────────────────────────────────┘
```

---

## 📚 Referencias Visuales

### Componentes Clave

| Componente | Icono | Descripción |
|------------|-------|-------------|
| Backend Service | 🚀 | Aplicación NestJS principal |
| Database | 🗄️ | PostgreSQL |
| Storage | 💾 | Disco persistente para uploads |
| Frontend | 📱 | Aplicación cliente (opcional) |
| Security | 🔐 | JWT Auth, HTTPS, SSL |

### Estados del Servicio

| Estado | Color | Descripción |
|--------|-------|-------------|
| Live | 🟢 | Servicio funcionando correctamente |
| Building | 🟡 | Construyendo nueva versión |
| Error | 🔴 | Servicio con errores |
| Suspended | ⚫ | Servicio suspendido |

---

**Última actualización**: Octubre 2025


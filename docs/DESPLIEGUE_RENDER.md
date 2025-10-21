# 🚀 Guía de Despliegue en Render

Esta guía detalla paso a paso cómo desplegar el backend de Nikra en la plataforma Render con una base de datos PostgreSQL.

## 📋 Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Opción 1: Despliegue Automático con render.yaml](#opción-1-despliegue-automático-con-renderyaml)
- [Opción 2: Despliegue Manual desde la UI](#opción-2-despliegue-manual-desde-la-ui)
- [Configuración Post-Despliegue](#configuración-post-despliegue)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Almacenamiento Persistente](#almacenamiento-persistente)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Solución de Problemas](#solución-de-problemas)

## 🔑 Prerequisitos

Antes de comenzar, asegúrate de tener:

1. ✅ Una cuenta en [Render](https://render.com)
2. ✅ Tu código en un repositorio Git (GitHub, GitLab, o Bitbucket)
3. ✅ Valores seguros para `JWT_SECRET` y `JWT_REFRESH_SECRET`
4. ✅ (Opcional) Un dominio personalizado si deseas usarlo

## 🎯 Opción 1: Despliegue Automático con render.yaml

Esta es la forma **más rápida y recomendada** de desplegar tu aplicación.

### Paso 1: Verificar el archivo render.yaml

El archivo `render.yaml` en la raíz del proyecto define toda la infraestructura necesaria:
- ✅ Servicio Web (Backend NestJS)
- ✅ Base de datos PostgreSQL
- ✅ Variables de entorno
- ✅ Disco persistente para archivos

### Paso 2: Conectar tu repositorio a Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio Git
4. Render detectará automáticamente el archivo `render.yaml`
5. Revisa la configuración y haz clic en **"Apply"**

### Paso 3: Configurar Secrets

Después de crear los servicios, configura manualmente los secrets en la UI de Render:

1. Ve a tu servicio web
2. En la sección **"Environment"**, actualiza:
   - `JWT_SECRET`: Genera un valor seguro (mínimo 32 caracteres)
   - `JWT_REFRESH_SECRET`: Genera otro valor seguro diferente

Puedes generar secrets seguros con:

```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 4: Ejecutar Migraciones

Una vez desplegado, ejecuta las migraciones:

1. Ve a tu servicio web en Render
2. Haz clic en **"Shell"** en el menú lateral
3. Ejecuta:

```bash
npm run migration:run
```

¡Listo! Tu aplicación debería estar funcionando.

---

## 🖱️ Opción 2: Despliegue Manual desde la UI

Si prefieres configurar todo manualmente o necesitas más control:

### Paso 1: Crear la Base de Datos PostgreSQL

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"PostgreSQL"**
3. Configura:
   - **Name**: `nikra-db` (o el nombre que prefieras)
   - **Database**: `nikra_db`
   - **User**: `nikra_user`
   - **Region**: Selecciona la más cercana a tus usuarios (ej: Frankfurt para Europa)
   - **Plan**: 
     - **Free**: Para pruebas (expira en 90 días)
     - **Starter**: $7/mes, 256MB RAM
     - **Standard**: Para producción
4. Haz clic en **"Create Database"**
5. **Importante**: Guarda las credenciales que aparecerán (Internal Database URL, External Database URL, etc.)

### Paso 2: Crear el Servicio Web

1. Haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio Git
3. Configura el servicio:

#### Configuración Básica

| Campo | Valor |
|-------|-------|
| **Name** | `nikra-backend` |
| **Region** | Misma que la base de datos |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Plan** | Starter ($7/mes) o superior |

#### Variables de Entorno

Haz clic en **"Advanced"** y añade estas variables:

```bash
# Entorno
NODE_ENV=production
PORT=3000

# Base de Datos (obtén estos valores de tu servicio PostgreSQL)
DB_HOST=<tu-host>.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=nikra_user
DB_DATABASE=nikra_db
DB_PASSWORD=<tu-password-de-render>

# JWT (genera valores seguros únicos)
JWT_SECRET=<genera-un-valor-seguro-de-32-caracteres>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<genera-otro-valor-seguro-diferente>
JWT_REFRESH_EXPIRES_IN=7d
```

**💡 Tip**: Render puede autorellenar las variables de base de datos si seleccionas la base de datos desde el dropdown.

### Paso 3: Configurar Disco Persistente

Para almacenar archivos subidos (avatares, carteles, logos):

1. En tu servicio web, ve a **"Disks"** en el menú lateral
2. Haz clic en **"Add Disk"**
3. Configura:
   - **Name**: `uploads`
   - **Mount Path**: `/app/uploads`
   - **Size**: 10 GB (o según tus necesidades)
4. Guarda los cambios

### Paso 4: Desplegar

1. Haz clic en **"Create Web Service"**
2. Render comenzará a construir y desplegar tu aplicación
3. Espera a que el despliegue complete (verás "Live" en verde)

### Paso 5: Ejecutar Migraciones

Una vez desplegado:

1. Ve a tu servicio web
2. Haz clic en **"Shell"** en el menú lateral
3. Ejecuta:

```bash
npm run migration:run
```

---

## 🔧 Configuración Post-Despliegue

### Verificar el Estado de la Aplicación

1. Accede a tu URL de Render: `https://nikra-backend.onrender.com`
2. Verifica Swagger UI: `https://nikra-backend.onrender.com/api/docs`

### Configurar un Dominio Personalizado

1. En tu servicio web, ve a **"Settings"**
2. En la sección **"Custom Domains"**, haz clic en **"Add Custom Domain"**
3. Ingresa tu dominio (ej: `api.midominio.com`)
4. Configura el DNS según las instrucciones de Render:
   - Para subdominios: añade un registro `CNAME` apuntando a tu servicio Render
   - Para dominio raíz: usa `ALIAS` o `ANAME` si tu proveedor lo soporta

### Configurar CORS

Si tu frontend está en un dominio diferente, añade la variable de entorno:

```bash
CORS_ORIGIN=https://tu-frontend.com
```

Luego actualiza `src/config/bootstrap/security.config.ts` para usar esta variable.

---

## 🗄️ Migraciones de Base de Datos

### Ejecutar Migraciones Manualmente

**Opción 1: Desde Render Shell**

1. Ve a tu servicio web → **"Shell"**
2. Ejecuta:

```bash
npm run migration:run
```

**Opción 2: Usando Render CLI**

```bash
# Instalar Render CLI
npm install -g @render/cli

# Autenticarte
render login

# Ejecutar comando en tu servicio
render exec nikra-backend npm run migration:run
```

### Migraciones Automáticas (Opcional)

Si deseas que las migraciones se ejecuten automáticamente al desplegar:

1. Edita `src/app.module.ts`
2. Verifica que la línea 51 esté configurada:

```typescript
migrationsRun: process.env.NODE_ENV === 'production', // Auto-run migraciones en producción
```

**⚠️ Precaución**: Las migraciones automáticas pueden ser peligrosas en producción. Úsalas solo si estás seguro.

### Generar Nueva Migración

En desarrollo local:

```bash
npm run migration:generate -- src/database/migrations/NombreDeLaMigracion
```

Luego haz commit y push. Render desplegará automáticamente.

---

## 🔐 Variables de Entorno

### Variables Obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de PostgreSQL | `xxxxx.oregon-postgres.render.com` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de la BD | `nikra_user` |
| `DB_PASSWORD` | Contraseña de la BD | `<desde-render>` |
| `DB_DATABASE` | Nombre de la BD | `nikra_db` |
| `JWT_SECRET` | Secret para tokens de acceso | `<genera-valor-seguro>` |
| `JWT_REFRESH_SECRET` | Secret para tokens de refresh | `<genera-valor-seguro>` |

### Variables Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | Duración de tokens de acceso | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Duración de tokens de refresh | `7d` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |

### Generar Secrets Seguros

```bash
# Opción 1: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: Con OpenSSL
openssl rand -hex 32

# Opción 3: Online (usa sitios seguros)
# https://generate-secret.vercel.app/32
```

---

## 💾 Almacenamiento Persistente

### ¿Por qué necesitas un Disco Persistente?

Por defecto, el sistema de archivos de Render es **efímero**. Cada vez que se despliega, los archivos subidos se pierden. Un disco persistente soluciona esto.

### Configurar el Disco

Ya configurado en `render.yaml` o manualmente en el paso 2.

### Verificar que funciona

1. Sube un avatar desde tu frontend/API
2. Verifica que se guarde en `/app/uploads/avatars/`
3. Despliega nuevamente tu aplicación
4. El archivo debería seguir ahí

### Backup del Disco

Render **no hace backups automáticos** de los discos. Considera:

1. **Opción A**: Usar un servicio de almacenamiento externo (AWS S3, Cloudinary, etc.)
2. **Opción B**: Crear un script de backup periódico

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

1. Ve a tu servicio web
2. Haz clic en **"Logs"** en el menú lateral
3. Verás los logs en tiempo real

### Logs desde CLI

```bash
render logs nikra-backend --follow
```

### Métricas

Render proporciona métricas básicas:
- CPU Usage
- Memory Usage
- Response Times
- Request Count

Accede desde: **Dashboard → Tu Servicio → Metrics**

### Health Checks

Render verifica automáticamente que tu aplicación esté viva:
- **Health Check Path**: `/` (configurable)
- **Interval**: Cada 30 segundos
- Si falla 3 veces consecutivas, Render reinicia el servicio

---

## 🔍 Solución de Problemas

### Error: "Cannot connect to database"

**Problema**: La aplicación no puede conectarse a PostgreSQL.

**Soluciones**:

1. Verifica que las variables de entorno de la BD sean correctas
2. Asegúrate de que la base de datos esté en la misma región
3. Verifica los logs: `render logs nikra-backend`
4. Prueba la conexión desde el Shell:

```bash
psql $DATABASE_URL
```

### Error: "Port already in use"

**Problema**: Puerto configurado incorrectamente.

**Solución**: Asegúrate de que `PORT=3000` en las variables de entorno y que tu aplicación use `process.env.PORT`.

### Error: "Build failed"

**Problema**: El build de TypeScript falla.

**Soluciones**:

1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de build para ver el error específico
3. Prueba el build localmente: `npm run build`

### Error: "Migraciones no se ejecutan"

**Problema**: La base de datos no tiene las tablas.

**Solución**: Ejecuta manualmente las migraciones desde el Shell:

```bash
npm run migration:run
```

### Aplicación muy lenta

**Problema**: Render Free tier hiberna después de 15 minutos de inactividad.

**Soluciones**:

1. Actualiza al plan Starter ($7/mes) o superior
2. Usa un servicio de "keep-alive" como UptimeRobot para hacer ping cada 5 minutos

### Archivos subidos desaparecen

**Problema**: No has configurado un disco persistente.

**Solución**: Sigue los pasos en [Almacenamiento Persistente](#almacenamiento-persistente).

---

## 📈 Escalabilidad y Mejoras

### Actualizar el Plan

A medida que crece tu aplicación:

| Plan | Precio | CPU | RAM | Recomendado para |
|------|--------|-----|-----|------------------|
| **Free** | $0 | Compartido | 512MB | Pruebas (expira en 90 días) |
| **Starter** | $7/mes | Compartido | 512MB | Desarrollo/Staging |
| **Standard** | $25/mes | 0.5 CPU | 2GB | Producción pequeña |
| **Pro** | $85/mes | 2 CPU | 4GB | Producción mediana |
| **Pro Plus** | $160/mes | 4 CPU | 8GB | Producción grande |

### Añadir Redis (Cache)

Tu aplicación usa Redis. Para añadirlo en Render:

1. **New +** → **Redis**
2. Configura el servicio
3. Añade la variable: `REDIS_URL=<internal-redis-url>`
4. Actualiza tu código para usar Redis si aún no lo hace

### Configurar Auto-Deploy

Render puede desplegar automáticamente cuando haces push:

1. Ve a **Settings** de tu servicio
2. En **"Build & Deploy"**, habilita **"Auto-Deploy"**
3. Selecciona la rama (ej: `main`)

### Configurar Preview Environments

Para revisar PRs antes de mergear:

1. Ve a **Settings** → **"Preview Environments"**
2. Habilita **"Create preview environments for pull requests"**
3. Cada PR creará un entorno temporal

---

## 🎉 ¡Todo Listo!

Tu aplicación backend debería estar funcionando en:

🌐 **URL Principal**: `https://nikra-backend.onrender.com`  
📚 **Swagger UI**: `https://nikra-backend.onrender.com/api/docs`

### Próximos Pasos

- ✅ Conectar tu frontend a la API
- ✅ Configurar un dominio personalizado
- ✅ Configurar monitoreo (Sentry, LogRocket, etc.)
- ✅ Configurar backups de base de datos
- ✅ Configurar CI/CD avanzado

---

## 📞 Soporte

Si tienes problemas:

1. **Render Docs**: https://render.com/docs
2. **Render Community**: https://community.render.com
3. **Render Support**: support@render.com (planes de pago)

Para problemas específicos de la aplicación:
- **Email**: creative.feelve@gmail.com
- **Equipo**: Equipo Desarrollo Nikra

---

¡Feliz despliegue! 🚀


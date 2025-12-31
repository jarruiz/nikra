# 🧪 Guía de Despliegue en Render - Ambiente de Testing

Esta guía explica cómo desplegar el ambiente de **testing** en Render usando el archivo `render.testing.yaml`.

## 📋 Características del Ambiente de Testing

- ✅ **Plan FREE** para el servicio web (hiberna después de 15 min de inactividad)
- ✅ **Base de datos FREE** (expira después de 90 días de inactividad)
- ✅ **Rama `testing`** de Git
- ✅ **Nombres únicos** para evitar conflictos con producción:
  - Servicio web: `nikra-backend-testing`
  - Base de datos: `nikra-db-testing`
  - Database name: `nikra_db_testing`
  - User: `nikra_user_testing`

## 🚀 Pasos para Desplegar

### Opción 1: Usando Blueprint (Recomendado - Automático)

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio Git
4. En **"Blueprint File"**, especifica: `render.testing.yaml`
5. Render detectará automáticamente el archivo
6. Revisa la configuración y haz clic en **"Apply"**
7. Render creará automáticamente:
   - ✅ Servicio web `nikra-backend-testing` (plan FREE)
   - ✅ Base de datos `nikra-db-testing` (plan FREE)
   - ✅ Variables de entorno vinculadas

### Opción 2: Creación Manual

Si prefieres crear los servicios manualmente:

#### Paso 1: Crear Base de Datos

1. Ve a Render Dashboard → **"New +"** → **"PostgreSQL"**
2. Configura:
   - **Name**: `nikra-db-testing`
   - **Database**: `nikra_db_testing`
   - **User**: `nikra_user_testing`
   - **Region**: `frankfurt`
   - **Plan**: **Free** ⭐
3. Haz clic en **"Create Database"**
4. **Guarda las credenciales** que aparecerán

#### Paso 2: Crear Servicio Web

1. Ve a Render Dashboard → **"New +"** → **"Web Service"**
2. Conecta tu repositorio Git
3. Configura:
   - **Name**: `nikra-backend-testing`
   - **Region**: `frankfurt` (misma que la BD)
   - **Branch**: `testing` ⭐
   - **Runtime**: `Node`
   - **Build Command**: `npm install --include=dev && npx nest build`
   - **Start Command**: `./scripts/start-with-migrations.sh`
   - **Plan**: **Free** ⭐
4. En **"Environment Variables"**, añade las variables del archivo `render.testing.yaml`
5. Vincula la base de datos desde el dropdown en cada variable `DB_*`

## ⚙️ Configuración Post-Despliegue

### 1. Configurar Secrets de Gmail (Opcional)

Si necesitas envío de emails en testing:

1. Ve a tu servicio web `nikra-backend-testing`
2. En **"Environment"**, actualiza:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`

### 2. Ejecutar Migraciones

Las migraciones se ejecutan automáticamente al iniciar el servicio gracias al script `start-with-migrations.sh`.

Si necesitas ejecutarlas manualmente:

1. Ve a tu servicio web → **"Shell"**
2. Ejecuta:
```bash
npm run migration:run
```

## ⚠️ Limitaciones del Plan FREE

### Servicio Web (FREE)
- ❌ Hiberna después de **15 minutos** de inactividad
- ❌ Primera petición después de hibernar puede tardar **30-60 segundos**
- ❌ **No hay disco persistente** - los archivos subidos se pierden al reiniciar
- ✅ Ideal para testing y desarrollo

### Base de Datos (FREE)
- ❌ Expira después de **90 días** de inactividad
- ❌ **256MB de almacenamiento** máximo
- ❌ **Sin backups automáticos**
- ✅ Ideal para testing y desarrollo

## 🔄 Actualizar a Plan de Pago

Si necesitas más recursos para testing:

1. Ve a tu servicio en Render Dashboard
2. Click en **"Settings"** → **"Plan"**
3. Actualiza a **Starter** ($7/mes) o superior
4. Los servicios se actualizarán automáticamente

## 📊 Comparación: Producción vs Testing

| Característica | Producción | Testing |
|----------------|------------|---------|
| **Archivo** | `render.yaml` | `render.testing.yaml` |
| **Rama Git** | `main` | `testing` |
| **Servicio Web** | `nikra-backend` | `nikra-backend-testing` |
| **Plan Web** | Starter/Pro | **Free** |
| **Base de Datos** | `nikra-db` | `nikra-db-testing` |
| **Plan BD** | Pro | **Free** |
| **Database Name** | `nikra_db` | `nikra_db_testing` |
| **Hibernación** | No | Sí (15 min) |
| **Persistencia** | Sí | No |

## 🔍 Verificar el Despliegue

1. **Servicio Web**: Debe estar en estado **"Live"**
2. **Base de Datos**: Debe estar en estado **"Available"**
3. **Health Check**: Visita `https://nikra-backend-testing.onrender.com/api/docs`
4. **Logs**: Verifica que no haya errores en los logs

## 🐛 Solución de Problemas

### Error: "Base de datos no encontrada"

**Solución**: Asegúrate de que la base de datos `nikra-db-testing` esté creada y vinculada correctamente.

### Error: "ENOTFOUND" al conectar a la BD

**Solución**: Verifica que el `DB_HOST` tenga el formato correcto (debe incluir el dominio completo).

### Servicio hibernado

**Solución**: Es normal en plan FREE. La primera petición después de hibernar puede tardar 30-60 segundos.

### Archivos subidos desaparecen

**Solución**: Es normal en plan FREE. No hay disco persistente. Actualiza a Starter o superior si necesitas persistencia.

## 📝 Notas Importantes

- ⚠️ **Los datos en testing pueden perderse** si la base de datos expira (90 días de inactividad)
- ⚠️ **No uses datos reales de producción** en testing
- ✅ **Usa JWT secrets diferentes** entre producción y testing
- ✅ **Mantén la rama `testing` actualizada** con los cambios de `main`

## 🔗 Recursos

- [Guía de Despliegue Principal](./DESPLIEGUE_RENDER.md)
- [Variables de Entorno](./VARIABLES_ENTORNO.md)
- [Render Documentation](https://render.com/docs)

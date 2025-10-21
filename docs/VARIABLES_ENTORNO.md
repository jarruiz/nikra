# 🔐 Variables de Entorno para Render

Este documento lista todas las variables de entorno necesarias para desplegar la aplicación en Render.

## 📋 Variables Obligatorias

Copia estas variables en la sección **Environment** de tu servicio web en Render:

### 🌍 Configuración General

```bash
NODE_ENV=production
PORT=3000
```

### 🗄️ Base de Datos PostgreSQL

Estas variables se obtienen automáticamente de tu servicio PostgreSQL en Render:

```bash
DB_HOST=<tu-servicio>.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=<tu-usuario>
DB_PASSWORD=<tu-password-desde-render>
DB_DATABASE=nikra_db
```

**💡 Tip**: En la UI de Render, cuando añadas estas variables, puedes seleccionar tu base de datos PostgreSQL desde el dropdown y Render las autocompletará.

### 🔐 JWT Authentication

**⚠️ IMPORTANTE**: Genera valores únicos y seguros para cada secret.

```bash
JWT_SECRET=<genera-valor-seguro-32-caracteres-minimo>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<genera-otro-valor-seguro-diferente>
JWT_REFRESH_EXPIRES_IN=7d
```

#### Cómo generar secrets seguros:

**Opción 1: Con Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción 2: Con OpenSSL**
```bash
openssl rand -hex 32
```

**Opción 3: Con 1Password / LastPass**
- Genera una contraseña aleatoria de 64 caracteres
- Incluye letras, números y símbolos

**Ejemplo de output:**
```
7f3a9e8c5b2d1f4a6e8c9b7d5f3a1e8c9b7d5f3a1e8c7f3a9e8c5b2d1f4a6e8c
```

## 📋 Variables Opcionales

### CORS Configuration

Si tu frontend está en un dominio específico:

```bash
CORS_ORIGIN=https://tu-frontend.com
```

### File Upload Configuration

```bash
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/app/uploads
```

### Logging

```bash
LOG_LEVEL=info
```

## 🎯 Configuración Completa para Copiar

Aquí está el set completo de variables para copiar y pegar en Render (recuerda reemplazar los valores entre `<>`):

```bash
# Entorno
NODE_ENV=production
PORT=3000

# Base de Datos (autocompletar desde Render)
DB_HOST=<desde-render-postgresql>
DB_PORT=5432
DB_USERNAME=<desde-render-postgresql>
DB_PASSWORD=<desde-render-postgresql>
DB_DATABASE=nikra_db

# JWT (generar valores seguros)
JWT_SECRET=<GENERA_VALOR_SEGURO_32_CARACTERES>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<GENERA_OTRO_VALOR_SEGURO_DIFERENTE>
JWT_REFRESH_EXPIRES_IN=7d

# Opcional: CORS
# CORS_ORIGIN=https://tu-frontend.com
```

## 🔄 Actualizar Variables

Para actualizar una variable después del despliegue:

1. Ve a tu servicio web en Render Dashboard
2. Click en **"Environment"** en el menú lateral
3. Encuentra la variable que quieres actualizar
4. Click en el icono de editar ✏️
5. Actualiza el valor
6. Click en **"Save Changes"**
7. Render redesplegará automáticamente tu aplicación

## 🔍 Verificar Variables

Después de configurar las variables, verifica que estén correctas:

1. Ve a tu servicio web → **"Shell"**
2. Ejecuta:

```bash
# Verificar que NODE_ENV esté configurado
echo $NODE_ENV

# Verificar conexión a la base de datos (no muestra password)
echo "Host: $DB_HOST"
echo "Database: $DB_DATABASE"
echo "User: $DB_USERNAME"

# Verificar que JWT secrets estén configurados (no muestra el valor)
if [ -z "$JWT_SECRET" ]; then echo "❌ JWT_SECRET no configurado"; else echo "✅ JWT_SECRET configurado"; fi
if [ -z "$JWT_REFRESH_SECRET" ]; then echo "❌ JWT_REFRESH_SECRET no configurado"; else echo "✅ JWT_REFRESH_SECRET configurado"; fi
```

## ⚠️ Seguridad

### ❌ NUNCA hagas esto:

- ❌ Commitear archivos `.env` al repositorio
- ❌ Compartir secrets en Slack, email o documentos
- ❌ Usar valores por defecto como `secret` o `password123`
- ❌ Reutilizar el mismo JWT_SECRET entre desarrollo y producción

### ✅ Buenas prácticas:

- ✅ Usa un gestor de contraseñas (1Password, LastPass, Bitwarden)
- ✅ Genera secrets únicos para cada entorno
- ✅ Rota los secrets periódicamente (cada 3-6 meses)
- ✅ Usa secrets de al menos 32 caracteres
- ✅ Mantén backups seguros de tus secrets

## 🚨 Si comprometes un secret

Si accidentalmente expones un secret:

1. **Inmediatamente** genera un nuevo valor
2. Actualiza la variable en Render
3. Cierra todas las sesiones activas (si aplica)
4. Investiga si hubo acceso no autorizado
5. Si el secret fue commiteado a Git:
   - Revoca el secret comprometido
   - Considera reescribir el historial de Git (con cuidado)
   - Rota todos los secrets relacionados

## 📞 Soporte

Si tienes problemas con las variables de entorno:

- Revisa la [Guía de Despliegue](./DESPLIEGUE_RENDER.md)
- Consulta [Render Docs - Environment Variables](https://render.com/docs/environment-variables)
- Contacta al equipo: creative.feelve@gmail.com

---

**Última actualización**: Octubre 2025


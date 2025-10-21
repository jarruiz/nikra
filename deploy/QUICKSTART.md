# ⚡ Quick Start - Despliegue Automatizado

Despliega tu aplicación en Render en 3 comandos.

## 🚀 Comando Rápido

```bash
# Desde la raíz del proyecto
cd deploy

# 1. Genera todos los secrets de forma segura
./generate-secrets.sh

# 2. Sigue el asistente interactivo de despliegue
./deploy-to-render.sh

# 3. Verifica que todo funcione
./verify-deployment.sh https://tu-servicio.onrender.com
```

## 📋 ¿Qué hace cada script?

### 1️⃣ `generate-secrets.sh`

Genera automáticamente:
- ✅ `JWT_SECRET` (64 caracteres, criptográficamente seguro)
- ✅ `JWT_REFRESH_SECRET` (64 caracteres, diferente del anterior)
- ✅ `DB_USERNAME` (único)
- ✅ `DB_PASSWORD` (24 caracteres, seguro)

**Output:**
- `deploy/.env.render` - Todos los secrets
- `deploy/render-variables.txt` - Para copiar en Render UI
- `deploy/configure-render-cli.sh` - Para configurar con CLI

### 2️⃣ `deploy-to-render.sh`

Asistente interactivo que:
- ✅ Verifica prerequisitos (Node.js, Git, etc.)
- ✅ Genera secrets si no existen
- ✅ Verifica que el código compile
- ✅ Guía el proceso de Git (commit, push)
- ✅ Explica cómo configurar en Render
- ✅ Te ayuda a configurar variables de entorno
- ✅ Guía la ejecución de migraciones
- ✅ Verifica el despliegue

### 3️⃣ `verify-deployment.sh`

Verifica automáticamente:
- ✅ Servicio responde (HTTP 200)
- ✅ Swagger UI accesible
- ✅ Endpoints principales funcionan
- ✅ Tiempos de respuesta aceptables
- ✅ Health checks pasan

## 🎯 Ejemplo Completo

```bash
$ cd deploy

$ ./generate-secrets.sh
╔═══════════════════════════════════════════════════╗
║   🔐  GENERADOR DE SECRETS PARA RENDER           ║
╚═══════════════════════════════════════════════════╝

✅ Node.js detectado: v18.x.x

🔧 Generando secrets seguros...
   🔑 Generando JWT_SECRET... ✓
   🔑 Generando JWT_REFRESH_SECRET... ✓
   🗄️  Generando DB_PASSWORD... ✓
   👤 Generando DB_USERNAME... ✓

✅ Archivo generado exitosamente!

$ ./deploy-to-render.sh
╔═══════════════════════════════════════════════════════╗
║   🚀  DESPLIEGUE AUTOMATIZADO A RENDER               ║
╚═══════════════════════════════════════════════════════╝

[Sigue las instrucciones interactivas...]

$ ./verify-deployment.sh https://nikra-backend.onrender.com
╔═══════════════════════════════════════════════════════╗
║   ✅  VERIFICACIÓN DE DESPLIEGUE                     ║
╚═══════════════════════════════════════════════════════╝

Verificando servicio: https://nikra-backend.onrender.com

   🔍 Servicio responde... ✅ OK (245ms)
   🔍 Swagger UI accesible... ✅ OK (189ms)
   🔍 Swagger JSON... ✅ OK (156ms)
   🔍 Auth endpoints... ✅ OK (Endpoint existe)
   ...

╔═══════════════════════════════════════════════════════╗
║   ✅  DESPLIEGUE VERIFICADO EXITOSAMENTE             ║
╚═══════════════════════════════════════════════════════╝

Tu aplicación está funcionando correctamente! 🎉
```

## 🔐 Seguridad

Los scripts automáticamente:
- 🔒 Aplican permisos restrictivos (600) a archivos con secrets
- 🔒 Crean backups automáticos al regenerar
- 🔒 Generan secrets usando `crypto.randomBytes()` de Node.js
- 🔒 Nunca muestran secrets completos en pantalla
- 🔒 Los archivos sensibles están en `.gitignore`

## 🆘 Si algo falla

```bash
# Verifica que Node.js esté instalado
node --version

# Verifica permisos de ejecución
chmod +x *.sh

# Regenera secrets si es necesario
./generate-secrets.sh

# Revisa la documentación completa
cat README.md
```

## 📚 Más Información

- [README Completo del Deploy](./README.md)
- [Documentación Completa de Render](../docs/DESPLIEGUE_RENDER.md)
- [Checklist de Despliegue](../CHECKLIST_DESPLIEGUE.md)

---

**¡Listo! En menos de 10 minutos tendrás tu aplicación desplegada en Render.** 🚀


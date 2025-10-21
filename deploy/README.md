# 🚀 Deploy - Scripts de Automatización para Render

Este directorio contiene scripts automatizados para facilitar el despliegue seguro en Render.

## 📁 Contenido

| Archivo | Descripción |
|---------|-------------|
| `generate-secrets.sh` | **Script principal** - Genera todos los secrets necesarios |
| `deploy-to-render.sh` | Script interactivo de despliegue completo |
| `verify-deployment.sh` | Verifica que el despliegue sea exitoso |
| `.env.render` | Archivo generado con secrets (NO commitear) |
| `render-variables.txt` | Variables formateadas para copiar en Render UI |

## 🔧 Uso Rápido

### Paso 1: Generar Secrets

```bash
cd deploy
./generate-secrets.sh
```

Este script:
- ✅ Genera `JWT_SECRET` único y seguro (64 caracteres)
- ✅ Genera `JWT_REFRESH_SECRET` único y seguro (64 caracteres)
- ✅ Genera `DB_USERNAME` único
- ✅ Genera `DB_PASSWORD` seguro (24 caracteres)
- ✅ Crea archivo `.env.render` con todos los valores
- ✅ Crea archivo `render-variables.txt` para copiar/pegar
- ✅ Hace backup de archivos existentes
- ✅ Aplica permisos de seguridad (600)

**Output:**
```
deploy/
├── .env.render              ← Archivo con todos los secrets
├── .env.render.backup.*     ← Backups automáticos
└── render-variables.txt     ← Para copiar en Render UI
```

### Paso 2: Configurar en Render

**Opción A: Usando Render UI (Recomendado para principiantes)**

1. Abre el archivo generado:
   ```bash
   cat render-variables.txt
   ```

2. Ve a [Render Dashboard](https://dashboard.render.com)
3. Selecciona tu servicio → **Environment**
4. Copia y pega las variables del archivo

**Opción B: Usando Render CLI (Para usuarios avanzados)**

1. Instala Render CLI:
   ```bash
   npm install -g @render/cli
   ```

2. Autentícate:
   ```bash
   render login
   ```

3. Ejecuta el script de configuración:
   ```bash
   ./configure-render-cli.sh
   ```

### Paso 3: Desplegar

**Opción A: Usando Blueprint (Automático)**

```bash
# Asegúrate de que render.yaml está en la raíz
cd ..
git add .
git commit -m "chore: add Render deployment configuration"
git push

# Luego en Render Dashboard:
# New + → Blueprint → Selecciona tu repo
```

**Opción B: Despliegue Interactivo (Script Automatizado)**

```bash
./deploy-to-render.sh
```

Este script te guiará por todo el proceso.

### Paso 4: Verificar Despliegue

```bash
./verify-deployment.sh https://tu-servicio.onrender.com
```

---

## 📖 Scripts Detallados

### 🔐 generate-secrets.sh

Genera todos los secrets de forma segura usando criptografía de Node.js.

**Uso:**
```bash
./generate-secrets.sh
```

**Características:**
- 🔒 Usa `crypto.randomBytes()` para máxima seguridad
- 💾 Hace backup automático de archivos existentes
- 📋 Genera múltiples formatos de output
- 🔐 Aplica permisos restrictivos (600)
- ✅ Verifica que Node.js esté instalado
- 🎨 Output con colores para mejor legibilidad

**Archivos generados:**

1. **`.env.render`**: Archivo principal con todas las variables
   - Formato: Compatible con dotenv
   - Permisos: 600 (solo lectura/escritura para el propietario)
   - Incluye: Metadata y comentarios explicativos

2. **`render-variables.txt`**: Variables formateadas para Render UI
   - Formato: Listo para copiar y pegar
   - Incluye: Instrucciones de uso
   - Secciones: Organizadas por categoría

3. **`configure-render-cli.sh`**: Script para configurar con CLI
   - Ejecutable automáticamente
   - Valida requisitos
   - Configura todas las variables

**Ejemplo de output:**
```
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
```

---

### 🚀 deploy-to-render.sh

Script interactivo que guía por todo el proceso de despliegue.

**Uso:**
```bash
./deploy-to-render.sh
```

**Características:**
- 📋 Checklist interactivo
- ✅ Verificaciones previas al despliegue
- 🔍 Detecta configuración existente
- 🎯 Guía paso a paso
- 🔗 Abre URLs relevantes automáticamente

**Proceso:**
1. Verifica prerequisitos (Node.js, Git, archivos necesarios)
2. Genera secrets si no existen
3. Verifica que el código compile
4. Guía la configuración en Render
5. Espera confirmación de despliegue
6. Ejecuta migraciones automáticamente
7. Verifica que el servicio esté funcionando

---

### ✅ verify-deployment.sh

Verifica que el despliegue sea exitoso y funcione correctamente.

**Uso:**
```bash
./verify-deployment.sh https://tu-servicio.onrender.com
```

**Verificaciones:**
- ✅ Servicio responde (HTTP 200)
- ✅ Swagger UI accesible
- ✅ Base de datos conectada
- ✅ Endpoints principales funcionan
- ✅ Health checks pasan
- ✅ Response times aceptables

**Output:**
```
🔍 Verificando despliegue...

✅ Servicio responde: 200 OK
✅ Swagger UI accesible
✅ Endpoint /api/docs: OK
✅ Response time: 245ms

✨ Despliegue verificado exitosamente!
```

---

## 🔐 Seguridad

### Archivos Protegidos

Los siguientes archivos **NO deben commitearse** a Git:

- ❌ `.env.render`
- ❌ `.env.render.backup.*`
- ❌ `render-variables.txt`
- ❌ Cualquier archivo con secrets

El `.gitignore` ya está configurado para excluirlos.

### Mejores Prácticas

1. **Genera secrets únicos para cada entorno**
   - Desarrollo: Genera un set
   - Staging: Genera otro set diferente
   - Producción: Genera otro set diferente

2. **Guarda los secrets en un gestor de contraseñas**
   - ✅ 1Password
   - ✅ LastPass
   - ✅ Bitwarden
   - ✅ AWS Secrets Manager
   - ✅ HashiCorp Vault

3. **Rota los secrets periódicamente**
   - JWT secrets: Cada 3-6 meses
   - Database passwords: Cada 6-12 meses
   - Después de cualquier compromiso de seguridad

4. **Limita el acceso**
   - Solo personal autorizado debe tener acceso
   - Usa permisos restrictivos (600) en archivos locales
   - No compartas secrets por email, Slack, etc.

5. **Monitorea el uso**
   - Revisa logs de acceso regularmente
   - Configura alertas para actividad sospechosa
   - Audita quién tiene acceso a los secrets

---

## 🔄 Flujo de Trabajo Recomendado

### Primera Vez

```bash
# 1. Generar secrets
cd deploy
./generate-secrets.sh

# 2. Guardar secrets en gestor de contraseñas
# (Copia los valores de .env.render a tu gestor)

# 3. Commitear configuración (sin secrets)
cd ..
git add render.yaml deploy/*.sh deploy/README.md
git commit -m "chore: add deployment scripts"
git push

# 4. Desplegar en Render
# Usa Blueprint en Render Dashboard

# 5. Configurar secrets en Render UI
# Copia desde render-variables.txt

# 6. Verificar despliegue
cd deploy
./verify-deployment.sh https://tu-servicio.onrender.com
```

### Actualizaciones

```bash
# 1. Hacer cambios en el código
# 2. Commitear y pushear
git add .
git commit -m "feat: nueva funcionalidad"
git push

# 3. Render despliega automáticamente
# 4. Verificar
cd deploy
./verify-deployment.sh https://tu-servicio.onrender.com
```

### Rotar Secrets

```bash
# 1. Generar nuevos secrets
cd deploy
./generate-secrets.sh

# 2. Actualizar en Render Dashboard
# Environment → Editar variables → Pegar nuevos valores

# 3. Render redespliega automáticamente

# 4. Guardar nuevos secrets en gestor de contraseñas

# 5. Invalidar tokens JWT antiguos (si aplica)
```

---

## 🆘 Solución de Problemas

### "Node.js not found"

```bash
# Verifica instalación
node --version

# Si no está instalado, instala desde:
# https://nodejs.org
```

### "Permission denied"

```bash
# Da permisos de ejecución a los scripts
chmod +x *.sh
```

### "Archivo .env.render ya existe"

El script hace backup automático con timestamp:
```
.env.render.backup.20251021_143025
```

### "Los secrets no funcionan en Render"

1. Verifica que copiaste correctamente (sin espacios extra)
2. Asegúrate de guardar los cambios en Render
3. Render redespliega automáticamente al cambiar variables
4. Verifica los logs para errores específicos

---

## 📚 Referencias

- [Guía Completa de Despliegue](../docs/DESPLIEGUE_RENDER.md)
- [Variables de Entorno](../docs/VARIABLES_ENTORNO.md)
- [Render Docs](https://render.com/docs)
- [Render CLI](https://render.com/docs/cli)

---

## 💡 Tips

### Desarrollo Local

Los secrets generados son para producción. Para desarrollo local:

```bash
# Copia el template
cp .env.example .env.local

# Usa valores simples para desarrollo
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-secret
```

### Múltiples Entornos

Para gestionar múltiples entornos:

```bash
# Generar para staging
./generate-secrets.sh
mv .env.render .env.render.staging

# Generar para producción
./generate-secrets.sh
mv .env.render .env.render.production
```

### Automatización CI/CD

Para integrar con GitHub Actions:

```yaml
# .github/workflows/deploy.yml
- name: Generate secrets
  run: |
    cd deploy
    ./generate-secrets.sh
    # Usa GitHub Secrets para secrets reales
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta documentación
2. Consulta los [docs de Render](https://render.com/docs)
3. Revisa los logs del script: Incluyen mensajes de error detallados
4. Contacta al equipo: creative.feelve@gmail.com

---

**Última actualización**: Octubre 2025

¡Feliz despliegue automatizado! 🚀


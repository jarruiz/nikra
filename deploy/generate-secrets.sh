#!/bin/bash
# ==============================================
# 🔐 GENERADOR DE SECRETS PARA RENDER
# ==============================================
# Este script genera automáticamente todos los secrets necesarios
# para desplegar la aplicación en Render de forma segura

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║   🔐  GENERADOR DE SECRETS PARA RENDER           ║"
echo "║       Nikra Backend - CCA Ceuta                  ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js no está instalado${NC}"
    echo "   Instala Node.js desde: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detectado: $(node --version)${NC}"
echo ""

# Función para generar un secret seguro
generate_secret() {
    local length=${1:-32}
    node -e "console.log(require('crypto').randomBytes($length).toString('hex'))"
}

# Función para generar una contraseña legible pero segura
generate_password() {
    node -e "console.log(require('crypto').randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 24))"
}

# Directorio de output (directorio actual)
OUTPUT_DIR="."
OUTPUT_FILE="$OUTPUT_DIR/.env.render"
OUTPUT_FILE_BACKUP="$OUTPUT_DIR/.env.render.backup"

# Crear backup si existe archivo previo
if [ -f "$OUTPUT_FILE" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$OUTPUT_DIR/.env.render.backup.$TIMESTAMP"
    echo -e "${YELLOW}⚠️  Archivo existente detectado${NC}"
    echo "   Creando backup: $BACKUP_FILE"
    cp "$OUTPUT_FILE" "$BACKUP_FILE"
    echo ""
fi

echo -e "${BLUE}🔧 Generando secrets seguros...${NC}"
echo ""

# Generar secrets
echo -n "   🔑 Generando JWT_SECRET..."
JWT_SECRET=$(generate_secret 32)
echo -e " ${GREEN}✓${NC}"

echo -n "   🔑 Generando JWT_REFRESH_SECRET..."
JWT_REFRESH_SECRET=$(generate_secret 32)
echo -e " ${GREEN}✓${NC}"

echo -n "   🗄️  Generando DB_PASSWORD..."
DB_PASSWORD=$(generate_password)
echo -e " ${GREEN}✓${NC}"

echo -n "   👤 Generando DB_USERNAME..."
DB_USERNAME="nikra_user_$(node -e "console.log(require('crypto').randomBytes(4).toString('hex'))")"
echo -e " ${GREEN}✓${NC}"

echo ""
echo -e "${BLUE}📝 Generando archivo de configuración...${NC}"

# Obtener timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Crear archivo .env.render con todos los valores
cat > "$OUTPUT_FILE" << EOF
# ==============================================
# 🔐 VARIABLES DE ENTORNO PARA RENDER
# ==============================================
# Generado automáticamente: $TIMESTAMP
# ⚠️  IMPORTANTE: Este archivo contiene secrets sensibles
# NO commitear este archivo a Git

# ==============================================
# 🌍 CONFIGURACIÓN GENERAL
# ==============================================
NODE_ENV=production
PORT=3000

# ==============================================
# 🗄️  BASE DE DATOS POSTGRESQL
# ==============================================
# Estos valores se configuran automáticamente si usas Blueprint
# con render.yaml. Si configuras manualmente, usa estos valores:

DB_HOST=<render-proporcionará-esto>
DB_PORT=5432
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=nikra_db

# ==============================================
# 🔐 JWT AUTHENTICATION
# ==============================================
# ⚠️  CRÍTICO: Estos valores NUNCA deben compartirse públicamente

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# ==============================================
# 🌐 CONFIGURACIÓN OPCIONAL
# ==============================================
# Descomenta y configura según necesites

# CORS_ORIGIN=https://tu-frontend.com
# MAX_FILE_SIZE=5242880
# UPLOAD_DIR=/app/uploads

# ==============================================
# 📊 METADATA
# ==============================================
# Información del deployment

GENERATED_AT=$TIMESTAMP
GENERATED_BY=$(whoami)
DEPLOYMENT_ENV=production
EOF

echo ""
echo -e "${GREEN}✅ Archivo generado exitosamente!${NC}"
echo ""

# Mostrar resumen
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                RESUMEN DE SECRETS                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📁 Archivo generado:${NC} $OUTPUT_FILE"
echo ""
echo -e "${GREEN}Secrets generados:${NC}"
echo "   ✓ JWT_SECRET (64 caracteres)"
echo "   ✓ JWT_REFRESH_SECRET (64 caracteres)"
echo "   ✓ DB_PASSWORD (24 caracteres)"
echo "   ✓ DB_USERNAME (único)"
echo ""

# Mostrar los valores (parcialmente ocultos por seguridad)
echo -e "${YELLOW}Vista previa de secrets (parcial):${NC}"
echo "   JWT_SECRET:         ${JWT_SECRET:0:8}...${JWT_SECRET: -8}"
echo "   JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:0:8}...${JWT_REFRESH_SECRET: -8}"
echo "   DB_USERNAME:        $DB_USERNAME"
echo "   DB_PASSWORD:        ${DB_PASSWORD:0:4}...${DB_PASSWORD: -4}"
echo ""

# Crear archivo de solo lectura para mayor seguridad
chmod 600 "$OUTPUT_FILE"
echo -e "${GREEN}🔒 Permisos de seguridad aplicados (600)${NC}"
echo ""

# Generar archivo para copiar en Render UI
RENDER_VARS_FILE="./render-variables.txt"
cat > "$RENDER_VARS_FILE" << EOF
═══════════════════════════════════════════════════════════
VARIABLES DE ENTORNO PARA RENDER - COPIA Y PEGA
═══════════════════════════════════════════════════════════
Generado: $TIMESTAMP

Instrucciones:
1. Ve a tu servicio en Render Dashboard
2. Click en "Environment" en el menú lateral
3. Copia y pega cada variable abajo

═══════════════════════════════════════════════════════════

VARIABLES GENERALES
═══════════════════════════════════════════════════════════
NODE_ENV=production
PORT=3000

═══════════════════════════════════════════════════════════
BASE DE DATOS (Si configuras manualmente)
═══════════════════════════════════════════════════════════
Nota: Si usas Blueprint con render.yaml, estas se autoconfiguran.
Solo necesitas configurar DB_USERNAME y DB_PASSWORD si creas
la base de datos manualmente.

DB_HOST=<desde-render-postgresql>
DB_PORT=5432
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=nikra_db

═══════════════════════════════════════════════════════════
JWT SECRETS (IMPORTANTE - CONFIGURA ESTOS MANUALMENTE)
═══════════════════════════════════════════════════════════
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

═══════════════════════════════════════════════════════════

⚠️  IMPORTANTE:
- Guarda estos valores en un lugar seguro (1Password, LastPass, etc.)
- NO los compartas por email, Slack, o documentos públicos
- NO los commitees a Git

✅ PRÓXIMOS PASOS:
1. Guarda estos valores en tu gestor de contraseñas
2. Configura las variables en Render Dashboard
3. Despliega tu aplicación
4. Ejecuta las migraciones: npm run migration:run

═══════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}📋 Archivo de variables para Render UI generado:${NC}"
echo "   $RENDER_VARS_FILE"
echo ""

# Generar script para configurar con Render CLI
RENDER_CLI_FILE="./configure-render-cli.sh"
cat > "$RENDER_CLI_FILE" << 'EOF_SCRIPT'
#!/bin/bash
# ==============================================
# 🚀 CONFIGURAR VARIABLES EN RENDER (usando CLI)
# ==============================================
# Este script configura las variables de entorno en Render
# usando la CLI de Render

set -e

# Cargar las variables generadas
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ ! -f "$SCRIPT_DIR/.env.render" ]; then
    echo "❌ Error: Archivo .env.render no encontrado"
    echo "   Ejecuta primero: ./generate-secrets.sh"
    exit 1
fi

source "$SCRIPT_DIR/.env.render"

# Verificar que Render CLI está instalado
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI no está instalado"
    echo ""
    echo "Instala con:"
    echo "  npm install -g @render/cli"
    echo ""
    exit 1
fi

# Solicitar el service ID
echo "🔍 Necesitas el Service ID de tu servicio web en Render"
echo "   Puedes encontrarlo en la URL de tu servicio:"
echo "   https://dashboard.render.com/web/srv-XXXXXXXXXXXX"
echo ""
read -p "Service ID (srv-XXXXXXXXXXXX): " SERVICE_ID

if [ -z "$SERVICE_ID" ]; then
    echo "❌ Service ID es requerido"
    exit 1
fi

echo ""
echo "🚀 Configurando variables de entorno en Render..."
echo ""

# Configurar variables usando Render CLI
render env set -s "$SERVICE_ID" NODE_ENV="$NODE_ENV"
render env set -s "$SERVICE_ID" PORT="$PORT"
render env set -s "$SERVICE_ID" JWT_SECRET="$JWT_SECRET"
render env set -s "$SERVICE_ID" JWT_EXPIRES_IN="$JWT_EXPIRES_IN"
render env set -s "$SERVICE_ID" JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
render env set -s "$SERVICE_ID" JWT_REFRESH_EXPIRES_IN="$JWT_REFRESH_EXPIRES_IN"

echo ""
echo "✅ Variables configuradas exitosamente!"
echo ""
echo "ℹ️  Nota: Las variables de base de datos (DB_*) se configuran"
echo "   automáticamente si usas Blueprint con render.yaml"
echo ""
echo "🔄 Render redesplegará automáticamente tu servicio"
echo ""
EOF_SCRIPT

chmod +x "$RENDER_CLI_FILE"

echo -e "${GREEN}🔧 Script de configuración CLI generado:${NC}"
echo "   $RENDER_CLI_FILE"
echo ""

# Instrucciones finales
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            PRÓXIMOS PASOS                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}1.${NC} Guarda los secrets en un lugar seguro:"
echo "   - 1Password, LastPass, Bitwarden, etc."
echo "   - Archivo: $OUTPUT_FILE"
echo ""
echo -e "${YELLOW}2.${NC} Configura las variables en Render:"
echo ""
echo -e "   ${GREEN}Opción A:${NC} Usando la UI de Render (Recomendado)"
echo "   - Abre: $RENDER_VARS_FILE"
echo "   - Copia las variables al Dashboard de Render"
echo ""
echo -e "   ${GREEN}Opción B:${NC} Usando Render CLI"
echo "   - Ejecuta: $RENDER_CLI_FILE"
echo ""
echo -e "${YELLOW}3.${NC} Despliega tu aplicación en Render"
echo ""
echo -e "${YELLOW}4.${NC} Ejecuta las migraciones:"
echo "   render exec <tu-servicio> npm run migration:run"
echo ""
echo -e "${RED}⚠️  SEGURIDAD:${NC}"
echo "   - NO commitees los archivos .env.render a Git"
echo "   - NO compartas los secrets públicamente"
echo "   - El archivo .gitignore ya está configurado"
echo ""
echo -e "${GREEN}✨ ¡Listo! Tus secrets están generados y seguros${NC}"
echo ""


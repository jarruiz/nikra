#!/bin/bash
# ==============================================
# 🚀 SCRIPT DE DESPLIEGUE AUTOMATIZADO A RENDER
# ==============================================
# Script interactivo que guía todo el proceso de despliegue

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀  DESPLIEGUE AUTOMATIZADO A RENDER                   ║
║       Nikra Backend - CCA Ceuta                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Función para pausar y esperar confirmación
pause() {
    echo ""
    read -p "$(echo -e ${CYAN}Presiona ENTER para continuar...${NC})"
    echo ""
}

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 detectado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 no encontrado${NC}"
        return 1
    fi
}

# Función para preguntar sí/no
ask_yes_no() {
    local prompt="$1"
    local response
    while true; do
        read -p "$(echo -e ${YELLOW}$prompt [s/n]: ${NC})" response
        case $response in
            [Ss]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde 's' o 'n'.";;
        esac
    done
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 1: VERIFICACIÓN DE PREREQUISITOS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar Node.js
if ! check_command node; then
    echo -e "${RED}Instala Node.js desde: https://nodejs.org${NC}"
    exit 1
fi
echo "   $(node --version)"

# Verificar npm
if ! check_command npm; then
    echo -e "${RED}npm no está instalado${NC}"
    exit 1
fi
echo "   $(npm --version)"

# Verificar Git
if ! check_command git; then
    echo -e "${RED}Git no está instalado${NC}"
    exit 1
fi
echo "   $(git --version)"

# Verificar que estamos en el directorio correcto
if [ ! -f "../package.json" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde el directorio deploy/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Directorio correcto${NC}"

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 2: GENERACIÓN DE SECRETS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f ".env.render" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.render ya existe${NC}"
    echo ""
    if ask_yes_no "¿Quieres regenerar los secrets (se hará backup del anterior)?"; then
        ./generate-secrets.sh
    else
        echo -e "${GREEN}✅ Usando secrets existentes${NC}"
    fi
else
    echo -e "${CYAN}Generando secrets por primera vez...${NC}"
    echo ""
    ./generate-secrets.sh
fi

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 3: VERIFICACIÓN DEL CÓDIGO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd ..

echo -n "Verificando que el código compile... "
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FALLO${NC}"
    echo ""
    echo -e "${RED}El código tiene errores de compilación.${NC}"
    echo "Ejecuta 'npm run build' para ver los errores."
    exit 1
fi

echo -n "Verificando archivos necesarios... "
REQUIRED_FILES=("package.json" "render.yaml" "ormconfig.ts" "src/main.ts")
ALL_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Falta: $file${NC}"
        ALL_EXIST=false
    fi
done

if $ALL_EXIST; then
    echo -e "${GREEN}✅ OK${NC}"
else
    exit 1
fi

cd deploy

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 4: ESTADO DE GIT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

cd ..

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${CYAN}Branch actual:${NC} $CURRENT_BRANCH"

# Verificar cambios sin commitear
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Tienes cambios sin commitear:${NC}"
    echo ""
    git status -s
    echo ""
    
    if ask_yes_no "¿Quieres commitear estos cambios ahora?"; then
        read -p "Mensaje del commit: " commit_message
        git add .
        git commit -m "$commit_message"
        echo -e "${GREEN}✅ Cambios commiteados${NC}"
    fi
else
    echo -e "${GREEN}✅ No hay cambios pendientes${NC}"
fi

echo ""
if ask_yes_no "¿Quieres pushear a $CURRENT_BRANCH?"; then
    git push origin "$CURRENT_BRANCH"
    echo -e "${GREEN}✅ Push completado${NC}"
fi

cd deploy

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 5: CONFIGURACIÓN EN RENDER${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Ahora necesitas configurar tu servicio en Render:${NC}"
echo ""
echo -e "${YELLOW}Opción A: Usando Blueprint (Recomendado)${NC}"
echo "   1. Ve a: https://dashboard.render.com"
echo "   2. Click en 'New +' → 'Blueprint'"
echo "   3. Conecta tu repositorio"
echo "   4. Render detectará render.yaml automáticamente"
echo "   5. Click en 'Apply'"
echo ""
echo -e "${YELLOW}Opción B: Configuración Manual${NC}"
echo "   1. Ve a: https://dashboard.render.com"
echo "   2. Crea PostgreSQL Database"
echo "   3. Crea Web Service"
echo "   4. Configura variables de entorno"
echo ""

if ask_yes_no "¿Ya tienes un servicio creado en Render?"; then
    SERVICE_CREATED=true
else
    SERVICE_CREATED=false
    echo ""
    echo -e "${CYAN}Por favor, crea tu servicio en Render antes de continuar.${NC}"
    pause
    SERVICE_CREATED=true
fi

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 6: CONFIGURAR VARIABLES DE ENTORNO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Tienes que configurar las variables de entorno en Render:${NC}"
echo ""
echo "1. Ve a tu servicio en Render Dashboard"
echo "2. Click en 'Environment' en el menú lateral"
echo "3. Abre el archivo: ${YELLOW}render-variables.txt${NC}"
echo "4. Copia y pega cada variable"
echo ""
echo -e "${YELLOW}💡 Tip: Puedes abrir el archivo con:${NC}"
echo "   cat render-variables.txt"
echo ""

if ask_yes_no "¿Quieres abrir el archivo ahora?"; then
    if command -v less &> /dev/null; then
        less render-variables.txt
    else
        cat render-variables.txt
        pause
    fi
fi

echo ""
if ! ask_yes_no "¿Has configurado todas las variables en Render?"; then
    echo ""
    echo -e "${YELLOW}Por favor, configura las variables antes de continuar.${NC}"
    pause
fi

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 7: ESPERANDO DESPLIEGUE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Render está desplegando tu aplicación...${NC}"
echo ""
echo "Puedes ver el progreso en:"
echo "https://dashboard.render.com"
echo ""
echo -e "${YELLOW}Espera hasta que el estado sea 'Live' (verde)${NC}"
echo ""

read -p "URL de tu servicio (ej: https://nikra-backend.onrender.com): " SERVICE_URL

if [ -z "$SERVICE_URL" ]; then
    echo -e "${YELLOW}⚠️  No proporcionaste URL, saltando verificación automática${NC}"
    SKIP_VERIFY=true
else
    SKIP_VERIFY=false
fi

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 8: EJECUTAR MIGRACIONES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${CYAN}Ahora necesitas ejecutar las migraciones de base de datos:${NC}"
echo ""
echo -e "${YELLOW}Opción A: Desde Render Shell (Recomendado)${NC}"
echo "   1. Ve a tu servicio en Render"
echo "   2. Click en 'Shell' en el menú lateral"
echo "   3. Ejecuta: npm run migration:run"
echo "   4. Verifica: npm run migration:show"
echo ""
echo -e "${YELLOW}Opción B: Usando Render CLI${NC}"
echo "   render exec <tu-servicio> npm run migration:run"
echo ""

if ! ask_yes_no "¿Has ejecutado las migraciones?"; then
    echo ""
    echo -e "${YELLOW}Por favor, ejecuta las migraciones antes de continuar.${NC}"
    pause
fi

pause

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PASO 9: VERIFICACIÓN FINAL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$SKIP_VERIFY" = false ]; then
    if [ -f "verify-deployment.sh" ]; then
        echo -e "${CYAN}Ejecutando verificación automática...${NC}"
        echo ""
        ./verify-deployment.sh "$SERVICE_URL"
    else
        echo -e "${YELLOW}⚠️  Script de verificación no encontrado${NC}"
        echo "Verifica manualmente: $SERVICE_URL/api/docs"
    fi
else
    echo -e "${CYAN}Verifica manualmente que tu aplicación funcione:${NC}"
    echo ""
    echo "1. Accede a tu servicio"
    echo "2. Verifica Swagger UI: /api/docs"
    echo "3. Prueba el endpoint de login"
    echo ""
fi

pause

# Resumen final
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅  ¡DESPLIEGUE COMPLETADO!                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

echo -e "${GREEN}Tu aplicación está desplegada y funcionando en Render!${NC}"
echo ""

if [ "$SKIP_VERIFY" = false ]; then
    echo -e "${CYAN}URLs importantes:${NC}"
    echo "   🌐 Aplicación:  $SERVICE_URL"
    echo "   📚 Swagger UI:  $SERVICE_URL/api/docs"
    echo ""
fi

echo -e "${CYAN}Próximos pasos:${NC}"
echo "   ✓ Guarda los secrets en tu gestor de contraseñas"
echo "   ✓ Configura un dominio personalizado (opcional)"
echo "   ✓ Conecta tu aplicación frontend"
echo "   ✓ Configura monitoreo y alertas"
echo ""

echo -e "${YELLOW}Recursos útiles:${NC}"
echo "   📖 Documentación completa: ../docs/DESPLIEGUE_RENDER.md"
echo "   🔐 Variables de entorno:   ../docs/VARIABLES_ENTORNO.md"
echo "   ✅ Checklist completo:     ../CHECKLIST_DESPLIEGUE.md"
echo ""

echo -e "${GREEN}¡Feliz despliegue! 🚀${NC}"
echo ""


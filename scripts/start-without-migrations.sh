#!/bin/bash
# scripts/start-without-migrations.sh
# Script que inicia el backend SIN ejecutar migraciones
# Usar cuando se ejecutan migraciones manualmente

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar errores
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    echo -e "${RED}⏰ Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}" >&2
    exit 1
}

# Función para mostrar información
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Función para mostrar éxito
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencia
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para separador visual
separator() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Inicio del script
separator
echo -e "${BLUE}🚀 INICIANDO APLICACIÓN (SIN MIGRACIONES AUTOMÁTICAS)${NC}"
echo -e "${BLUE}⏰ Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
separator

# Mostrar información del entorno
log_info "Información del entorno:"
echo "  - NODE_ENV: ${NODE_ENV:-'no configurado'}"
echo "  - DB_HOST: ${DB_HOST:-'no configurado'}"
echo "  - DB_DATABASE: ${DB_DATABASE:-'no configurado'}"
echo "  - DB_PORT: ${DB_PORT:-'no configurado'}"
echo "  - PORT: ${PORT:-'no configurado'}"
echo "  - PWD: $(pwd)"
echo "  - Node version: $(node --version)"
echo "  - NPM version: $(npm --version)"

separator

log_warning "IMPORTANTE: Las migraciones NO se ejecutarán automáticamente"
log_info "Para ejecutar migraciones, usa la Shell de Render y ejecuta:"
echo "  npm run migration:run"

separator

# Iniciar el servidor
echo -e "${BLUE}🏭 INICIANDO SERVIDOR BACKEND${NC}"
echo -e "${BLUE}⏰ Inicio: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
log_info "Modo: Producción (compilado)"
log_info "Comando: npm run start:prod"
separator

# Iniciar el servidor
npm run start:prod

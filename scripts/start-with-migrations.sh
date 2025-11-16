#!/bin/bash
# scripts/start-with-migrations.sh
# Script de iniciación que ejecuta migraciones y luego inicia el backend
# Funciona tanto para testing como producción en Render

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
echo -e "${BLUE}🚀 INICIANDO APLICACIÓN CON MIGRACIONES${NC}"
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

# Paso 1: Ejecutar migraciones
echo -e "${BLUE}📊 PASO 1: EJECUTANDO MIGRACIONES DE BASE DE DATOS${NC}"
echo -e "${BLUE}⏰ Inicio: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
separator

# Verificar conexión a la base de datos antes de ejecutar migraciones
if [ -z "$DB_HOST" ] || [ -z "$DB_DATABASE" ]; then
    log_warning "Variables de entorno de BD no completamente configuradas"
    log_warning "Continuando de todas formas..."
fi

# Ejecutar migraciones con captura de salida
MIGRATION_START=$(date +%s)
if npm run migration:run 2>&1; then
    MIGRATION_END=$(date +%s)
    MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
    log_success "Migraciones ejecutadas correctamente"
    echo -e "${GREEN}⏱️  Duración: ${MIGRATION_DURATION} segundos${NC}"
    echo -e "${GREEN}⏰ Fin: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
else
    MIGRATION_END=$(date +%s)
    MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
    error_exit "Las migraciones fallaron después de ${MIGRATION_DURATION} segundos. No se iniciará el backend."
fi

separator

# Paso 2: Iniciar el backend
echo -e "${BLUE}🏭 PASO 2: INICIANDO SERVIDOR BACKEND${NC}"
echo -e "${BLUE}⏰ Inicio: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
log_info "Modo: Producción (compilado)"
log_info "Comando: npm run start:prod"
separator

# Iniciar el servidor
npm run start:prod


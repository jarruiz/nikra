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

# Verificar variables de entorno de base de datos
if [ -z "$DB_HOST" ] || [ -z "$DB_DATABASE" ]; then
    error_exit "Variables de entorno de BD no configuradas. DB_HOST y DB_DATABASE son requeridas."
fi

# Validar formato del hostname (debe contener un punto para indicar dominio completo)
if [[ ! "$DB_HOST" =~ \. ]]; then
    error_exit "DB_HOST tiene un formato incorrecto: '$DB_HOST'. El hostname debe incluir el dominio completo (ej: dpg-xxxxx-a.oregon-postgres.render.com). Verifica las variables de entorno en Render y asegúrate de que la base de datos esté vinculada correctamente al servicio web."
fi

# Validar que el hostname no esté vacío o solo con espacios
if [ -z "${DB_HOST// }" ]; then
    error_exit "DB_HOST está vacío. Verifica las variables de entorno en Render."
fi

log_info "Validación de variables de entorno: OK"

# Mostrar configuración de conexión (sin password)
log_info "Configuración de conexión a BD:"
echo "  - Host: ${DB_HOST}"
echo "  - Port: ${DB_PORT}"
echo "  - Database: ${DB_DATABASE}"
echo "  - Username: ${DB_USERNAME}"
echo "  - SSL: Habilitado (producción)"

# Delay inicial para bases de datos en modo sleep (free tier)
if [[ "$DB_HOST" == *"render.com"* ]]; then
    log_warning "Base de datos de Render detectada. Esperando 5 segundos para activación (modo sleep)..."
    sleep 5
fi

# Ejecutar migraciones con captura de salida y reintentos
MIGRATION_START=$(date +%s)
MAX_RETRIES=3
RETRY_DELAY=5
RETRY_COUNT=0
MIGRATION_OUTPUT=""

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if [ $RETRY_COUNT -gt 0 ]; then
        log_warning "Reintentando migraciones (intento $RETRY_COUNT de $MAX_RETRIES)..."
        sleep $RETRY_DELAY
    fi
    
    MIGRATION_OUTPUT=$(npm run migration:run 2>&1) && {
        # Éxito
        MIGRATION_END=$(date +%s)
        MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
        log_success "Migraciones ejecutadas correctamente"
        echo -e "${GREEN}⏱️  Duración: ${MIGRATION_DURATION} segundos${NC}"
        echo -e "${GREEN}⏰ Fin: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
        break
    }
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    # Detectar errores específicos de conexión
    if echo "$MIGRATION_OUTPUT" | grep -q "Connection terminated unexpectedly\|ENOTFOUND\|getaddrinfo\|ECONNREFUSED"; then
        log_warning "Error de conexión a la base de datos detectado (intento $RETRY_COUNT de $MAX_RETRIES)"
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            continue
        fi
        echo -e "${YELLOW}Detalles del error:${NC}"
        echo "$MIGRATION_OUTPUT" | grep -i "error\|ENOTFOUND\|getaddrinfo\|Connection terminated" | head -5
        echo ""
        error_exit "No se pudo conectar a la base de datos después de $MAX_RETRIES intentos. Verifica que:
  1. La variable DB_HOST tenga el formato correcto (debe incluir el dominio completo)
  2. La base de datos esté vinculada correctamente al servicio web en Render
  3. Las variables de entorno estén configuradas correctamente en Render Dashboard
  4. La base de datos no esté en modo sleep (si es free tier, puede tardar en activarse)
  Hostname actual: ${DB_HOST}"
    fi
    
    # Si es el último intento, mostrar el error completo
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        MIGRATION_END=$(date +%s)
        MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
        echo -e "${RED}Salida del error:${NC}"
        echo "$MIGRATION_OUTPUT"
        error_exit "Las migraciones fallaron después de ${MIGRATION_DURATION} segundos y $MAX_RETRIES intentos. No se iniciará el backend."
    fi
done

# Si llegamos aquí sin éxito, es un error
if [ $RETRY_COUNT -eq $MAX_RETRIES ] && [ -n "$MIGRATION_OUTPUT" ]; then
    MIGRATION_END=$(date +%s)
    MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))
    echo -e "${RED}Salida del error:${NC}"
    echo "$MIGRATION_OUTPUT"
    error_exit "Las migraciones fallaron después de ${MIGRATION_DURATION} segundos. No se iniciará el backend."
fi

# La duración y éxito ya se muestran en el loop de reintentos

separator

# Paso 2: Iniciar el backend
echo -e "${BLUE}🏭 PASO 2: INICIANDO SERVIDOR BACKEND${NC}"
echo -e "${BLUE}⏰ Inicio: $(date -u +"%Y-%m-%d %H:%M:%S UTC")${NC}"
log_info "Modo: Producción (compilado)"
log_info "Comando: npm run start:prod"
separator

# Iniciar el servidor
npm run start:prod


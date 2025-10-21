#!/bin/bash
# ==============================================
# ✅ VERIFICADOR DE DESPLIEGUE EN RENDER
# ==============================================
# Verifica que el despliegue sea exitoso y funcione

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Verificar que se proporcione la URL
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Debes proporcionar la URL del servicio${NC}"
    echo ""
    echo "Uso:"
    echo "  ./verify-deployment.sh https://tu-servicio.onrender.com"
    echo ""
    exit 1
fi

SERVICE_URL="$1"

# Remover trailing slash si existe
SERVICE_URL="${SERVICE_URL%/}"

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅  VERIFICACIÓN DE DESPLIEGUE                         ║
║       Nikra Backend - CCA Ceuta                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

echo -e "${CYAN}Verificando servicio:${NC} $SERVICE_URL"
echo ""

# Verificar que curl esté instalado
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ Error: curl no está instalado${NC}"
    exit 1
fi

# Contador de tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Función para ejecutar test
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "   🔍 $test_name... "
    
    # Hacer request con timeout
    response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" --max-time 10 "$url" 2>/dev/null || echo "000|0")
    
    status_code=$(echo "$response" | cut -d'|' -f1)
    time_total=$(echo "$response" | cut -d'|' -f2)
    
    # Convertir tiempo a milisegundos
    time_ms=$(echo "$time_total * 1000" | bc 2>/dev/null || echo "0")
    time_ms=${time_ms%.*}  # Remover decimales
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (${time_ms}ms)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FALLO${NC} (Status: $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VERIFICACIONES BÁSICAS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test 1: Servicio responde
run_test "Servicio responde" "$SERVICE_URL"

# Test 2: Swagger UI
run_test "Swagger UI accesible" "$SERVICE_URL/api/docs"

# Test 3: API JSON
run_test "Swagger JSON" "$SERVICE_URL/api/docs-json"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ENDPOINTS DE LA API${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test 4: Auth endpoints existen (404 es normal sin datos)
echo -n "   🔍 Auth endpoints... "
auth_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SERVICE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null || echo "000")

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$auth_response" = "400" ] || [ "$auth_response" = "401" ]; then
    echo -e "${GREEN}✅ OK${NC} (Endpoint existe)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  Respuesta inesperada${NC} (Status: $auth_response)"
fi

# Test 5: Verificar que otros endpoints existen
declare -a endpoints=("users" "campaigns" "participations" "associates")
for endpoint in "${endpoints[@]}"; do
    echo -n "   🔍 /$endpoint endpoint... "
    
    endpoint_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$SERVICE_URL/$endpoint" 2>/dev/null || echo "000")
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    # 401 (no autorizado) es OK porque significa que el endpoint existe pero requiere auth
    if [ "$endpoint_response" = "401" ] || [ "$endpoint_response" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC} (Endpoint existe)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️  Verificar${NC} (Status: $endpoint_response)"
    fi
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  VERIFICACIÓN DE PERFORMANCE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test de tiempo de respuesta
echo -n "   ⚡ Tiempo de respuesta promedio... "

total_time=0
samples=3

for i in $(seq 1 $samples); do
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$SERVICE_URL" 2>/dev/null || echo "0")
    total_time=$(echo "$total_time + $response_time" | bc 2>/dev/null || echo "0")
done

avg_time=$(echo "scale=3; $total_time / $samples" | bc 2>/dev/null || echo "0")
avg_time_ms=$(echo "$avg_time * 1000" | bc 2>/dev/null || echo "0")
avg_time_ms=${avg_time_ms%.*}

TOTAL_TESTS=$((TOTAL_TESTS + 1))
if [ "$avg_time_ms" -lt 1000 ]; then
    echo -e "${GREEN}✅ Excelente${NC} (${avg_time_ms}ms)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
elif [ "$avg_time_ms" -lt 3000 ]; then
    echo -e "${YELLOW}⚠️  Aceptable${NC} (${avg_time_ms}ms)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Lento${NC} (${avg_time_ms}ms)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  RESUMEN DE VERIFICACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Calcular porcentaje
if [ "$TOTAL_TESTS" -gt 0 ]; then
    PASS_PERCENTAGE=$(echo "scale=1; ($PASSED_TESTS * 100) / $TOTAL_TESTS" | bc)
else
    PASS_PERCENTAGE=0
fi

echo "   Total de tests:     $TOTAL_TESTS"
echo -e "   Tests exitosos:     ${GREEN}$PASSED_TESTS${NC}"
if [ "$FAILED_TESTS" -gt 0 ]; then
    echo -e "   Tests fallidos:     ${RED}$FAILED_TESTS${NC}"
fi
echo "   Tasa de éxito:      ${PASS_PERCENTAGE}%"
echo ""

# Resultado final
if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅  DESPLIEGUE VERIFICADO EXITOSAMENTE                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}Tu aplicación está funcionando correctamente! 🎉${NC}"
    echo ""
    echo -e "${CYAN}URLs importantes:${NC}"
    echo "   🌐 Aplicación:  $SERVICE_URL"
    echo "   📚 Swagger UI:  $SERVICE_URL/api/docs"
    echo ""
    exit 0
else
    echo -e "${YELLOW}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⚠️   DESPLIEGUE CON ADVERTENCIAS                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}Algunos tests fallaron. Recomendaciones:${NC}"
    echo ""
    echo "1. Verifica los logs en Render Dashboard"
    echo "2. Asegúrate de que las migraciones se ejecutaron"
    echo "3. Verifica las variables de entorno"
    echo "4. Prueba manualmente: $SERVICE_URL/api/docs"
    echo ""
    echo -e "${CYAN}Comandos útiles:${NC}"
    echo "   render logs <tu-servicio>"
    echo "   render exec <tu-servicio> npm run migration:show"
    echo ""
    exit 1
fi


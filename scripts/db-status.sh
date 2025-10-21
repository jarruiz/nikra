#!/bin/bash

# Script para verificar el estado de la base de datos

echo "🔍 Verificando estado de la base de datos Nikra..."

# Verificar contenedores
echo ""
echo "📦 Estado de contenedores:"
docker-compose ps

# Verificar conexión a PostgreSQL
echo ""
echo "🔗 Verificando conexión a PostgreSQL..."
if docker exec nikra-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL está ejecutándose y aceptando conexiones"
else
    echo "❌ PostgreSQL no está disponible"
    exit 1
fi

# Verificar base de datos
echo ""
echo "🗄️ Verificando base de datos 'nikra_db'..."
if docker exec nikra-postgres psql -U postgres -d nikra_db -c "SELECT current_database();" > /dev/null 2>&1; then
    echo "✅ Base de datos 'nikra_db' está disponible"
else
    echo "❌ Problema con la base de datos 'nikra_db'"
    exit 1
fi

# Verificar tablas
echo ""
echo "📊 Tablas creadas:"
docker exec nikra-postgres psql -U postgres -d nikra_db -c "\dt"

# Verificar conexión Redis
echo ""
echo "🔴 Verificando conexión a Redis..."
if docker exec nikra-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis está ejecutándose"
else
    echo "❌ Redis no está disponible"
fi

echo ""
echo "🎯 Configuración de conexión:"
echo "  - PostgreSQL: localhost:5433"
echo "  - Redis: localhost:6379"
echo "  - Base de datos: nikra_db"
echo "  - Usuario: postgres"

#!/bin/bash

# Script para iniciar los servicios de Docker para Nikra API

echo "🐳 Iniciando servicios de Docker para Nikra API..."

# Verificar si Docker está ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose"
    echo "Por favor, inicia Docker Desktop o Docker daemon"
    exit 1
fi

# Crear red si no existe
echo "🔧 Configurando red de Docker..."
docker network create nikra-network 2>/dev/null || echo "Red nikra-network ya existe"

# Iniciar servicios
echo "🚀 Iniciando PostgreSQL y Redis..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker exec nikra-postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Esperando conexión a PostgreSQL..."
    sleep 2
done

echo "✅ Servicios iniciados correctamente!"
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo "🔗 Conexiones disponibles:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "📚 Para ver logs: docker-compose logs -f"
echo "🛑 Para detener: docker-compose down"

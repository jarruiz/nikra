#!/bin/bash

# Script para detener los servicios de Docker para Nikra API

echo "🛑 Deteniendo servicios de Docker para Nikra API..."

# Detener y eliminar contenedores
docker-compose down

echo "✅ Servicios detenidos correctamente!"
echo ""
echo "💾 Los datos persisten en los volúmenes de Docker"
echo "🗑️  Para eliminar datos: docker-compose down -v"

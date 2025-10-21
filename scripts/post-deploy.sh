#!/bin/bash
# ==============================================
# 🚀 Script de Post-Despliegue para Render
# ==============================================
# Este script debe ejecutarse después de cada despliegue
# para asegurar que las migraciones de base de datos estén actualizadas

echo "🔄 Iniciando proceso de post-despliegue..."

# Verificar que estamos en producción
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Advertencia: NODE_ENV no está configurado como 'production'"
    echo "   NODE_ENV actual: $NODE_ENV"
fi

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
if [ -z "$DB_HOST" ]; then
    echo "❌ Error: DB_HOST no está configurado"
    exit 1
fi

echo "✅ Variables de entorno verificadas"
echo "   DB_HOST: $DB_HOST"
echo "   DB_DATABASE: $DB_DATABASE"
echo "   DB_USERNAME: $DB_USERNAME"

# Ejecutar migraciones pendientes
echo ""
echo "📊 Ejecutando migraciones de base de datos..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migraciones ejecutadas correctamente"
else
    echo "❌ Error al ejecutar migraciones"
    exit 1
fi

# Mostrar estado de migraciones
echo ""
echo "📋 Estado de migraciones:"
npm run migration:show

echo ""
echo "✅ Post-despliegue completado exitosamente"
echo "🚀 La aplicación está lista para usar"


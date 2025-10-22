#!/bin/bash

echo "🔍 Verificando estado de la migración UpdateUserFields..."

# Verificar que la migración existe
if [ -f "src/database/migrations/1760850000000-UpdateUserFields.ts" ]; then
    echo "✅ Archivo de migración encontrado"
else
    echo "❌ Archivo de migración no encontrado"
    exit 1
fi

# Verificar migraciones pendientes
echo "📋 Verificando migraciones pendientes..."
npm run typeorm migration:show

# Verificar estructura de tabla users
echo "🗄️ Verificando estructura de tabla users..."
npm run typeorm query "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"

# Verificar que fullName existe
echo "🔍 Verificando columna fullName..."
npm run typeorm query "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'fullName';"

# Verificar que phone existe
echo "🔍 Verificando columna phone..."
npm run typeorm query "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone';"

# Verificar que columnas antiguas no existen
echo "🔍 Verificando que columnas antiguas fueron eliminadas..."
npm run typeorm query "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('nombre', 'apellidos', 'direccion');"

echo "✅ Verificación completada"




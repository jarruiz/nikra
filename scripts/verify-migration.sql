-- Script para verificar que la migración UpdateUserFields se ejecutó correctamente

-- 1. Ver todas las migraciones ejecutadas
SELECT * FROM migrations ORDER BY timestamp DESC;

-- 2. Verificar estructura de tabla users (debe incluir fullName y phone, no nombre/apellidos/direccion)
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- 3. Ver algunos registros de ejemplo (sin mostrar passwords)
SELECT 
    id,
    "fullName",
    dni,
    phone,
    email,
    "emailVerified",
    "isActive",
    "createdAt"
FROM 
    users
LIMIT 5;

-- 4. Contar usuarios totales
SELECT COUNT(*) as total_users FROM users;

-- 5. Verificar que todos los usuarios tienen fullName (no debe haber nulls)
SELECT COUNT(*) as users_without_fullname 
FROM users 
WHERE "fullName" IS NULL OR "fullName" = '';

-- 6. Ver distribución de usuarios con y sin teléfono
SELECT 
    CASE 
        WHEN phone IS NOT NULL THEN 'Con teléfono'
        ELSE 'Sin teléfono'
    END as estado_telefono,
    COUNT(*) as cantidad
FROM users
GROUP BY 
    CASE 
        WHEN phone IS NOT NULL THEN 'Con teléfono'
        ELSE 'Sin teléfono'
    END;


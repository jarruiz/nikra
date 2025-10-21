-- Script de inicialización para la base de datos Nikra
-- Este script se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensión para UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear extensión para funciones de texto (búsquedas)
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configurar timezone
SET timezone = 'Europe/Madrid';

-- Mostrar información de inicialización
DO $$
BEGIN
    RAISE NOTICE 'Base de datos Nikra inicializada correctamente';
    RAISE NOTICE 'Timezone configurado: %', current_setting('timezone');
    RAISE NOTICE 'Base de datos creada: nikra_db';
END $$;

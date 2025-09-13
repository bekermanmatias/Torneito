-- Script de inicialización de la base de datos Torneito
-- Este script se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Comentarios sobre la base de datos
COMMENT ON DATABASE torneito_db IS 'Base de datos para la aplicación Torneito - Gestión de torneos de fútbol';

-- Verificar que la base de datos se creó correctamente
SELECT 'Base de datos Torneito inicializada correctamente' as mensaje;

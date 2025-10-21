import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'nikra_db',
    // Configuraciones adicionales para TypeORM
    extra: {
      // Configuración de conexión
      max: 20, // máximo número de conexiones
      min: 5,  // mínimo número de conexiones
      acquire: 30000, // tiempo máximo para obtener conexión
      idle: 10000,    // tiempo máximo que una conexión puede estar inactiva
    },
    // Configuraciones específicas de PostgreSQL
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    timezone: 'Europe/Madrid',
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  };

  // Log de configuración (sin mostrar password)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Configuración de base de datos:', {
      host: config.host,
      port: config.port,
      username: config.username,
      database: config.database,
      ssl: config.ssl,
    });
  }

  return config;
});

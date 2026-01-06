import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5433,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'nikra_db',
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/database/migrations/*{.ts,.js}')],
  synchronize: false, // Las migraciones controlan el esquema
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Configuración de conexión para migraciones largas
  extra: {
    // Timeout de conexión extendido para migraciones complejas
    connectionTimeoutMillis: 60000, // 60 segundos
    query_timeout: 120000, // 120 segundos para queries
    statement_timeout: 120000, // 120 segundos para statements
    // Pool de conexiones
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    // Reintentos
    retryAttempts: 3,
    retryDelay: 3000,
  },
});

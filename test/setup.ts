import { config } from 'dotenv';

// Cargar variables de entorno para testing
config({ path: '.env.test' });

// Configuración global para las pruebas
beforeAll(async () => {
  // Setup global que se ejecuta una vez antes de todas las pruebas
  process.env.NODE_ENV = 'test';
  process.env.DB_DATABASE = 'nikra_test_db';
});

afterAll(async () => {
  // Cleanup global después de todas las pruebas
});

// Configurar timeout global para las pruebas
jest.setTimeout(30000);

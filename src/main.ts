import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { 
  setupSecurity,
  setupSwagger, 
  setupValidationAndFilters,
  setupStaticFiles,
  getAppConfig,
  logStartupInfo
} from './config/bootstrap';

async function bootstrap() {
  // Crear aplicación NestJS con soporte para Express estático
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar prefijo global para API
  app.setGlobalPrefix('api');

  // Health check endpoint (sin rate limiting)
  app.use('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Configurar archivos estáticos (imágenes)
  setupStaticFiles(app);

  // Configurar seguridad (Helmet, CORS, Rate Limiting)
  setupSecurity(app);

  // Configurar Swagger/OpenAPI
  setupSwagger(app);

  // Configurar validación global y filtros/interceptores
  setupValidationAndFilters(app);

  // Obtener configuración de la aplicación
  const { port } = getAppConfig();

  // Iniciar servidor
  await app.listen(port);
  
  // Mostrar información de inicio
  logStartupInfo(port);
}

bootstrap();

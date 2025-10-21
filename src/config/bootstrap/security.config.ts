import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * Configura las medidas de seguridad de la aplicación
 */
export function setupSecurity(app: INestApplication): void {
  // Configuración de Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,        // 1 año
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true
  }));

  // Rate Limiting global
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite cada IP por ventana de tiempo
    message: {
      error: 'Demasiadas peticiones desde esta IP, inténtelo más tarde.',
      statusCode: 429
    }
  }));

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
}

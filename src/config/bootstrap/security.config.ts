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

  // CORS - Configuración de orígenes permitidos
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:4200',
        'https://ccaceuta.com',
        'https://www.ccaceuta.com',
        'https://nikra-front.vercel.app',
        'https://nikra-backend.onrender.com', // Permitir Swagger UI
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como Postman, curl, mobile apps)
      if (!origin) {
        console.log('🌐 CORS: Petición sin origin permitida');
        return callback(null, true);
      }
      
      // Log del origin para debugging
      console.log(`🌐 CORS: Verificando origin: ${origin}`);
      console.log(`🌐 CORS: Orígenes permitidos:`, allowedOrigins);
      
      // Verificar si el origin está en la lista de permitidos
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log(`✅ CORS: Origin permitido: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`❌ CORS: Origen no permitido: ${origin}`);
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400, // 24 horas de cache de preflight
  });

  // Log de configuración en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.log('🌐 CORS configurado para:', allowedOrigins);
  }
}

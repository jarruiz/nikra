import { INestApplication, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../common/filters/global-exception.filter';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

/**
 * Configura validación global y filtros/interceptores de la aplicación
 */
export function setupValidationAndFilters(app: INestApplication): void {
  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Filtros globales
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Interceptores globales
  app.useGlobalInterceptors(new LoggingInterceptor());
}

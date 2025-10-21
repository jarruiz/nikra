import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

/**
 * Configuración para servir archivos estáticos
 * Permite acceso directo a las imágenes subidas
 */
export function setupStaticFiles(app: NestExpressApplication): void {
  // Servir archivos de avatars
  app.useStaticAssets(join(__dirname, '../../../uploads/avatars'), {
    prefix: '/avatars/',
  });

  // Servir archivos de campañas
  app.useStaticAssets(join(__dirname, '../../../uploads/campaigns'), {
    prefix: '/campaigns/',
  });

  // Servir archivos de asociados
  app.useStaticAssets(join(__dirname, '../../../uploads/associates'), {
    prefix: '/associates/',
  });
}

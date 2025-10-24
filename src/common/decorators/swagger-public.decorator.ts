import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Decorador para documentar endpoints públicos en Swagger
 * 
 * @param summary - Resumen del endpoint
 * @param description - Descripción detallada
 */
export function ApiPublicOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({
      summary,
      description: description || `${summary} (endpoint público - no requiere autenticación)`,
    }),
    ApiResponse({
      status: 200,
      description: 'Operación exitosa (endpoint público)',
    }),
    ApiResponse({
      status: 404,
      description: 'Recurso no encontrado',
    }),
  );
}

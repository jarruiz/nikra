import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador para marcar endpoints como públicos (sin autenticación)
 * 
 * @example
 * ```typescript
 * @Get('images/:filename')
 * @Public()
 * async getImage(@Param('filename') filename: string) {
 *   // Este endpoint no requiere autenticación
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

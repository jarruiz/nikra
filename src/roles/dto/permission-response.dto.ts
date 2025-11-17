import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del permiso',
    example: 'campaigns.create',
  })
  name: string;

  @ApiProperty({
    description: 'Recurso al que aplica el permiso',
    example: 'campaigns',
  })
  resource: string;

  @ApiProperty({
    description: 'Acción permitida',
    example: 'create',
  })
  action: string;

  @ApiPropertyOptional({
    description: 'Descripción del permiso',
    example: 'Permite crear nuevas campañas',
  })
  description?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-15T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-15T00:00:00.000Z',
  })
  updatedAt: Date;
}


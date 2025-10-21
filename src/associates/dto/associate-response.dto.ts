import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssociateResponseDto {
  @ApiProperty({
    description: 'ID único del comercio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del comercio',
    example: 'Supermercado El Puerto',
  })
  nombre: string;

  @ApiProperty({
    description: 'Dirección del comercio',
    example: 'Calle Real 15, 51001 Ceuta',
  })
  direccion: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del comercio',
    example: '+34 956 123 456',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Nombre del archivo de logo del comercio',
    example: '1642123456789-abc123-logo.png',
  })
  logoUrl?: string;

  @ApiProperty({
    description: 'Estado activo del comercio',
    example: true,
  })
  activo: boolean;

  @ApiProperty({
    description: 'Fecha de creación del comercio',
    example: '2025-01-18T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-18T10:30:00.000Z',
  })
  updatedAt: Date;
}

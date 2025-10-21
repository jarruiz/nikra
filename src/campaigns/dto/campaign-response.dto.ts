import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignResponseDto {
  @ApiProperty({
    description: 'ID único de la campaña',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la campaña',
    example: 'Campaña de Verano 2025',
  })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción de la campaña',
    example: 'Promoción especial de verano con descuentos exclusivos',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del cartel',
    example: 'https://example.com/cartel-campana.jpg',
  })
  imagenUrl?: string;

  @ApiProperty({
    description: 'Estado activo de la campaña',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la campaña',
    example: '2025-01-18T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-18T10:30:00.000Z',
  })
  updatedAt: Date;
}

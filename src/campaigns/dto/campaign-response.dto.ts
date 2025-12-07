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

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la campaña',
    example: '2025-01-15T00:00:00.000Z',
  })
  fechaInicio?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de finalización de la campaña',
    example: '2025-02-15T23:59:59.000Z',
  })
  fechaFin?: Date;

  @ApiProperty({
    description: 'Importe mínimo requerido para participar (€)',
    example: 10.00,
  })
  importeMinimo: number;

  @ApiPropertyOptional({
    description: 'Cuantía máxima acumulable por usuario en total (€). Null si no hay límite.',
    example: 50.00,
  })
  cuantiaMaximaAcumulable?: number;

  @ApiProperty({
    description: 'Regla de participación',
    example: 'Por cada 10€ de compra se acumula 1€',
  })
  reglaParticipacion: string;

  @ApiProperty({
    description: 'Regla de redondeo',
    example: 'Redondeo hacia abajo',
  })
  reglaRedondeo: string;

  @ApiPropertyOptional({
    description: 'URL del archivo PDF de bases legales',
    example: 'bases-legales-campana-2025.pdf',
  })
  basesLegalesUrl?: string;

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

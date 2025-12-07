import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, IsDateString, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Nombre de la campaña',
    example: 'Campaña de Verano 2025',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la campaña es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción de la campaña',
    example: 'Promoción especial de verano con descuentos exclusivos',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del cartel',
    example: 'https://example.com/cartel-campana.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La URL no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  imagenUrl?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la campaña',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Fecha de inicio de la campaña',
    example: '2025-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'fechaInicio debe ser una fecha válida en formato ISO' })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de finalización de la campaña',
    example: '2025-02-15T23:59:59.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'fechaFin debe ser una fecha válida en formato ISO' })
  fechaFin: string;

  @ApiProperty({
    description: 'Importe mínimo requerido para participar en la campaña (€)',
    example: 10.00,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'El importe mínimo es requerido' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El importe mínimo debe ser un número válido con máximo 2 decimales' })
  @Type(() => Number)
  @Min(0.01, { message: 'El importe mínimo debe ser mayor a 0' })
  importeMinimo: number;

  @ApiPropertyOptional({
    description: 'Cuantía máxima acumulable por usuario en total para esta campaña (€). Si no se especifica, no hay límite.',
    example: 50.00,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La cuantía máxima acumulable debe ser un número válido con máximo 2 decimales' })
  @Type(() => Number)
  @Min(0.01, { message: 'La cuantía máxima acumulable debe ser mayor a 0' })
  cuantiaMaximaAcumulable?: number;

  @ApiProperty({
    description: 'Regla de participación de la campaña',
    example: 'Por cada 10€ de compra se acumula 1€',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'La regla de participación es requerida' })
  @IsString({ message: 'La regla de participación debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La regla de participación no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  reglaParticipacion: string;

  @ApiProperty({
    description: 'Regla de redondeo de la campaña',
    example: 'Redondeo hacia abajo',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'La regla de redondeo es requerida' })
  @IsString({ message: 'La regla de redondeo debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La regla de redondeo no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  reglaRedondeo: string;

  @ApiPropertyOptional({
    description: 'URL del archivo PDF de bases legales',
    example: 'bases-legales-campana-2025.pdf',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'La URL de bases legales debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La URL no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  basesLegalesUrl?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

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
}

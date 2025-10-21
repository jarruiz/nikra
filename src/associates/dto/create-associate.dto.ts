import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAssociateDto {
  @ApiProperty({
    description: 'Nombre del comercio',
    example: 'Supermercado El Puerto',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del comercio es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiProperty({
    description: 'Dirección del comercio',
    example: 'Calle Real 15, 51001 Ceuta',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  direccion: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del comercio',
    example: '+34 956 123 456',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^[\+]?[0-9\s\-\(\)]+$/, {
    message: 'El teléfono debe contener solo números, espacios, guiones y paréntesis',
  })
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del comercio',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean = true;
}

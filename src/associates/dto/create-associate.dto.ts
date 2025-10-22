import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, Matches, IsUrl } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Descripción del comercio',
    example: 'Tu tienda Multimarca en Ceuta, para ellas y ellos las mejores marcas en el sector del calzado.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del comercio',
    example: '+34 956 123 456',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El teléfono no puede exceder 50 caracteres' })
  @Matches(/^[\+]?[0-9\s\-\(\)\/@]+$/, {
    message: 'El teléfono debe contener solo números, espacios, guiones, paréntesis, barras y arrobas',
  })
  @Transform(({ value }) => value?.trim())
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Dirección del comercio',
    example: 'Calle Real 15, 51001 Ceuta',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @ApiPropertyOptional({
    description: 'URL de Google Maps',
    example: 'https://www.google.com/maps/search/?api=1&query=CHAROL+ZAPATOS',
  })
  @IsOptional()
  @IsString({ message: 'La URL de Maps debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La URL de Maps debe ser una URL válida' })
  @Transform(({ value }) => value?.trim())
  maps_url?: string;

  @ApiPropertyOptional({
    description: 'Texto de la página web',
    example: 'qreativos.es',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El texto web debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El texto web no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  web_texto?: string;

  @ApiPropertyOptional({
    description: 'URL de la página web',
    example: 'http://www.qreativos.es',
  })
  @IsOptional()
  @IsString({ message: 'La URL web debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La URL web debe ser una URL válida' })
  @Transform(({ value }) => value?.trim())
  web_url?: string;

  @ApiPropertyOptional({
    description: 'Texto de redes sociales',
    example: 'Instagram | Facebook',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'El texto de redes sociales debe ser una cadena de texto' })
  @MaxLength(255, { message: 'El texto de redes sociales no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  rrss_texto?: string;

  @ApiPropertyOptional({
    description: 'URL de redes sociales',
    example: 'https://www.instagram.com/qreativos/',
  })
  @IsOptional()
  @IsString({ message: 'La URL de redes sociales debe ser una cadena de texto' })
  @IsUrl({}, { message: 'La URL de redes sociales debe ser una URL válida' })
  @Transform(({ value }) => value?.trim())
  rrss_url?: string;

  @ApiPropertyOptional({
    description: 'Nombre del archivo de imagen',
    example: 'qreativos-card.webp',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La imagen no puede exceder 255 caracteres' })
  @Transform(({ value }) => value?.trim())
  imagen?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del comercio',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'activo debe ser un valor booleano' })
  activo?: boolean = true;
}

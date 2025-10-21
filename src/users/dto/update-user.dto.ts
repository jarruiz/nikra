import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'García López',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los apellidos no pueden exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  apellidos?: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: '12345678X',
    minLength: 9,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El DNI es requerido' })
  @MinLength(9, { message: 'El DNI debe tener al menos 9 caracteres' })
  @MaxLength(20, { message: 'El DNI no puede exceder 20 caracteres' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  dni?: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle Mayor 123, Ceuta',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @Transform(({ value }) => value?.trim())
  direccion?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.garcia@email.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEmail, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan García López',
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(2, { message: 'El nombre completo debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre completo no puede exceder 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  fullName?: string;

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
    description: 'Teléfono móvil del usuario (formato español)',
    example: '+34612345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^(\+34|0034)?[6789]\d{8}$/, {
    message: 'Teléfono debe tener formato válido español (ej: +34612345678 o 612345678)',
  })
  @Transform(({ value }) => {
    if (!value) return null;
    let phone = value.trim().replace(/\s+/g, '');
    if (phone.startsWith('0034')) {
      phone = '+34' + phone.substring(4);
    } else if (!phone.startsWith('+34') && !phone.startsWith('34')) {
      phone = '+34' + phone;
    } else if (phone.startsWith('34') && !phone.startsWith('+')) {
      phone = '+' + phone;
    }
    return phone;
  })
  phone?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.garcia@email.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;
}

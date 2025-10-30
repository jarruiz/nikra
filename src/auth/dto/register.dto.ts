import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez García',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  fullName: string;

  @ApiProperty({
    description: 'DNI o NIE del usuario',
    example: '12345678A',
    minLength: 9,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(20)
  @Matches(/^([0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]|[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE])$/, {
    message: 'Debe tener formato válido de DNI (8 dígitos + letra) o NIE (X/Y/Z + 7 dígitos + letra)',
  })
  @Transform(({ value }) => value?.trim().toUpperCase())
  dni: string;

  @ApiProperty({
    description: 'Teléfono móvil del usuario (formato español)',
    example: '+34612345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\+34|0034)?[6789]\d{8}$/, {
    message: 'Teléfono debe tener formato válido español (ej: +34612345678 o 612345678)',
  })
  @Transform(({ value }) => {
    if (!value) return null;
    // Normalizar el teléfono
    let phone = value.trim().replace(/\s+/g, '');
    // Si empieza con 00  34, convertir a +34
    if (phone.startsWith('0034')) {
      phone = '+34' + phone.substring(4);
    }
    // Si no tiene prefijo, añadir +34
    else if (!phone.startsWith('+34') && !phone.startsWith('34')) {
      phone = '+34' + phone;
    }
    // Si empieza con 34 (sin +), añadir +
    else if (phone.startsWith('34') && !phone.startsWith('+')) {
      phone = '+' + phone;
    }
    return phone;
  })
  phone?: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiPasswordSeguro123',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número',
  })
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez García',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  apellidos: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: '12345678A',
    minLength: 9,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(20)
  @Matches(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/, {
    message: 'DNI debe tener formato válido español (8 dígitos + letra)',
  })
  @Transform(({ value }) => value?.trim())
  dni: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle Mayor 123, 51001 Ceuta',
    minLength: 10,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  direccion: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiPasswordSeguro123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo especial',
  })
  password: string;
}

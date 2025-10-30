import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Código de recuperación de contraseña (4 dígitos)',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @IsNotEmpty({ message: 'El código es requerido' })
  @Matches(/^\d{4}$/, {
    message: 'El código debe ser un número de 4 dígitos',
  })
  code: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'MiNuevaPasswordSegura123',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número',
  })
  password: string;
}


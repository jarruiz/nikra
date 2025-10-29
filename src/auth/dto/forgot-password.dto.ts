import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email del usuario para recuperar contraseña',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}


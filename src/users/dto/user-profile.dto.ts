import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'García López',
  })
  apellidos: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: '12345678X',
  })
  dni: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle Mayor 123, Ceuta',
  })
  direccion: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan.garcia@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'Estado de verificación del email',
    example: false,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha del último login',
    example: '2025-01-18T10:30:00.000Z',
    nullable: true,
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: 'Nombre del archivo de avatar del usuario',
    example: '1642123456789-abc123-avatar.jpg',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2025-01-18T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-18T10:30:00.000Z',
  })
  updatedAt: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionResponseDto } from './permission-response.dto';

export class RoleResponseDto {
  @ApiProperty({
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del rol',
    example: 'admin',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Administrador con todos los permisos',
  })
  description?: string;

  @ApiProperty({
    description: 'Indica si es el rol por defecto',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Indica si el rol está activo',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Lista de permisos asignados al rol',
    type: [PermissionResponseDto],
  })
  permissions?: PermissionResponseDto[];

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-15T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-15T00:00:00.000Z',
  })
  updatedAt: Date;
}


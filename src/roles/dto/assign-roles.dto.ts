import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({
    description: 'Array de IDs de roles a asignar al usuario',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray({ message: 'roleIds debe ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un rol' })
  @IsUUID('4', { each: true, message: 'Cada ID de rol debe ser un UUID válido' })
  roleIds: string[];
}


import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de actualización JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UserProfileDto,
  })
  user: UserProfileDto;
}

// Re-export UserProfileDto from users module
export { UserProfileDto } from '../../users/dto/user-profile.dto';

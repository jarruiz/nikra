import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto } from './user-profile.dto';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Número de elementos por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de elementos',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Si hay página siguiente',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Si hay página anterior',
    example: false,
  })
  hasPrev: boolean;
}

export class UsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [UserProfileDto],
  })
  users: UserProfileDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}

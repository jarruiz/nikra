import { ApiProperty } from '@nestjs/swagger';
import { ParticipationResponseDto } from './participation-response.dto';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Número de elementos por página',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de elementos',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 8,
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

export class ParticipationsResponseDto {
  @ApiProperty({
    description: 'Lista de participaciones',
    type: [ParticipationResponseDto],
  })
  participations: ParticipationResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}

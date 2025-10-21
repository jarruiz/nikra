import { ApiProperty } from '@nestjs/swagger';
import { CampaignResponseDto } from './campaign-response.dto';

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
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 1,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Si hay página siguiente',
    example: false,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Si hay página anterior',
    example: false,
  })
  hasPrev: boolean;
}

export class CampaignsResponseDto {
  @ApiProperty({
    description: 'Lista de campañas',
    type: [CampaignResponseDto],
  })
  campaigns: CampaignResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}

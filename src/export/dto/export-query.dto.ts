import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class ExportQueryDto {
  @ApiPropertyOptional({
    description: 'ID del usuario para filtrar participaciones específicas',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'ID del comercio para filtrar participaciones específicas',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del comercio debe ser un UUID válido' })
  associateId?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde para filtrar participaciones (formato YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe tener formato YYYY-MM-DD' })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta para filtrar participaciones (formato YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe tener formato YYYY-MM-DD' })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de ticket',
    example: 'T-2025-',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  numeroTicket?: string;
}

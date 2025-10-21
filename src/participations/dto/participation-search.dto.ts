import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ParticipationSearchDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de comercio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del comercio debe ser un UUID válido' })
  associateId?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por número de ticket',
    example: 'T-2025-',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  numeroTicket?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (formato YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe tener formato YYYY-MM-DD' })
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (formato YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe tener formato YYYY-MM-DD' })
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser al menos 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Max(100, { message: 'El límite no puede exceder 100' })
  limit?: number = 20;
}

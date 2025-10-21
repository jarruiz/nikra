import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UserSearchDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por nombre',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por apellidos',
    example: 'García',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  apellidos?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por DNI',
    example: '12345678X',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  dni?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por email',
    example: 'juan@email.com',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por email verificado',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  emailVerified?: boolean;

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
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  @Max(100, { message: 'El límite no puede exceder 100' })
  limit?: number = 10;
}

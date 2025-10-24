import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateParticipationDto {
  @ApiProperty({
    description: 'ID del comercio donde se realizó la compra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El ID del comercio debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El comercio es requerido' })
  associateId: string;

  @ApiProperty({
    description: 'Número del ticket de compra',
    example: 'T-2025-001234',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El número de ticket debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de ticket es requerido' })
  @MinLength(3, { message: 'El número de ticket debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El número de ticket no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  numeroTicket: string;

  @ApiProperty({
    description: 'Fecha del ticket de compra',
    example: '2025-01-18',
    type: 'string',
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD)' })
  @Transform(({ value }) => value?.trim())
  fechaTicket: string;

  @ApiProperty({
    description: 'Importe total de la compra en euros',
    example: 25.99,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El importe debe ser un número válido con máximo 2 decimales' })
  @Type(() => Number)
  @Min(0.01, { message: 'El importe debe ser mayor a 0' })
  @Max(999999.99, { message: 'El importe no puede exceder 999,999.99 euros' })
  importeTotal: number;
}

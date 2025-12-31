import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTicketValidationDto {
  @ApiProperty({
    description: 'Estado de validación del ticket',
    example: true,
  })
  @IsBoolean({ message: 'El campo validated debe ser un valor booleano' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  validated: boolean;
}

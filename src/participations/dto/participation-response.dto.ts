import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketResponseDto } from '../../tickets/dto/ticket-response.dto';

export class ParticipationResponseDto {
  @ApiProperty({
    description: 'ID único de la participación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del ticket asociado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ticketId: string;

  @ApiProperty({
    description: 'ID de la campaña a la que pertenece la participación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  campaignId: string;

  @ApiProperty({
    description: 'Fecha de creación de la participación',
    example: '2025-01-18T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-18T10:30:00.000Z',
  })
  updatedAt: Date;

  // Datos del ticket (opcional, se puede incluir en joins)
  @ApiPropertyOptional({
    description: 'Información completa del ticket asociado',
    type: TicketResponseDto,
  })
  ticket?: TicketResponseDto;

  // Datos de la campaña (opcional, se puede incluir en joins)
  campaign?: {
    id: string;
    nombre: string;
    importeMinimo: number;
  };
}

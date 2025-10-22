import { ApiProperty } from '@nestjs/swagger';

export class ParticipationResponseDto {
  @ApiProperty({
    description: 'ID único de la participación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que realizó la participación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'ID del comercio donde se realizó la compra',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  associateId: string;

  @ApiProperty({
    description: 'Número del ticket de compra',
    example: 'T-2025-001234',
  })
  numeroTicket: string;

  @ApiProperty({
    description: 'Fecha del ticket de compra',
    example: '2025-01-18T00:00:00.000Z',
  })
  fechaTicket: Date;

  @ApiProperty({
    description: 'Importe total de la compra en euros',
    example: 25.99,
  })
  importeTotal: number;

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

  // Datos del usuario (opcional, se puede incluir en joins)
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };

  // Datos del comercio (opcional, se puede incluir en joins)
  associate?: {
    id: string;
    nombre: string;
    direccion: string;
  };
}

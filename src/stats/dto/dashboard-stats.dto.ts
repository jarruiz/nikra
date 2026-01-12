import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GlobalStatsDto {
  @ApiProperty({
    description: 'Total de tickets únicos registrados',
    example: 4365,
  })
  totalTickets: number;

  @ApiProperty({
    description: 'Incremento de tickets respecto al periodo anterior',
    example: 682,
  })
  totalTicketsChange: number;

  @ApiProperty({
    description: 'Volumen total registrado en euros',
    example: 69676.50,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Incremento del volumen respecto al periodo anterior',
    example: 10460.25,
  })
  totalAmountChange: number;

  @ApiProperty({
    description: 'Total de participantes únicos',
    example: 3549,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Incremento de usuarios respecto al periodo anterior',
    example: 167,
  })
  totalUsersChange: number;
}

export class DailyDataDto {
  @ApiProperty({
    description: 'Fecha en formato ISO',
    example: '2025-11-01',
  })
  date: string;

  @ApiProperty({
    description: 'Cantidad de tickets en este día',
    example: 497,
  })
  count: number;
}

export class DailyAmountDto {
  @ApiProperty({
    description: 'Fecha en formato ISO',
    example: '2025-11-01',
  })
  date: string;

  @ApiProperty({
    description: 'Volumen total en euros en este día',
    example: 8346.75,
  })
  amount: number;
}

export class TimeSeriesDto {
  @ApiProperty({
    description: 'Registros de tickets diarios',
    type: [DailyDataDto],
  })
  dailyTickets: DailyDataDto[];

  @ApiProperty({
    description: 'Volumen de compras diarias en euros',
    type: [DailyAmountDto],
  })
  dailyAmount: DailyAmountDto[];
}

export class TopAssociateDto {
  @ApiProperty({
    description: 'ID del comercio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del comercio',
    example: 'Comercio ABC',
  })
  nombre: string;

  @ApiProperty({
    description: 'Cantidad de tickets de este comercio',
    example: 150,
  })
  ticketCount: number;

  @ApiProperty({
    description: 'Volumen total de este comercio en euros',
    example: 5432.10,
  })
  amount: number;
}

export class DailyCampaignDistributionDto {
  @ApiProperty({
    description: 'Fecha',
    example: '2025-11-01',
  })
  date: string;

  @ApiProperty({
    description: 'Cantidad de tickets únicos',
    example: 25,
  })
  tickets: number;

  @ApiProperty({
    description: 'Cantidad de participaciones',
    example: 30,
  })
  participations: number;

  @ApiProperty({
    description: 'Volumen en euros',
    example: 1234.50,
  })
  amount: number;
}

export class CampaignStatsDetailsDto {
  @ApiProperty({
    description: 'Tickets únicos participando en esta campaña',
    example: 250,
  })
  totalTickets: number;

  @ApiProperty({
    description: 'Participaciones totales (un ticket puede participar múltiples veces)',
    example: 300,
  })
  totalParticipations: number;

  @ApiProperty({
    description: 'Volumen acumulado en esta campaña en euros',
    example: 12345.67,
  })
  totalAmount: number;

  @ApiPropertyOptional({
    description: 'Porcentaje de progreso si hay cuantía máxima acumulable',
    example: 45.5,
    nullable: true,
  })
  progress: number | null;

  @ApiProperty({
    description: 'Tickets nuevos en los últimos 7 días',
    example: 45,
  })
  recentTickets: number;

  @ApiProperty({
    description: 'Participaciones en los últimos 7 días',
    example: 52,
  })
  recentParticipations: number;

  @ApiProperty({
    description: 'Top comercios en esta campaña',
    type: [TopAssociateDto],
  })
  topAssociates: TopAssociateDto[];

  @ApiProperty({
    description: 'Distribución diaria (últimos 30 días)',
    type: [DailyCampaignDistributionDto],
  })
  dailyDistribution: DailyCampaignDistributionDto[];
}

export class CampaignStatsDto {
  @ApiProperty({
    description: 'ID de la campaña',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la campaña',
    example: 'Campaña Navideña 2025',
  })
  nombre: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la campaña',
    example: 'https://example.com/imagen.jpg',
  })
  imagenUrl: string | null;

  @ApiProperty({
    description: 'Indica si la campaña está activa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de inicio de la campaña',
    example: '2025-01-01T00:00:00.000Z',
  })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la campaña',
    example: '2025-12-31T23:59:59.999Z',
  })
  fechaFin: Date;

  @ApiProperty({
    description: 'Días restantes hasta el fin (negativo si ya expiró)',
    example: 150,
  })
  diasRestantes: number;

  @ApiProperty({
    description: 'Importe mínimo requerido para participar',
    example: 10.00,
  })
  importeMinimo: number;

  @ApiPropertyOptional({
    description: 'Cuantía máxima acumulable (null si no hay límite)',
    example: 50000.00,
    nullable: true,
  })
  cuantiaMaximaAcumulable: number | null;

  @ApiProperty({
    description: 'Estadísticas detalladas de esta campaña',
    type: CampaignStatsDetailsDto,
  })
  stats: CampaignStatsDetailsDto;
}

export class CampaignsSummaryDto {
  @ApiProperty({
    description: 'Total de campañas en el sistema',
    example: 15,
  })
  totalCampaigns: number;

  @ApiProperty({
    description: 'Campañas activas actualmente',
    example: 3,
  })
  activeCampaigns: number;

  @ApiProperty({
    description: 'Campañas que empiezan en los próximos 7 días',
    example: 1,
  })
  upcomingCampaigns: number;

  @ApiProperty({
    description: 'Campañas que terminan en los próximos 7 días',
    example: 2,
  })
  expiringSoon: number;
}

export class TopUserDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  userName: string;

  @ApiProperty({
    description: 'Total de tickets del usuario',
    example: 45,
  })
  totalTickets: number;

  @ApiProperty({
    description: 'Volumen total en euros',
    example: 2345.67,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Cantidad de campañas en las que ha participado',
    example: 3,
  })
  campaignsCount: number;
}

export class TopAssociateGlobalDto {
  @ApiProperty({
    description: 'ID del comercio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  associateId: string;

  @ApiProperty({
    description: 'Nombre del comercio',
    example: 'Comercio XYZ',
  })
  associateName: string;

  @ApiProperty({
    description: 'Total de tickets del comercio',
    example: 523,
  })
  totalTickets: number;

  @ApiProperty({
    description: 'Volumen total en euros',
    example: 15234.89,
  })
  totalAmount: number;
}

export class MetadataDto {
  @ApiProperty({
    description: 'Timestamp de generación de las estadísticas',
    example: '2025-01-12T10:30:00.000Z',
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Inicio del periodo analizado',
    example: '2025-01-01T00:00:00.000Z',
  })
  periodStart: Date;

  @ApiProperty({
    description: 'Fin del periodo analizado',
    example: '2025-01-31T23:59:59.999Z',
  })
  periodEnd: Date;

  @ApiProperty({
    description: 'Filtros aplicados en esta consulta',
    example: { campaignId: '123e4567-e89b-12d3-a456-426614174000' },
  })
  filters: Record<string, any>;
}

export class DashboardStatsDto {
  @ApiProperty({
    description: 'Métricas globales del sistema',
    type: GlobalStatsDto,
  })
  global: GlobalStatsDto;

  @ApiProperty({
    description: 'Series temporales para gráficos',
    type: TimeSeriesDto,
  })
  timeSeries: TimeSeriesDto;

  @ApiProperty({
    description: 'Estadísticas detalladas por campaña',
    type: [CampaignStatsDto],
  })
  campaigns: CampaignStatsDto[];

  @ApiProperty({
    description: 'Resumen de campañas',
    type: CampaignsSummaryDto,
  })
  campaignsSummary: CampaignsSummaryDto;

  @ApiPropertyOptional({
    description: 'Top usuarios (solo si includeTopUsers=true)',
    type: [TopUserDto],
    nullable: true,
  })
  topUsers?: TopUserDto[];

  @ApiPropertyOptional({
    description: 'Top comercios (solo si includeTopAssociates=true)',
    type: [TopAssociateGlobalDto],
    nullable: true,
  })
  topAssociates?: TopAssociateGlobalDto[];

  @ApiProperty({
    description: 'Metadatos de la consulta',
    type: MetadataDto,
  })
  metadata: MetadataDto;
}

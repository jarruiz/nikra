import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Participation } from '../participations/entities/participation.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { User } from '../users/entities/user.entity';
import { Associate } from '../associates/entities/associate.entity';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import {
  DashboardStatsDto,
  GlobalStatsDto,
  TimeSeriesDto,
  CampaignStatsDto,
  CampaignsSummaryDto,
  TopUserDto,
  TopAssociateGlobalDto,
  MetadataDto,
  DailyDataDto,
  DailyAmountDto,
  CampaignStatsDetailsDto,
  TopAssociateDto,
  DailyCampaignDistributionDto,
} from './dto/dashboard-stats.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
  ) {}

  async getDashboardStats(query: DashboardQueryDto): Promise<DashboardStatsDto> {
    const { fechaDesde, fechaHasta, campaignId, associateId, includeTopUsers, includeTopAssociates, topLimit = 5 } = query;

    // Determinar periodo de análisis
    const periodEnd = fechaHasta ? new Date(fechaHasta + 'T23:59:59.999Z') : new Date();
    const periodStart = fechaDesde ? new Date(fechaDesde + 'T00:00:00.000Z') : new Date(new Date().setDate(periodEnd.getDate() - 30));

    // Calcular periodo anterior (para comparaciones)
    const periodDuration = periodEnd.getTime() - periodStart.getTime();
    const previousPeriodEnd = new Date(periodStart.getTime() - 1);
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodDuration);

    // Construir filtros base
    const currentFilters: any = {
      fechaTicket: Between(periodStart, periodEnd),
    };
    const previousFilters: any = {
      fechaTicket: Between(previousPeriodStart, previousPeriodEnd),
    };

    if (associateId) {
      currentFilters.associateId = associateId;
      previousFilters.associateId = associateId;
    }

    // Obtener métricas globales del periodo actual
    const [currentTickets, previousTickets] = await Promise.all([
      this.ticketRepository.find({
        where: currentFilters,
        relations: ['user'],
      }),
      this.ticketRepository.find({
        where: previousFilters,
        relations: ['user'],
      }),
    ]);

    // Calcular métricas globales
    const global = this.calculateGlobalStats(currentTickets, previousTickets);

    // Obtener series temporales
    const timeSeries = this.calculateTimeSeries(currentTickets, periodStart, periodEnd);

    // Obtener todas las campañas
    const allCampaigns = await this.campaignRepository.find({
      order: { fechaInicio: 'DESC' },
    });

    // Filtrar por campaignId si se especifica
    const campaignsToAnalyze = campaignId
      ? allCampaigns.filter(c => c.id === campaignId)
      : allCampaigns;

    // Calcular estadísticas por campaña
    const campaigns = await Promise.all(
      campaignsToAnalyze.map(campaign => this.calculateCampaignStats(campaign, periodStart, periodEnd, associateId))
    );

    // Calcular resumen de campañas
    const campaignsSummary = this.calculateCampaignsSummary(allCampaigns);

    // Top usuarios (opcional)
    let topUsers: TopUserDto[] | undefined;
    if (includeTopUsers) {
      topUsers = await this.calculateTopUsers(periodStart, periodEnd, campaignId, associateId, topLimit);
    }

    // Top comercios (opcional)
    let topAssociates: TopAssociateGlobalDto[] | undefined;
    if (includeTopAssociates) {
      topAssociates = await this.calculateTopAssociates(periodStart, periodEnd, campaignId, topLimit);
    }

    // Metadatos
    const metadata: MetadataDto = {
      generatedAt: new Date(),
      periodStart,
      periodEnd,
      filters: { fechaDesde, fechaHasta, campaignId, associateId },
    };

    return {
      global,
      timeSeries,
      campaigns,
      campaignsSummary,
      topUsers,
      topAssociates,
      metadata,
    };
  }

  private calculateGlobalStats(currentTickets: Ticket[], previousTickets: Ticket[]): GlobalStatsDto {
    const totalTickets = currentTickets.length;
    const totalTicketsChange = totalTickets - previousTickets.length;

    const totalAmount = currentTickets.reduce((sum, t) => sum + Number(t.importeTotal), 0);
    const previousAmount = previousTickets.reduce((sum, t) => sum + Number(t.importeTotal), 0);
    const totalAmountChange = totalAmount - previousAmount;

    const uniqueUsers = new Set(currentTickets.map(t => t.userId));
    const previousUniqueUsers = new Set(previousTickets.map(t => t.userId));
    const totalUsers = uniqueUsers.size;
    const totalUsersChange = totalUsers - previousUniqueUsers.size;

    return {
      totalTickets,
      totalTicketsChange,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalAmountChange: Math.round(totalAmountChange * 100) / 100,
      totalUsers,
      totalUsersChange,
    };
  }

  private calculateTimeSeries(tickets: Ticket[], periodStart: Date, periodEnd: Date): TimeSeriesDto {
    const dailyMap = new Map<string, { count: number; amount: number }>();

    // Inicializar todos los días del periodo
    const currentDate = new Date(periodStart);
    while (currentDate <= periodEnd) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyMap.set(dateKey, { count: 0, amount: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Agregar tickets por día
    tickets.forEach(ticket => {
      const dateKey = new Date(ticket.fechaTicket).toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.count += 1;
        existing.amount += Number(ticket.importeTotal);
      }
    });

    const dailyTickets: DailyDataDto[] = [];
    const dailyAmount: DailyAmountDto[] = [];

    dailyMap.forEach((value, date) => {
      dailyTickets.push({ date, count: value.count });
      dailyAmount.push({ date, amount: Math.round(value.amount * 100) / 100 });
    });

    return { dailyTickets, dailyAmount };
  }

  private async calculateCampaignStats(
    campaign: Campaign,
    periodStart: Date,
    periodEnd: Date,
    associateId?: string
  ): Promise<CampaignStatsDto> {
    // Obtener todas las participaciones de esta campaña en el periodo
    const participationsQuery = this.participationRepository
      .createQueryBuilder('p')
      .innerJoin('p.ticket', 't')
      .where('p.campaignId = :campaignId', { campaignId: campaign.id })
      .andWhere('t.fechaTicket BETWEEN :periodStart AND :periodEnd', { periodStart, periodEnd });

    if (associateId) {
      participationsQuery.andWhere('t.associateId = :associateId', { associateId });
    }

    const participations = await participationsQuery
      .leftJoinAndSelect('p.ticket', 'ticket')
      .leftJoinAndSelect('ticket.associate', 'associate')
      .getMany();

    // Calcular estadísticas básicas
    const totalParticipations = participations.length;
    const uniqueTickets = new Set(participations.map(p => p.ticketId));
    const totalTickets = uniqueTickets.size;
    const totalAmount = participations.reduce((sum, p) => sum + Number(p.ticket?.importeTotal || 0), 0);

    // Calcular progreso si hay cuantía máxima
    const progress = campaign.cuantiaMaximaAcumulable
      ? Math.min((totalAmount / Number(campaign.cuantiaMaximaAcumulable)) * 100, 100)
      : null;

    // Últimos 7 días
    const sevenDaysAgo = new Date(periodEnd);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentParticipations = participations.filter(
      p => p.ticket && new Date(p.ticket.fechaTicket) >= sevenDaysAgo
    );
    const recentUniqueTickets = new Set(recentParticipations.map(p => p.ticketId));
    const recentTickets = recentUniqueTickets.size;

    // Top comercios en esta campaña
    const associateStatsMap = new Map<string, { name: string; tickets: Set<string>; amount: number }>();
    participations.forEach(p => {
      if (p.ticket?.associate) {
        const associateId = p.ticket.associate.id;
        if (!associateStatsMap.has(associateId)) {
          associateStatsMap.set(associateId, {
            name: p.ticket.associate.nombre,
            tickets: new Set(),
            amount: 0,
          });
        }
        const stats = associateStatsMap.get(associateId)!;
        stats.tickets.add(p.ticketId);
        stats.amount += Number(p.ticket.importeTotal);
      }
    });

    const topAssociates: TopAssociateDto[] = Array.from(associateStatsMap.entries())
      .map(([id, data]) => ({
        id,
        nombre: data.name,
        ticketCount: data.tickets.size,
        amount: Math.round(data.amount * 100) / 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Distribución diaria (últimos 30 días)
    const thirtyDaysAgo = new Date(periodEnd);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyDistributionMap = new Map<string, { tickets: Set<string>; participations: number; amount: number }>();

    participations
      .filter(p => p.ticket && new Date(p.ticket.fechaTicket) >= thirtyDaysAgo)
      .forEach(p => {
        const dateKey = new Date(p.ticket!.fechaTicket).toISOString().split('T')[0];
        if (!dailyDistributionMap.has(dateKey)) {
          dailyDistributionMap.set(dateKey, { tickets: new Set(), participations: 0, amount: 0 });
        }
        const daily = dailyDistributionMap.get(dateKey)!;
        daily.tickets.add(p.ticketId);
        daily.participations += 1;
        daily.amount += Number(p.ticket?.importeTotal || 0);
      });

    const dailyDistribution: DailyCampaignDistributionDto[] = Array.from(dailyDistributionMap.entries())
      .map(([date, data]) => ({
        date,
        tickets: data.tickets.size,
        participations: data.participations,
        amount: Math.round(data.amount * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Días restantes
    const now = new Date();
    const diasRestantes = Math.ceil((new Date(campaign.fechaFin).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const stats: CampaignStatsDetailsDto = {
      totalTickets,
      totalParticipations,
      totalAmount: Math.round(totalAmount * 100) / 100,
      progress: progress !== null ? Math.round(progress * 100) / 100 : null,
      recentTickets,
      recentParticipations: recentParticipations.length,
      topAssociates,
      dailyDistribution,
    };

    return {
      id: campaign.id,
      nombre: campaign.nombre,
      imagenUrl: campaign.imagenUrl,
      isActive: campaign.isActive,
      fechaInicio: campaign.fechaInicio,
      fechaFin: campaign.fechaFin,
      diasRestantes,
      importeMinimo: Number(campaign.importeMinimo),
      cuantiaMaximaAcumulable: campaign.cuantiaMaximaAcumulable ? Number(campaign.cuantiaMaximaAcumulable) : null,
      stats,
    };
  }

  private calculateCampaignsSummary(campaigns: Campaign[]): CampaignsSummaryDto {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.isActive && now >= new Date(c.fechaInicio) && now <= new Date(c.fechaFin)).length;
    const upcomingCampaigns = campaigns.filter(c => new Date(c.fechaInicio) > now && new Date(c.fechaInicio) <= sevenDaysLater).length;
    const expiringSoon = campaigns.filter(c => c.isActive && new Date(c.fechaFin) > now && new Date(c.fechaFin) <= sevenDaysLater).length;

    return {
      totalCampaigns,
      activeCampaigns,
      upcomingCampaigns,
      expiringSoon,
    };
  }

  private async calculateTopUsers(
    periodStart: Date,
    periodEnd: Date,
    campaignId?: string,
    associateId?: string,
    limit: number = 5
  ): Promise<TopUserDto[]> {
    // Query base para tickets
    const ticketsQuery = this.ticketRepository
      .createQueryBuilder('t')
      .innerJoin('t.user', 'u')
      .where('t.fechaTicket BETWEEN :periodStart AND :periodEnd', { periodStart, periodEnd });

    if (associateId) {
      ticketsQuery.andWhere('t.associateId = :associateId', { associateId });
    }

    // Si se filtra por campaña, necesitamos unir con participaciones
    if (campaignId) {
      ticketsQuery
        .innerJoin('participations', 'p', 'p.ticketId = t.id')
        .andWhere('p.campaignId = :campaignId', { campaignId });
    }

    const tickets = await ticketsQuery
      .select(['t.id', 't.userId', 't.importeTotal', 'u.fullName'])
      .getRawMany();

    // Agrupar por usuario
    const userStatsMap = new Map<string, { name: string; tickets: Set<string>; amount: number; campaigns: Set<string> }>();

    for (const ticket of tickets) {
      const userId = ticket.t_userId;
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          name: ticket.u_fullName,
          tickets: new Set(),
          amount: 0,
          campaigns: new Set(),
        });
      }
      const stats = userStatsMap.get(userId)!;
      stats.tickets.add(ticket.t_id);
      stats.amount += Number(ticket.t_importeTotal);

      // Obtener campañas del usuario
      if (!campaignId) {
        const participations = await this.participationRepository.find({
          where: { ticketId: ticket.t_id },
          select: ['campaignId'],
        });
        participations.forEach(p => {
          if (p.campaignId) stats.campaigns.add(p.campaignId);
        });
      }
    }

    return Array.from(userStatsMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.name,
        totalTickets: data.tickets.size,
        totalAmount: Math.round(data.amount * 100) / 100,
        campaignsCount: campaignId ? 1 : data.campaigns.size,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  }

  private async calculateTopAssociates(
    periodStart: Date,
    periodEnd: Date,
    campaignId?: string,
    limit: number = 5
  ): Promise<TopAssociateGlobalDto[]> {
    const ticketsQuery = this.ticketRepository
      .createQueryBuilder('t')
      .innerJoin('t.associate', 'a')
      .where('t.fechaTicket BETWEEN :periodStart AND :periodEnd', { periodStart, periodEnd });

    if (campaignId) {
      ticketsQuery
        .innerJoin('participations', 'p', 'p.ticketId = t.id')
        .andWhere('p.campaignId = :campaignId', { campaignId });
    }

    const tickets = await ticketsQuery
      .select(['t.id', 't.associateId', 't.importeTotal', 'a.nombre'])
      .getRawMany();

    // Agrupar por comercio
    const associateStatsMap = new Map<string, { name: string; tickets: Set<string>; amount: number }>();

    tickets.forEach(ticket => {
      const associateId = ticket.t_associateId;
      if (!associateStatsMap.has(associateId)) {
        associateStatsMap.set(associateId, {
          name: ticket.a_nombre,
          tickets: new Set(),
          amount: 0,
        });
      }
      const stats = associateStatsMap.get(associateId)!;
      stats.tickets.add(ticket.t_id);
      stats.amount += Number(ticket.t_importeTotal);
    });

    return Array.from(associateStatsMap.entries())
      .map(([associateId, data]) => ({
        associateId,
        associateName: data.name,
        totalTickets: data.tickets.size,
        totalAmount: Math.round(data.amount * 100) / 100,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit);
  }
}

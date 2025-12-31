import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions, Like, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';

import { Participation } from './entities/participation.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { Associate } from '../associates/entities/associate.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { ParticipationResponseDto } from './dto/participation-response.dto';
import { ParticipationSearchDto } from './dto/participation-search.dto';
import { ParticipationsResponseDto, PaginationMetaDto } from './dto/participations-response.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class ParticipationsService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private emailService: EmailService,
  ) {}

  /**
   * Crear nuevas participaciones automáticamente en todas las campañas válidas
   * Un ticket puede generar múltiples participaciones (una por cada campaña activa que cumpla criterios)
   */
  async create(
    createParticipationDto: CreateParticipationDto,
    userId: string
  ): Promise<ParticipationResponseDto[]> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el comercio existe y está activo
    const associate = await this.associateRepository.findOne({
      where: { id: createParticipationDto.associateId, activo: true },
    });
    if (!associate) {
      throw new NotFoundException('Comercio no encontrado o inactivo');
    }

    // Validar fecha (no puede ser futura)
    const fechaTicket = new Date(createParticipationDto.fechaTicket);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (fechaTicket > today) {
      throw new BadRequestException('La fecha del ticket no puede ser futura');
    }

    // Validar que la fecha no sea muy antigua (máximo 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    if (fechaTicket < thirtyDaysAgo) {
      throw new BadRequestException('La fecha del ticket no puede ser anterior a 30 días');
    }

    // Verificar límite de tickets por día (máximo 5 por usuario por día)
    const startOfDay = new Date(fechaTicket);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fechaTicket);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyTickets = await this.ticketRepository.count({
      where: {
        userId,
        fechaTicket: Between(startOfDay, endOfDay),
      },
    });

    if (dailyTickets >= 5) {
      throw new ForbiddenException('Has alcanzado el límite máximo de 5 tickets por día');
    }

    // Buscar todas las campañas activas que cumplan los criterios básicos:
    // 1. isActive = true
    // 2. fechaInicio <= fechaTicket <= fechaFin
    // 3. importeMinimo <= importeTotal
    const validCampaigns = await this.campaignRepository.find({
      where: {
        isActive: true,
        fechaInicio: LessThanOrEqual(fechaTicket),
        fechaFin: MoreThanOrEqual(fechaTicket),
      },
    });

    // Filtrar por importe mínimo
    let eligibleCampaigns = validCampaigns.filter(
      campaign => createParticipationDto.importeTotal >= campaign.importeMinimo
    );

    if (eligibleCampaigns.length === 0) {
      throw new BadRequestException(
        `El ticket no cumple los criterios de ninguna campaña activa. ` +
        `Importe del ticket: ${createParticipationDto.importeTotal}€. ` +
        `Fecha del ticket: ${createParticipationDto.fechaTicket}`
      );
    }

    // Verificar límite máximo acumulable por usuario en cada campaña
    // Calcular el total acumulado del usuario en cada campaña usando tickets a través de participaciones
    const campaignsWithAccumulated = await Promise.all(
      eligibleCampaigns.map(async (campaign) => {
        // Obtener todas las participaciones de esta campaña con sus tickets
        const participations = await this.participationRepository.find({
          where: {
            campaignId: campaign.id,
          },
          relations: ['ticket'],
        });

        // Filtrar participaciones del usuario y sumar importes de tickets
        const acumuladoActual = participations
          .filter(p => p.ticket.userId === userId)
          .reduce((sum, p) => {
            return sum + parseFloat(p.ticket.importeTotal.toString());
          }, 0);

        // Verificar si el nuevo ticket superaría el límite
        const nuevoAcumulado = acumuladoActual + createParticipationDto.importeTotal;

        // Verificar si hay límite máximo y si se superaría
        const tieneLimite = campaign.cuantiaMaximaAcumulable !== null && campaign.cuantiaMaximaAcumulable !== undefined;
        const superaLimite = tieneLimite && nuevoAcumulado > campaign.cuantiaMaximaAcumulable;

        return {
          campaign,
          acumuladoActual,
          nuevoAcumulado,
          superaLimite,
          puedeParticipar: !superaLimite,
        };
      })
    );

    // Filtrar solo las campañas donde el usuario puede participar
    const finalEligibleCampaigns = campaignsWithAccumulated
      .filter(item => item.puedeParticipar)
      .map(item => item.campaign);

    if (finalEligibleCampaigns.length === 0) {
      // Informar qué campañas fueron excluidas y por qué
      const excludedCampaigns = campaignsWithAccumulated
        .filter(item => !item.puedeParticipar)
        .map(item => ({
          nombre: item.campaign.nombre,
          razon: item.campaign.cuantiaMaximaAcumulable 
            ? `Límite máximo alcanzado (${item.acumuladoActual}€ / ${item.campaign.cuantiaMaximaAcumulable}€)`
            : 'No aplica',
        }));

      throw new BadRequestException(
        `No se pueden crear participaciones. El usuario ha alcanzado el límite máximo acumulable en todas las campañas elegibles. ` +
        `Campañas excluidas: ${excludedCampaigns.map(c => `${c.nombre} (${c.razon})`).join(', ')}`
      );
    }

    // Verificar si ya existe un ticket con el mismo número para este usuario y comercio
    const existingTicket = await this.ticketRepository.findOne({
      where: {
        numeroTicket: createParticipationDto.numeroTicket,
        userId,
        associateId: createParticipationDto.associateId,
      },
    });

    if (existingTicket) {
      // Si el ticket existe, verificar que no haya participaciones duplicadas en las campañas elegibles
      const existingParticipations = await this.participationRepository.find({
        where: {
          ticketId: existingTicket.id,
          campaignId: In(finalEligibleCampaigns.map(c => c.id)),
        },
      });

      if (existingParticipations.length > 0) {
        const existingCampaigns = existingParticipations.map(p => p.campaignId);
        throw new ConflictException(
          `Ya existe una participación con este número de ticket para las campañas: ${existingCampaigns.join(', ')}`
        );
      }

      // Si el ticket existe pero no hay participaciones en las campañas elegibles, usar el ticket existente
      const ticket = existingTicket;
      const participationsToCreate = finalEligibleCampaigns.map(campaign => 
        this.participationRepository.create({
          ticketId: ticket.id,
          campaignId: campaign.id,
        })
      );

      const savedParticipations = await this.participationRepository.save(participationsToCreate);

      // Cargar relaciones para la respuesta
      const participationsWithRelations = await this.participationRepository.find({
        where: { id: In(savedParticipations.map(p => p.id)) },
        relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
      });

      // Enviar email de notificación
      await this.sendNotificationEmail(user, associate, ticket, finalEligibleCampaigns);

      return participationsWithRelations.map(p => this.toResponseDto(p));
    }

    // Crear el ticket primero
    const ticket = this.ticketRepository.create({
      userId,
      associateId: createParticipationDto.associateId,
      numeroTicket: createParticipationDto.numeroTicket,
      fechaTicket,
      importeTotal: createParticipationDto.importeTotal,
      validated: false,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Crear una participación por cada campaña elegible final
    const participationsToCreate = finalEligibleCampaigns.map(campaign => 
      this.participationRepository.create({
        ticketId: savedTicket.id,
        campaignId: campaign.id,
      })
    );

    // Guardar todas las participaciones
    const savedParticipations = await this.participationRepository.save(participationsToCreate);

    // Cargar relaciones para la respuesta
    const participationsWithRelations = await this.participationRepository.find({
      where: { id: In(savedParticipations.map(p => p.id)) },
      relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
    });

    // Enviar email de notificación al usuario
    await this.sendNotificationEmail(user, associate, savedTicket, finalEligibleCampaigns);

    return participationsWithRelations.map(p => this.toResponseDto(p));
  }

  /**
   * Método auxiliar para enviar email de notificación
   */
  private async sendNotificationEmail(
    user: User,
    associate: Associate,
    ticket: Ticket,
    campaigns: Campaign[]
  ): Promise<void> {
    if (!user.email) {
      return;
    }

    const campaignsInfo = campaigns.map(c => ({
      nombre: c.nombre,
      importeMinimo: parseFloat(c.importeMinimo.toString()),
    }));

    const fechaFormateada = new Date(ticket.fechaTicket).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    try {
      await this.emailService.sendParticipationNotification(
        user.email,
        user.fullName,
        ticket.numeroTicket,
        fechaFormateada,
        parseFloat(ticket.importeTotal.toString()),
        campaignsInfo,
        associate.nombre,
      );
    } catch (error) {
      // El error ya se maneja dentro del EmailService, solo continuamos
    }
  }

  /**
   * Buscar participaciones con filtros y paginación
   */
  async findAll(searchDto: ParticipationSearchDto, requestingUserId?: string, canReadAll: boolean = false): Promise<ParticipationsResponseDto> {
    const { page = 1, limit = 20, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Construir query builder para permitir filtros en tickets relacionados
    const queryBuilder = this.participationRepository
      .createQueryBuilder('participation')
      .leftJoinAndSelect('participation.ticket', 'ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.associate', 'associate')
      .leftJoinAndSelect('participation.campaign', 'campaign');

    // Si no tiene permiso para leer todas, solo puede ver sus propias participaciones
    if (!canReadAll && requestingUserId && !filters.userId) {
      queryBuilder.andWhere('ticket.userId = :requestingUserId', { requestingUserId });
    } else if (filters.userId) {
      queryBuilder.andWhere('ticket.userId = :userId', { userId: filters.userId });
    }

    if (filters.associateId) {
      queryBuilder.andWhere('ticket.associateId = :associateId', { associateId: filters.associateId });
    }

    if (filters.numeroTicket) {
      queryBuilder.andWhere('ticket.numeroTicket LIKE :numeroTicket', { numeroTicket: `%${filters.numeroTicket}%` });
    }

    // Filtros de fecha en ticket
    if (filters.fechaDesde || filters.fechaHasta) {
      const fechaDesde = filters.fechaDesde ? new Date(filters.fechaDesde) : undefined;
      const fechaHasta = filters.fechaHasta ? new Date(filters.fechaHasta) : undefined;
      
      if (fechaDesde && fechaHasta) {
        queryBuilder.andWhere('ticket.fechaTicket BETWEEN :fechaDesde AND :fechaHasta', { fechaDesde, fechaHasta });
      } else if (fechaDesde) {
        queryBuilder.andWhere('ticket.fechaTicket >= :fechaDesde', { fechaDesde });
      } else if (fechaHasta) {
        queryBuilder.andWhere('ticket.fechaTicket <= :fechaHasta', { fechaHasta });
      }
    }

    // Filtro de validación
    if (filters.validated !== undefined) {
      queryBuilder.andWhere('ticket.validated = :validated', { validated: filters.validated });
    }

    // Ordenar y paginar
    queryBuilder
      .orderBy('participation.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [participations, total] = await queryBuilder.getManyAndCount();

    // Convertir a ResponseDto
    const participationResponses: ParticipationResponseDto[] = participations.map(participation => 
      this.toResponseDto(participation)
    );

    const totalPages = Math.ceil(total / limit);
    
    const pagination: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      participations: participationResponses,
      pagination,
    };
  }

  /**
   * Obtener participación por ID
   */
  async findOne(id: string, requestingUserId?: string, canReadAll: boolean = false): Promise<ParticipationResponseDto> {
    const participation = await this.participationRepository.findOne({
      where: { id },
      relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
    });

    if (!participation) {
      throw new NotFoundException('Participación no encontrada');
    }

    // Verificar que el usuario solo puede ver sus propias participaciones (a menos que tenga permiso para leer todas)
    if (!canReadAll && requestingUserId && participation.ticket.userId !== requestingUserId) {
      throw new ForbiddenException('No tienes permisos para ver esta participación');
    }

    return this.toResponseDto(participation);
  }

  /**
   * Obtener participaciones de un usuario específico
   */
  async findByUser(userId: string, requestingUserId?: string, canReadAll: boolean = false): Promise<ParticipationResponseDto[]> {
    // Verificar que solo puede ver sus propias participaciones (a menos que tenga permiso para leer todas)
    if (!canReadAll && requestingUserId && userId !== requestingUserId) {
      throw new ForbiddenException('No tienes permisos para ver las participaciones de este usuario');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const participations = await this.participationRepository.find({
      where: {},
      relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
      order: { createdAt: 'DESC' },
    });

    // Filtrar por userId del ticket
    const userParticipations = participations.filter(p => p.ticket.userId === userId);

    return userParticipations.map(participation => this.toResponseDto(participation));
  }

  /**
   * Actualizar el estado de validación de un ticket a través de una participación
   */
  async updateTicketValidation(
    participationId: string,
    validated: boolean,
    userId: string,
    canManage: boolean
  ): Promise<ParticipationResponseDto> {
    // Buscar la participación con su ticket
    const participation = await this.participationRepository.findOne({
      where: { id: participationId },
      relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
    });

    if (!participation) {
      throw new NotFoundException('Participación no encontrada');
    }

    // Verificar permisos: solo administradores pueden validar/invalidar
    if (!canManage) {
      throw new ForbiddenException('No tienes permisos para validar/invalidar participaciones');
    }

    // Actualizar el estado de validación del ticket (afecta todas las participaciones del ticket)
    participation.ticket.validated = validated;
    await this.ticketRepository.save(participation.ticket);

    // Recargar la participación con el ticket actualizado
    const updatedParticipation = await this.participationRepository.findOne({
      where: { id: participationId },
      relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
    });

    return this.toResponseDto(updatedParticipation);
  }

  /**
   * Método interno para convertir Participation entity a ResponseDto
   */
  private toResponseDto(participation: Participation): ParticipationResponseDto {
    const dto: ParticipationResponseDto = {
      id: participation.id,
      ticketId: participation.ticketId,
      campaignId: participation.campaignId,
      createdAt: participation.createdAt,
      updatedAt: participation.updatedAt,
    };

    // Incluir datos del ticket si está disponible
    if (participation.ticket) {
      dto.ticket = {
        id: participation.ticket.id,
        userId: participation.ticket.userId,
        associateId: participation.ticket.associateId,
        numeroTicket: participation.ticket.numeroTicket,
        fechaTicket: participation.ticket.fechaTicket,
        importeTotal: participation.ticket.importeTotal,
        validated: participation.ticket.validated,
        createdAt: participation.ticket.createdAt,
        updatedAt: participation.ticket.updatedAt,
      };

      // Incluir datos del usuario si está disponible
      if (participation.ticket.user) {
        dto.ticket.user = {
          id: participation.ticket.user.id,
          fullName: participation.ticket.user.fullName,
          email: participation.ticket.user.email,
          phone: participation.ticket.user.phone,
        };
      }

      // Incluir datos del comercio si está disponible
      if (participation.ticket.associate) {
        dto.ticket.associate = {
          id: participation.ticket.associate.id,
          nombre: participation.ticket.associate.nombre,
          direccion: participation.ticket.associate.direccion,
        };
      }
    }

    // Incluir datos de la campaña si está disponible
    if (participation.campaign) {
      dto.campaign = {
        id: participation.campaign.id,
        nombre: participation.campaign.nombre,
        importeMinimo: participation.campaign.importeMinimo,
      };
    }

    return dto;
  }
}


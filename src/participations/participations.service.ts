import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions, Like, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';

import { Participation } from './entities/participation.entity';
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

    // Verificar límite de participaciones por día (máximo 5 por usuario por día)
    const startOfDay = new Date(fechaTicket);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fechaTicket);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyParticipations = await this.participationRepository.count({
      where: {
        userId,
        fechaTicket: Between(startOfDay, endOfDay),
      },
    });

    if (dailyParticipations >= 5) {
      throw new ForbiddenException('Has alcanzado el límite máximo de 5 participaciones por día');
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
    // Calcular el total acumulado del usuario en cada campaña
    const campaignsWithAccumulated = await Promise.all(
      eligibleCampaigns.map(async (campaign) => {
        // Calcular el total acumulado del usuario en esta campaña
        const participations = await this.participationRepository.find({
          where: {
            userId,
            campaignId: campaign.id,
          },
        });

        // Sumar los importes totales de todas las participaciones previas del usuario en esta campaña
        const acumuladoActual = participations.reduce((sum, p) => {
          return sum + parseFloat(p.importeTotal.toString());
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

    // Verificar que no exista ya una participación con el mismo número de ticket
    // para este usuario y comercio en alguna de las campañas elegibles finales
    const existingParticipations = await this.participationRepository.find({
      where: {
        numeroTicket: createParticipationDto.numeroTicket,
        associateId: createParticipationDto.associateId,
        userId: userId,
        campaignId: In(finalEligibleCampaigns.map(c => c.id)),
      },
    });

    if (existingParticipations.length > 0) {
      const existingCampaigns = existingParticipations.map(p => p.campaignId);
      throw new ConflictException(
        `Ya existe una participación con este número de ticket para las campañas: ${existingCampaigns.join(', ')}`
      );
    }

    // Crear una participación por cada campaña elegible final
    const participationsToCreate = finalEligibleCampaigns.map(campaign => 
      this.participationRepository.create({
        userId,
        associateId: createParticipationDto.associateId,
        campaignId: campaign.id,
        numeroTicket: createParticipationDto.numeroTicket,
        fechaTicket,
        importeTotal: createParticipationDto.importeTotal,
      })
    );

    // Guardar todas las participaciones
    const savedParticipations = await this.participationRepository.save(participationsToCreate);

    // Cargar relaciones para la respuesta
    const participationsWithRelations = await this.participationRepository.find({
      where: { id: In(savedParticipations.map(p => p.id)) },
      relations: ['user', 'associate', 'campaign'],
    });

    // Enviar email de notificación al usuario
    if (participationsWithRelations.length > 0 && user.email) {
      const firstParticipation = participationsWithRelations[0];
      const campaigns = finalEligibleCampaigns.map(c => ({
        nombre: c.nombre,
        importeMinimo: parseFloat(c.importeMinimo.toString()),
      }));

      // Formatear fecha para el email
      const fechaFormateada = new Date(firstParticipation.fechaTicket).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      try {
        await this.emailService.sendParticipationNotification(
          user.email,
          user.fullName,
          createParticipationDto.numeroTicket,
          fechaFormateada,
          createParticipationDto.importeTotal,
          campaigns,
          associate.nombre,
        );
      } catch (error) {
        // El error ya se maneja dentro del EmailService, solo continuamos
        // La participación ya se creó exitosamente
      }
    }

    return participationsWithRelations.map(p => this.toResponseDto(p));
  }

  /**
   * Buscar participaciones con filtros y paginación
   */
  async findAll(searchDto: ParticipationSearchDto, requestingUserId?: string, canReadAll: boolean = false): Promise<ParticipationsResponseDto> {
    const { page = 1, limit = 20, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const whereConditions: any = {};

    // Si no tiene permiso para leer todas, solo puede ver sus propias participaciones
    if (!canReadAll && requestingUserId && !filters.userId) {
      whereConditions.userId = requestingUserId;
    } else if (filters.userId) {
      whereConditions.userId = filters.userId;
    }

    if (filters.associateId) {
      whereConditions.associateId = filters.associateId;
    }

    if (filters.numeroTicket) {
      whereConditions.numeroTicket = Like(`%${filters.numeroTicket}%`);
    }

    // Filtros de fecha
    if (filters.fechaDesde || filters.fechaHasta) {
      const fechaDesde = filters.fechaDesde ? new Date(filters.fechaDesde) : undefined;
      const fechaHasta = filters.fechaHasta ? new Date(filters.fechaHasta) : undefined;
      
      if (fechaDesde && fechaHasta) {
        whereConditions.fechaTicket = Between(fechaDesde, fechaHasta);
      } else if (fechaDesde) {
        whereConditions.fechaTicket = MoreThanOrEqual(fechaDesde);
      } else if (fechaHasta) {
        whereConditions.fechaTicket = LessThanOrEqual(fechaHasta);
      }
    }

    const options: FindManyOptions<Participation> = {
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user', 'associate', 'campaign'], // Incluir datos del usuario, comercio y campaña
    };

    const [participations, total] = await this.participationRepository.findAndCount(options);

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
      relations: ['user', 'associate', 'campaign'],
    });

    if (!participation) {
      throw new NotFoundException('Participación no encontrada');
    }

    // Verificar que el usuario solo puede ver sus propias participaciones (a menos que tenga permiso para leer todas)
    if (!canReadAll && requestingUserId && participation.userId !== requestingUserId) {
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
      where: { userId },
      relations: ['associate', 'campaign'],
      order: { createdAt: 'DESC' },
    });

    return participations.map(participation => this.toResponseDto(participation));
  }

  /**
   * Método interno para convertir Participation entity a ResponseDto
   */
  private toResponseDto(participation: Participation): ParticipationResponseDto {
    return {
      id: participation.id,
      userId: participation.userId,
      associateId: participation.associateId,
      campaignId: participation.campaignId,
      numeroTicket: participation.numeroTicket,
      fechaTicket: participation.fechaTicket,
      importeTotal: participation.importeTotal,
      createdAt: participation.createdAt,
      updatedAt: participation.updatedAt,
      // Incluir datos relacionados si están disponibles
      user: participation.user ? {
        id: participation.user.id,
        fullName: participation.user.fullName,
        email: participation.user.email,
        phone: participation.user.phone,
      } : undefined,
      associate: participation.associate ? {
        id: participation.associate.id,
        nombre: participation.associate.nombre,
        direccion: participation.associate.direccion,
      } : undefined,
      campaign: participation.campaign ? {
        id: participation.campaign.id,
        nombre: participation.campaign.nombre,
        importeMinimo: participation.campaign.importeMinimo,
      } : undefined,
    };
  }
}

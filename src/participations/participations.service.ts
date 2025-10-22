import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

import { Participation } from './entities/participation.entity';
import { User } from '../users/entities/user.entity';
import { Associate } from '../associates/entities/associate.entity';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { ParticipationResponseDto } from './dto/participation-response.dto';
import { ParticipationSearchDto } from './dto/participation-search.dto';
import { ParticipationsResponseDto, PaginationMetaDto } from './dto/participations-response.dto';

@Injectable()
export class ParticipationsService {
  constructor(
    @InjectRepository(Participation)
    private participationRepository: Repository<Participation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
  ) {}

  /**
   * Crear nueva participación
   */
  async create(
    createParticipationDto: CreateParticipationDto,
    userId: string
  ): Promise<ParticipationResponseDto> {
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

    // Verificar si ya existe una participación con el mismo número de ticket y comercio
    const existingParticipation = await this.participationRepository.findOne({
      where: {
        numeroTicket: createParticipationDto.numeroTicket,
        associateId: createParticipationDto.associateId,
      },
    });

    if (existingParticipation) {
      throw new ConflictException('Ya existe una participación con este número de ticket en el mismo comercio');
    }

    // Validar fecha (no puede ser futura)
    const fechaTicket = new Date(createParticipationDto.fechaTicket);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final del día actual

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

    // Crear la participación
    const participation = this.participationRepository.create({
      ...createParticipationDto,
      userId,
      fechaTicket,
    });

    const savedParticipation = await this.participationRepository.save(participation);

    return this.toResponseDto(savedParticipation);
  }

  /**
   * Buscar participaciones con filtros y paginación
   */
  async findAll(searchDto: ParticipationSearchDto, requestingUserId?: string): Promise<ParticipationsResponseDto> {
    const { page = 1, limit = 20, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const whereConditions: any = {};

    // Si no es admin, solo puede ver sus propias participaciones
    if (requestingUserId && !filters.userId) {
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
      relations: ['user', 'associate'], // Incluir datos del usuario y comercio
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
  async findOne(id: string, requestingUserId?: string): Promise<ParticipationResponseDto> {
    const participation = await this.participationRepository.findOne({
      where: { id },
      relations: ['user', 'associate'],
    });

    if (!participation) {
      throw new NotFoundException('Participación no encontrada');
    }

    // Verificar que el usuario solo puede ver sus propias participaciones (a menos que sea admin)
    if (requestingUserId && participation.userId !== requestingUserId) {
      throw new ForbiddenException('No tienes permisos para ver esta participación');
    }

    return this.toResponseDto(participation);
  }

  /**
   * Obtener participaciones de un usuario específico
   */
  async findByUser(userId: string, requestingUserId?: string): Promise<ParticipationResponseDto[]> {
    // Verificar que solo puede ver sus propias participaciones (a menos que sea admin)
    if (requestingUserId && userId !== requestingUserId) {
      throw new ForbiddenException('No tienes permisos para ver las participaciones de este usuario');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const participations = await this.participationRepository.find({
      where: { userId },
      relations: ['associate'],
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
    };
  }
}

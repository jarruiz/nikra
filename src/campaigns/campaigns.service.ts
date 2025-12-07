import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { toZonedTime } from 'date-fns-tz';

import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignSearchDto } from './dto/campaign-search.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { CampaignsResponseDto, PaginationMetaDto } from './dto/campaigns-response.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  /**
   * Crear nueva campaña
   */
  async create(createCampaignDto: CreateCampaignDto): Promise<CampaignResponseDto> {
    // Verificar si ya existe una campaña con el mismo nombre
    const existingCampaign = await this.campaignRepository.findOne({
      where: { nombre: createCampaignDto.nombre },
    });

    if (existingCampaign) {
      throw new ConflictException('Ya existe una campaña con este nombre');
    }

    // Convertir fechas de string a Date (ahora son obligatorias)
    const fechaInicio = new Date(createCampaignDto.fechaInicio);
    const fechaFin = new Date(createCampaignDto.fechaFin);

    // Validar que fechaFin sea posterior a fechaInicio
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const campaignData = {
      ...createCampaignDto,
      fechaInicio,
      fechaFin,
    };

    const campaign = this.campaignRepository.create(campaignData);
    const savedCampaign = await this.campaignRepository.save(campaign);

    return this.toResponseDto(savedCampaign);
  }

  /**
   * Buscar campañas con filtros y paginación
   */
  async findAll(searchDto: CampaignSearchDto): Promise<CampaignsResponseDto> {
    const { page = 1, limit = 10, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const whereConditions: any = {};
    
    if (filters.nombre) {
      whereConditions.nombre = Like(`%${filters.nombre}%`);
    }
    if (filters.isActive !== undefined) {
      whereConditions.isActive = filters.isActive;
    }

    const options: FindManyOptions<Campaign> = {
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' as any },
    };

    const [campaigns, total] = await this.campaignRepository.findAndCount(options);

    // Convertir a ResponseDto
    const campaignResponses: CampaignResponseDto[] = campaigns.map(campaign => 
      this.toResponseDto(campaign)
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
      campaigns: campaignResponses,
      pagination,
    };
  }

  /**
   * Obtener campaña por ID
   */
  async findOne(id: string): Promise<CampaignResponseDto> {
    const campaign = await this.findById(id);
    return this.toResponseDto(campaign);
  }

  /**
   * Actualizar campaña
   */
  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<CampaignResponseDto> {
    const campaign = await this.findById(id);

    // Verificar si el nombre ya existe en otra campaña
    if (updateCampaignDto.nombre && updateCampaignDto.nombre !== campaign.nombre) {
      const existingCampaign = await this.campaignRepository.findOne({
        where: { nombre: updateCampaignDto.nombre },
      });
      if (existingCampaign && existingCampaign.id !== id) {
        throw new ConflictException('Ya existe una campaña con este nombre');
      }
    }

    // Convertir fechas de string a Date si están presentes
    let fechaInicio = campaign.fechaInicio;
    let fechaFin = campaign.fechaFin;

    if (updateCampaignDto.fechaInicio) {
      fechaInicio = new Date(updateCampaignDto.fechaInicio);
    }
    if (updateCampaignDto.fechaFin) {
      fechaFin = new Date(updateCampaignDto.fechaFin);
    }

    // Validar que fechaFin sea posterior a fechaInicio
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const updateData = {
      ...updateCampaignDto,
      fechaInicio: updateCampaignDto.fechaInicio ? fechaInicio : undefined,
      fechaFin: updateCampaignDto.fechaFin ? fechaFin : undefined,
      updatedAt: new Date(),
    };

    // Eliminar propiedades undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Actualizar campaña
    await this.campaignRepository.update(id, updateData);

    // Obtener campaña actualizada
    const updatedCampaign = await this.findById(id);
    return this.toResponseDto(updatedCampaign);
  }

  /**
   * Eliminar campaña (soft delete - desactivar)
   */
  async remove(id: string): Promise<void> {
    const campaign = await this.findById(id);
    
    await this.campaignRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Cambiar estado de la campaña
   */
  async updateStatus(id: string, isActive: boolean): Promise<CampaignResponseDto> {
    const campaign = await this.findById(id);
    
    await this.campaignRepository.update(id, {
      isActive,
      updatedAt: new Date(),
    });

    const updatedCampaign = await this.findById(id);
    return this.toResponseDto(updatedCampaign);
  }

  /**
   * Obtener campañas activas
   */
  async findActive(): Promise<CampaignResponseDto[]> {
    const campaigns = await this.campaignRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    return campaigns.map(campaign => this.toResponseDto(campaign));
  }

  /**
   * Clonar campaña
   */
  async clone(id: string, newName?: string): Promise<CampaignResponseDto> {
    const originalCampaign = await this.findById(id);
    
    const clonedData = {
      nombre: newName || `${originalCampaign.nombre} (Copia)`,
      descripcion: originalCampaign.descripcion,
      imagenUrl: originalCampaign.imagenUrl,
      isActive: false, // La copia inicia inactiva
      fechaInicio: originalCampaign.fechaInicio,
      fechaFin: originalCampaign.fechaFin,
      importeMinimo: originalCampaign.importeMinimo,
      cuantiaMaximaAcumulable: originalCampaign.cuantiaMaximaAcumulable,
      reglaParticipacion: originalCampaign.reglaParticipacion,
      reglaRedondeo: originalCampaign.reglaRedondeo,
      basesLegalesUrl: originalCampaign.basesLegalesUrl,
    };

    // Verificar que el nombre de la copia no existe
    const existingCampaign = await this.campaignRepository.findOne({
      where: { nombre: clonedData.nombre },
    });

    if (existingCampaign) {
      throw new ConflictException('Ya existe una campaña con este nombre');
    }

    const clonedCampaign = this.campaignRepository.create(clonedData);
    const savedCampaign = await this.campaignRepository.save(clonedCampaign);

    return this.toResponseDto(savedCampaign);
  }

  /**
   * Método interno para encontrar campaña por ID
   */
  private async findById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }
    return campaign;
  }

  /**
   * Actualizar el estado de las campañas basado en las fechas
   * Este método es llamado por el scheduler para actualizar automáticamente isActive
   * Las fechas se comparan en zona horaria de España (Europe/Madrid)
   */
  async updateCampaignStatusByDates(): Promise<{ updated: number; activated: number; deactivated: number }> {
    const timeZone = 'Europe/Madrid';
    const nowUtc = new Date();
    
    // Convertir la fecha actual a zona horaria de España
    const nowSpain = toZonedTime(nowUtc, timeZone);
    
    // Buscar todas las campañas
    const campaigns = await this.campaignRepository.find();

    let updated = 0;
    let activated = 0;
    let deactivated = 0;

    for (const campaign of campaigns) {
      // Convertir las fechas de la campaña a zona horaria de España para comparación
      const fechaInicioSpain = toZonedTime(campaign.fechaInicio, timeZone);
      const fechaFinSpain = toZonedTime(campaign.fechaFin, timeZone);
      
      // Determinar si la campaña debería estar activa
      // Activa si: fechaInicio ya pasó Y fechaFin aún no ha llegado
      const shouldBeActive = fechaInicioSpain <= nowSpain && fechaFinSpain > nowSpain;
      
      // Solo actualizar si el estado actual es diferente al esperado
      if (campaign.isActive !== shouldBeActive) {
        await this.campaignRepository.update(campaign.id, {
          isActive: shouldBeActive,
          updatedAt: new Date(),
        });
        
        updated++;
        if (shouldBeActive) {
          activated++;
        } else {
          deactivated++;
        }
      }
    }

    return { updated, activated, deactivated };
  }

  /**
   * Convertir Campaign entity a ResponseDto
   */
  private toResponseDto(campaign: Campaign): CampaignResponseDto {
    return {
      id: campaign.id,
      nombre: campaign.nombre,
      descripcion: campaign.descripcion,
      imagenUrl: campaign.imagenUrl,
      isActive: campaign.isActive,
      fechaInicio: campaign.fechaInicio,
      fechaFin: campaign.fechaFin,
      importeMinimo: campaign.importeMinimo,
      cuantiaMaximaAcumulable: campaign.cuantiaMaximaAcumulable,
      reglaParticipacion: campaign.reglaParticipacion,
      reglaRedondeo: campaign.reglaRedondeo,
      basesLegalesUrl: campaign.basesLegalesUrl,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }
}

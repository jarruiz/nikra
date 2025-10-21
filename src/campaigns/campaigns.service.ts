import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';

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

    const campaign = this.campaignRepository.create(createCampaignDto);
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

    // Actualizar campaña
    await this.campaignRepository.update(id, {
      ...updateCampaignDto,
      updatedAt: new Date(),
    });

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
   * Convertir Campaign entity a ResponseDto
   */
  private toResponseDto(campaign: Campaign): CampaignResponseDto {
    return {
      id: campaign.id,
      nombre: campaign.nombre,
      descripcion: campaign.descripcion,
      imagenUrl: campaign.imagenUrl,
      isActive: campaign.isActive,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    };
  }
}

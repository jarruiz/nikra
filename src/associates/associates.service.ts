import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';

import { Associate } from './entities/associate.entity';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { AssociateResponseDto } from './dto/associate-response.dto';
import { AssociatesResponseDto, PaginationMetaDto } from './dto/associates-response.dto';

@Injectable()
export class AssociatesService {
  constructor(
    @InjectRepository(Associate)
    private associateRepository: Repository<Associate>,
  ) {}

  /**
   * Crear nuevo comercio adherido
   */
  async create(createAssociateDto: CreateAssociateDto): Promise<AssociateResponseDto> {
    // Verificar si ya existe un comercio con el mismo nombre
    const existingAssociate = await this.associateRepository.findOne({
      where: { nombre: createAssociateDto.nombre },
    });

    if (existingAssociate) {
      throw new ConflictException('Ya existe un comercio con este nombre');
    }

    const associate = this.associateRepository.create(createAssociateDto);
    const savedAssociate = await this.associateRepository.save(associate);

    return this.toResponseDto(savedAssociate);
  }

  /**
   * Buscar comercios con filtros y paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 100,
    nombre?: string,
    activo?: boolean
  ): Promise<AssociatesResponseDto> {
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const whereConditions: any = {};
    
    if (nombre) {
      whereConditions.nombre = Like(`%${nombre}%`);
    }
    if (activo !== undefined) {
      whereConditions.activo = activo;
    }

    const options: FindManyOptions<Associate> = {
      where: whereConditions,
      skip,
      take: limit,
      order: { nombre: 'ASC' }, // Ordenar por nombre alfabéticamente para mostrar
    };

    const [associates, total] = await this.associateRepository.findAndCount(options);

    // Convertir a ResponseDto
    const associateResponses: AssociateResponseDto[] = associates.map(associate => 
      this.toResponseDto(associate)
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
      associates: associateResponses,
      pagination,
    };
  }

  /**
   * Obtener lista simple de comercios activos (para desplegables)
   */
  async findActive(): Promise<AssociateResponseDto[]> {
    const associates = await this.associateRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });

    return associates.map(associate => this.toResponseDto(associate));
  }

  /**
   * Obtener comercio por ID
   */
  async findOne(id: string): Promise<AssociateResponseDto> {
    const associate = await this.findById(id);
    return this.toResponseDto(associate);
  }

  /**
   * Actualizar comercio
   */
  async update(id: string, updateAssociateDto: UpdateAssociateDto): Promise<AssociateResponseDto> {
    const associate = await this.findById(id);

    // Verificar si el nombre ya existe en otro comercio
    if (updateAssociateDto.nombre && updateAssociateDto.nombre !== associate.nombre) {
      const existingAssociate = await this.associateRepository.findOne({
        where: { nombre: updateAssociateDto.nombre },
      });
      if (existingAssociate && existingAssociate.id !== id) {
        throw new ConflictException('Ya existe un comercio con este nombre');
      }
    }

    // Actualizar comercio
    await this.associateRepository.update(id, {
      ...updateAssociateDto,
      updatedAt: new Date(),
    });

    // Obtener comercio actualizado
    const updatedAssociate = await this.findById(id);
    return this.toResponseDto(updatedAssociate);
  }

  /**
   * Eliminar comercio (soft delete - desactivar)
   */
  async remove(id: string): Promise<void> {
    const associate = await this.findById(id);
    
    await this.associateRepository.update(id, {
      activo: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Buscar comercio por nombre (para validaciones)
   */
  async findByName(nombre: string): Promise<Associate | null> {
    return this.associateRepository.findOne({
      where: { nombre: nombre.trim() },
    });
  }

  /**
   * Verificar si un comercio existe y está activo
   */
  async isActive(id: string): Promise<boolean> {
    const associate = await this.associateRepository.findOne({
      where: { id, activo: true },
    });
    return !!associate;
  }

  /**
   * Método interno para encontrar comercio por ID
   */
  private async findById(id: string): Promise<Associate> {
    const associate = await this.associateRepository.findOne({ where: { id } });
    if (!associate) {
      throw new NotFoundException('Comercio no encontrado');
    }
    return associate;
  }

  /**
   * Actualizar logo del comercio
   */
  async updateLogo(associateId: string, filename: string): Promise<AssociateResponseDto> {
    const associate = await this.findById(associateId);
    
    await this.associateRepository.update(associateId, {
      logoUrl: filename,
    });

    const updatedAssociate = await this.findById(associateId);
    return this.toResponseDto(updatedAssociate);
  }

  /**
   * Convertir Associate entity a ResponseDto
   */
  private toResponseDto(associate: Associate): AssociateResponseDto {
    return {
      id: associate.id,
      nombre: associate.nombre,
      direccion: associate.direccion,
      telefono: associate.telefono,
      logoUrl: associate.logoUrl,
      activo: associate.activo,
      createdAt: associate.createdAt,
      updatedAt: associate.updatedAt,
    };
  }
}

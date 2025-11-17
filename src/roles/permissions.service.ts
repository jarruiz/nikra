import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionResponseDto } from './dto/permission-response.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Obtener todos los permisos
   */
  async findAll(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });

    return permissions.map(permission => this.toResponseDto(permission));
  }

  /**
   * Obtener permiso por ID
   */
  async findOne(id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return this.toResponseDto(permission);
  }

  /**
   * Obtener permiso por nombre
   */
  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { name },
    });
  }

  /**
   * Obtener permisos por IDs
   */
  async findByIds(ids: string[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }
    return this.permissionRepository.findByIds(ids);
  }

  /**
   * Convertir Permission entity a ResponseDto
   */
  private toResponseDto(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}


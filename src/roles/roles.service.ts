import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Crear nuevo rol
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    // Verificar si ya existe un rol con el mismo nombre
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Ya existe un rol con este nombre');
    }

    // Si se marca como default, desmarcar el anterior
    if (createRoleDto.isDefault) {
      await this.unsetDefaultRole();
    }

    const role = this.roleRepository.create(createRoleDto);
    const savedRole = await this.roleRepository.save(role);

    return this.toResponseDto(savedRole);
  }

  /**
   * Obtener todos los roles
   */
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' },
    });

    return roles.map(role => this.toResponseDto(role));
  }

  /**
   * Obtener rol por ID
   */
  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    return this.toResponseDto(role);
  }

  /**
   * Obtener rol por nombre
   */
  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  /**
   * Obtener rol por defecto
   */
  async findDefaultRole(): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  /**
   * Actualizar rol
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Verificar si se está cambiando el nombre y ya existe
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException('Ya existe un rol con este nombre');
      }
    }

    // Si se marca como default, desmarcar el anterior (si no es el mismo)
    if (updateRoleDto.isDefault === true && !role.isDefault) {
      await this.unsetDefaultRole();
    }

    // Actualizar rol
    Object.assign(role, updateRoleDto);
    const updatedRole = await this.roleRepository.save(role);

    // Cargar relaciones
    const roleWithRelations = await this.roleRepository.findOne({
      where: { id: updatedRole.id },
      relations: ['permissions'],
    });

    return this.toResponseDto(roleWithRelations);
  }

  /**
   * Eliminar rol
   */
  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // No permitir eliminar el rol por defecto si es el único
    if (role.isDefault) {
      const defaultRolesCount = await this.roleRepository.count({
        where: { isDefault: true },
      });
      if (defaultRolesCount === 1) {
        throw new BadRequestException('No se puede eliminar el único rol por defecto');
      }
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(roleId: string, assignPermissionsDto: AssignPermissionsDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Verificar que todos los permisos existen
    const permissions = await this.permissionRepository.find({
      where: { id: In(assignPermissionsDto.permissionIds) },
    });

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new NotFoundException('Uno o más permisos no fueron encontrados');
    }

    // Asignar permisos (reemplazar los existentes)
    role.permissions = permissions;
    const updatedRole = await this.roleRepository.save(role);

    return this.toResponseDto(updatedRole);
  }

  /**
   * Quitar permiso de un rol
   */
  async removePermission(roleId: string, permissionId: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    role.permissions = role.permissions.filter(perm => perm.id !== permissionId);
    const updatedRole = await this.roleRepository.save(role);

    return this.toResponseDto(updatedRole);
  }

  /**
   * Desmarcar todos los roles como default
   */
  private async unsetDefaultRole(): Promise<void> {
    await this.roleRepository.update(
      { isDefault: true },
      { isDefault: false },
    );
  }

  /**
   * Convertir Role entity a ResponseDto
   */
  private toResponseDto(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isDefault: role.isDefault,
      isActive: role.isActive,
      permissions: role.permissions?.map(perm => ({
        id: perm.id,
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        createdAt: perm.createdAt,
        updatedAt: perm.updatedAt,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}


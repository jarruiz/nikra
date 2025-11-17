import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from './entities/role.entity';
import { RoleResponseDto } from './dto/role-response.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * Asignar roles a un usuario
   */
  async assignRoles(userId: string, assignRolesDto: AssignRolesDto): Promise<RoleResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que todos los roles existen
    const roles = await this.roleRepository.find({
      where: { id: In(assignRolesDto.roleIds) },
      relations: ['permissions'],
    });

    if (roles.length !== assignRolesDto.roleIds.length) {
      throw new NotFoundException('Uno o más roles no fueron encontrados');
    }

    // Asignar roles (reemplazar los existentes)
    user.roles = roles;
    await this.userRepository.save(user);

    // Retornar roles con permisos
    return roles.map(role => ({
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
    }));
  }

  /**
   * Quitar rol de un usuario
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.roles = user.roles.filter(role => role.id !== roleId);
    await this.userRepository.save(user);
  }

  /**
   * Obtener roles de un usuario
   */
  async getUserRoles(userId: string): Promise<RoleResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.roles.map(role => ({
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
    }));
  }

  /**
   * Obtener todos los permisos consolidados de un usuario (de todos sus roles)
   */
  async getUserPermissions(userId: string): Promise<PermissionResponseDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Consolidar permisos de todos los roles (sin duplicados)
    const permissionsMap = new Map<string, PermissionResponseDto>();

    for (const role of user.roles) {
      if (role.permissions) {
        for (const perm of role.permissions) {
          if (!permissionsMap.has(perm.id)) {
            permissionsMap.set(perm.id, {
              id: perm.id,
              name: perm.name,
              resource: perm.resource,
              action: perm.action,
              description: perm.description,
              createdAt: perm.createdAt,
              updatedAt: perm.updatedAt,
            });
          }
        }
      }
    }

    return Array.from(permissionsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }
}


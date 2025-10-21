import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UsersResponseDto, PaginationMetaDto } from './dto/users-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Buscar usuarios con filtros y paginación
   */
  async findAll(searchDto: UserSearchDto): Promise<UsersResponseDto> {
    const { page = 1, limit = 10, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const whereConditions: any = {};
    
    if (filters.nombre) {
      whereConditions.nombre = Like(`%${filters.nombre}%`);
    }
    if (filters.apellidos) {
      whereConditions.apellidos = Like(`%${filters.apellidos}%`);
    }
    if (filters.dni) {
      whereConditions.dni = Like(`%${filters.dni}%`);
    }
    if (filters.email) {
      whereConditions.email = Like(`%${filters.email}%`);
    }
    if (filters.isActive !== undefined) {
      whereConditions.isActive = filters.isActive;
    }
    if (filters.emailVerified !== undefined) {
      whereConditions.emailVerified = filters.emailVerified;
    }

    const options: FindManyOptions<User> = {
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' as any },
    };

    const [users, total] = await this.userRepository.findAndCount(options);

    // Convertir a UserProfileDto (sin password)
    const userProfiles: UserProfileDto[] = users.map(user => this.toProfileDto(user));

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
      users: userProfiles,
      pagination,
    };
  }

  /**
   * Actualizar datos del usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    const user = await this.findById(id);

    // Verificar si el email o DNI ya existen en otro usuario
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Este email ya está registrado');
      }
    }

    if (updateUserDto.dni && updateUserDto.dni !== user.dni) {
      const existingUser = await this.userRepository.findOne({
        where: { dni: updateUserDto.dni },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Este DNI ya está registrado');
      }
    }

    // Actualizar usuario
    await this.userRepository.update(id, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    // Obtener usuario actualizado
    const updatedUser = await this.findById(id);
    return this.toProfileDto(updatedUser);
  }

  /**
   * Soft delete del usuario (desactivar)
   */
  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    
    await this.userRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  /**
   * Buscar usuario por DNI
   */
  async findByDni(dni: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { dni: dni.toUpperCase() } });
  }

  /**
   * Buscar usuarios de forma avanzada
   */
  async searchUsers(searchTerm: string): Promise<UserProfileDto[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where(
        '(user.nombre ILIKE :search OR user.apellidos ILIKE :search OR user.email ILIKE :search OR user.dni ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .andWhere('user.isActive = :active', { active: true })
      .orderBy('user.createdAt', 'DESC')
      .limit(20)
      .getMany();

    return users.map(user => this.toProfileDto(user));
  }

  /**
   * Obtener perfil completo del usuario autenticado
   */
  async getProfile(id: string): Promise<UserProfileDto> {
    const user = await this.findById(id);
    return this.toProfileDto(user);
  }

  /**
   * Actualizar avatar del usuario
   */
  async updateAvatar(userId: string, filename: string): Promise<UserProfileDto> {
    const user = await this.findById(userId);
    
    await this.userRepository.update(userId, {
      avatarUrl: filename,
    });

    const updatedUser = await this.findById(userId);
    return this.toProfileDto(updatedUser);
  }

  /**
   * Convertir User entity a UserProfileDto (sin password)
   */
  private toProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      dni: user.dni,
      direccion: user.direccion,
      email: user.email,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

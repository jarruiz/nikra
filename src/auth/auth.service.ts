import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserProfileDto } from '../users/dto/user-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, dni } = registerDto;

    // Verificar si el usuario ya existe por email
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el usuario ya existe por DNI
    const existingUserByDni = await this.userRepository.findOne({
      where: { dni },
    });

    if (existingUserByDni) {
      throw new ConflictException('El DNI ya está registrado');
    }

    // Crear nuevo usuario
    const user = this.userRepository.create(registerDto);
    const savedUser = await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserProfileDto(savedUser),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generar tokens
    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toUserProfileDto(user),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && await user.validatePassword(password) && user.isActive) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  private async generateTokens(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      fullName: user.fullName,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    
    // Para refresh token, usamos el mismo payload
    const refreshPayload = { 
      sub: user.id, 
      email: user.email, 
      fullName: user.fullName,
      type: 'refresh' 
    };
    
    const refreshToken = await this.jwtService.signAsync(refreshPayload as any, {
      secret: this.configService.get<string>('jwt.refreshSecret') || this.configService.get<string>('jwt.secret') || 'default-secret',
      expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Convertir User entity a UserProfileDto (sin password)
   */
  private toUserProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      fullName: user.fullName,
      dni: user.dni,
      phone: user.phone,
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

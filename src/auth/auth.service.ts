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
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
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

    // Verificar si el usuario ya existe por DNI o NIE
    const existingUserByDni = await this.userRepository.findOne({
      where: { dni },
    });

    if (existingUserByDni) {
      throw new ConflictException('El DNI o NIE ya está registrado');
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
   * Solicita recuperación de contraseña
   * Genera un código numérico de 4 dígitos y envía email al usuario
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Buscar usuario por email (respuesta genérica para evitar enumeration)
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // Si el usuario no existe, retornar mensaje genérico por seguridad
    if (!user) {
      // Retornar mismo mensaje para evitar email enumeration
      return {
        message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.',
      };
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return {
        message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.',
      };
    }

    // Generar código de recuperación de 4 dígitos
    const resetCode = this.generateResetCode();
    const emailConfig = this.configService.get('email');
    const expiresIn = emailConfig.resetToken.expiresIn; // en milisegundos

    // Guardar código y fecha de expiración
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + expiresIn);
    await this.userRepository.save(user);

    // Enviar email de recuperación
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetCode,
        user.fullName,
      );
    } catch (error) {
      // Si falla el envío de email, limpiar el código
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException('Error al enviar el email de recuperación');
    }

    return {
      message: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.',
    };
  }

  /**
   * Valida si un código de recuperación es válido
   * Lanza excepciones HTTP apropiadas si el código es inválido
   */
  async validateResetCode(code: string): Promise<{ valid: boolean; message?: string }> {
    if (!code) {
      throw new BadRequestException('Código no proporcionado');
    }

    // Validar que el código tenga formato de 4 dígitos
    if (!/^\d{4}$/.test(code)) {
      throw new BadRequestException('Código inválido. Debe ser un número de 4 dígitos');
    }

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: code },
    });

    if (!user) {
      throw new NotFoundException('Código inválido o no encontrado');
    }

    if (!user.isResetTokenValid()) {
      throw new BadRequestException('Código expirado');
    }

    return { valid: true };
  }

  /**
   * Resetea la contraseña usando el código de recuperación
   */
  async resetPassword(code: string, newPassword: string): Promise<{ message: string }> {
    // Validar que el código tenga formato de 4 dígitos
    if (!code || !/^\d{4}$/.test(code)) {
      throw new BadRequestException('Código inválido. Debe ser un número de 4 dígitos');
    }

    // Buscar usuario por código
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: code },
    });

    if (!user) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Verificar si el código es válido y no ha expirado
    if (!user.isResetTokenValid()) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Actualizar contraseña (se hash automáticamente por el @BeforeInsert/Update)
    user.password = newPassword;
    // Limpiar código de recuperación
    user.clearResetToken();
    await this.userRepository.save(user);

    return {
      message: 'Contraseña restablecida exitosamente',
    };
  }

  /**
   * Genera un código numérico de 4 dígitos para recuperación de contraseña
   */
  private generateResetCode(): string {
    // Generar número aleatorio entre 0 y 9999, luego formatear con ceros a la izquierda
    const code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return code;
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

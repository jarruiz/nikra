import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registro de usuario',
    description: 'Registra un nuevo usuario con los datos requeridos según PDF',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email o DNI ya registrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: 'Inicio de sesión',
    description: 'Autentica un usuario con email y contraseña',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Perfil del usuario autenticado',
    description: 'Obtiene los datos del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async getProfile(@Request() req): Promise<UserProfileDto> {
    const user = await this.authService.findUserById(req.user.id);
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Cierra la sesión del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  async logout(@Request() req): Promise<{ message: string }> {
    // En una implementación completa, aquí se invalidarían los tokens
    // Por ahora, simplemente retornamos un mensaje de éxito
    return { message: 'Sesión cerrada exitosamente' };
  }
}

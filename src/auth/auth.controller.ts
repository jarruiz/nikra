import {
  Controller,
  Post,
  Get,
  Body,
  Param,
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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../common/decorators/public.decorator';

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

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description: 'Envía un email con un link para restablecer la contraseña',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Si el email existe, se enviará un correo con instrucciones',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email inválido',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Get('validate-reset-token/:token')
  @Public()
  @ApiOperation({
    summary: 'Validar token de recuperación',
    description: 'Verifica si un token de recuperación es válido y no ha expirado',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido o inválido',
      schema: {
        type: 'object',
        properties: {
          valid: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
  })
  async validateResetToken(@Param('token') token: string): Promise<{ valid: boolean; message?: string }> {
    return this.authService.validateResetToken(token);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña usando el token de recuperación',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Contraseña restablecida exitosamente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, expirado o contraseña inválida',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }
}

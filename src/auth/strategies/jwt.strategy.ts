import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('jwt.secret');
    console.log('🔐 JWT Strategy - Secret configurado:', secret ? '✅ Presente' : '❌ Ausente');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    try {
      // Verificar que el payload tenga la estructura esperada
      if (!payload.sub) {
        throw new UnauthorizedException('Token inválido: payload malformado');
      }

      const user = await this.authService.findUserById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      if (!user.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // Consolidar permisos de todos los roles del usuario
      const permissions: string[] = [];
      if (user.roles) {
        for (const role of user.roles) {
          if (role.permissions) {
            for (const perm of role.permissions) {
              if (!permissions.includes(perm.name)) {
                permissions.push(perm.name);
              }
            }
          }
        }
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        roles: user.roles?.map(role => role.name) || [],
        permissions: permissions,
      };
    } catch (error) {
      console.error('JWT Validation Error:', error.message);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}

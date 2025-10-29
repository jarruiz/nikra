import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';
import { getPasswordResetEmailTemplate } from './templates/password-reset.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private oauth2Client: OAuth2Client;
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeOAuthClient();
  }

  /**
   * Inicializa el cliente OAuth2 de Google
   */
  private initializeOAuthClient(): void {
    const emailConfig = this.configService.get('email');
    
    this.oauth2Client = new google.auth.OAuth2(
      emailConfig.gmail.clientId,
      emailConfig.gmail.clientSecret,
      'https://developers.google.com/oauthplayground', // Redirect URI para OAuth playground
    );

    // Configurar refresh token si está disponible
    if (emailConfig.gmail.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: emailConfig.gmail.refreshToken,
      });
    }

    // Verificar configuración
    if (!emailConfig.gmail.clientId || !emailConfig.gmail.clientSecret) {
      this.logger.warn('⚠️ Gmail OAuth credentials no configuradas correctamente');
    }
  }

  /**
   * Obtiene un token de acceso válido usando el refresh token
   */
  private async getAccessToken(): Promise<string> {
    try {
      const { token } = await this.oauth2Client.getAccessToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }
      return token;
    } catch (error) {
      this.logger.error('Error obteniendo access token:', error);
      throw new InternalServerErrorException('Error al autenticar con Gmail');
    }
  }

  /**
   * Configura el transporter de nodemailer con OAuth2
   */
  private async setupTransporter(): Promise<void> {
    const emailConfig = this.configService.get('email');
    
    try {
      const accessToken = await this.getAccessToken();

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: emailConfig.gmail.userEmail,
          clientId: emailConfig.gmail.clientId,
          clientSecret: emailConfig.gmail.clientSecret,
          refreshToken: emailConfig.gmail.refreshToken,
          accessToken: accessToken,
        },
      });

      // Verificar conexión
      await this.transporter.verify();
      this.logger.log('✅ Transporter de email configurado correctamente');
    } catch (error) {
      this.logger.error('Error configurando transporter:', error);
      throw new InternalServerErrorException('Error al configurar el servicio de email');
    }
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName?: string,
  ): Promise<void> {
    const emailConfig = this.configService.get('email');
    const resetUrl = `${emailConfig.frontend.resetUrl}?token=${resetToken}`;

    try {
      // Configurar transporter si no está inicializado
      if (!this.transporter) {
        await this.setupTransporter();
      }

      // Obtener plantilla HTML
      const htmlContent = getPasswordResetEmailTemplate(resetUrl, userName);

      // Configurar opciones del email
      const mailOptions = {
        from: {
          name: 'CCA Ceuta - Soporte',
          address: emailConfig.gmail.userEmail,
        },
        to: to,
        subject: 'Recuperación de Contraseña - CCA Ceuta',
        html: htmlContent,
        text: `Hola ${userName || 'Usuario'},\n\nHas solicitado restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para crear una nueva contraseña:\n${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\n© ${new Date().getFullYear()} Centro Comercial Abierto de Ceuta.`,
      };

      // Enviar email
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email de recuperación enviado a ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}:`, error);
      throw new InternalServerErrorException('Error al enviar el email de recuperación');
    }
  }
}


import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  gmail: {
    clientId: process.env.GMAIL_CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
    userEmail: process.env.GMAIL_USER_EMAIL || 'soporte@ccaceuta.com',
  },
  frontend: {
    resetUrl: process.env.FRONTEND_RESET_URL || '',
  },
  resetToken: {
    expiresIn: parseInt(process.env.RESET_TOKEN_EXPIRES_IN || '3600000', 10), // 1 hora por defecto
  },
}));


export function getPasswordResetEmailTemplate(resetUrl: string, userName?: string): string {
  const name = userName || 'Usuario';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña - CCA Ceuta</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 20px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 20px 20px; text-align: center; background-color: #1a5490; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">CCA Ceuta - Recuperación de Contraseña</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px;">Hola ${name},</h2>
                            
                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Has solicitado restablecer tu contraseña. Haz clic en el botón siguiente para crear una nueva contraseña:
                            </p>
                            
                            <!-- Reset Button -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="text-align: center;">
                                        <a href="${resetUrl}" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #1a5490; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                            Restablecer Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:
                            </p>
                            <p style="margin: 0 0 20px; word-break: break-all; color: #1a5490; font-size: 14px;">
                                ${resetUrl}
                            </p>
                            
                            <!-- Security Warning -->
                            <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad. 
                                    Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá sin cambios.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Si tienes alguna pregunta, no dudes en contactarnos en 
                                <a href="mailto:soporte@ccaceuta.com" style="color: #1a5490; text-decoration: none;">soporte@ccaceuta.com</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6;">
                                Este es un correo automático, por favor no respondas a este mensaje.<br>
                                © ${new Date().getFullYear()} Centro Comercial Abierto de Ceuta. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
}


import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Carga y procesa el template HTML de notificación de participación
 * El archivo HTML se copia automáticamente a dist/ mediante nest-cli.json assets
 */
export function getParticipationNotificationTemplate(
  userName: string,
  numeroTicket: string,
  fechaTicket: string,
  importeTotal: number,
  campaigns: Array<{ nombre: string; importeMinimo: number }>,
  associateName: string,
): string {
  // En desarrollo: usar src/email/templates/
  // En producción: usar dist/email/templates/ (copiado por assets)
  const isProduction = process.env.NODE_ENV === 'production';
  const basePath = isProduction 
    ? join(process.cwd(), 'dist', 'email', 'templates')
    : join(__dirname);
  
  const templatePath = join(basePath, 'participation-notification.template.html');
  
  // Cargar el template HTML
  let htmlTemplate = readFileSync(templatePath, 'utf-8');

  // Generar lista de campañas en HTML
  const campaignsList = campaigns
    .map(c => `• ${c.nombre} (mínimo: ${c.importeMinimo}€)`)
    .join('<br>');

  // Reemplazar placeholders
  htmlTemplate = htmlTemplate.replace(/\{\{userName\}\}/g, escapeHtml(userName));
  htmlTemplate = htmlTemplate.replace(/\{\{numeroTicket\}\}/g, escapeHtml(numeroTicket));
  htmlTemplate = htmlTemplate.replace(/\{\{fechaTicket\}\}/g, escapeHtml(fechaTicket));
  htmlTemplate = htmlTemplate.replace(/\{\{importeTotal\}\}/g, importeTotal.toFixed(2));
  htmlTemplate = htmlTemplate.replace(/\{\{associateName\}\}/g, escapeHtml(associateName));
  htmlTemplate = htmlTemplate.replace(/\{\{campaignsList\}\}/g, campaignsList);
  htmlTemplate = htmlTemplate.replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString());

  return htmlTemplate;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}


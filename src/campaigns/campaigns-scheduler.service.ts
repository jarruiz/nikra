import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { toZonedTime } from 'date-fns-tz';
import { CampaignsService } from './campaigns.service';

@Injectable()
export class CampaignsSchedulerService {
  private readonly logger = new Logger(CampaignsSchedulerService.name);
  private readonly timeZone = 'Europe/Madrid';

  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * Tarea programada que se ejecuta cada hora para actualizar el estado de las campañas
   * basado en sus fechas de inicio y fin en zona horaria de España
   */
  @Cron('0 * * * *') // Ejecutar al inicio de cada hora (minuto 0)
  async updateCampaignsStatus(): Promise<void> {
    try {
      this.logger.log('🔄 Iniciando actualización automática de estado de campañas...');

      // Obtener la fecha/hora actual en zona horaria de España
      const nowUtc = new Date();
      const nowSpain = toZonedTime(nowUtc, this.timeZone);
      
      this.logger.log(`📅 Fecha/hora actual en ${this.timeZone}: ${nowSpain.toISOString()}`);

      // Llamar al método del servicio para actualizar los estados
      const result = await this.campaignsService.updateCampaignStatusByDates();

      if (result.updated > 0) {
        this.logger.log(
          `✅ Actualización completada: ${result.updated} campaña(s) actualizada(s) ` +
          `(${result.activated} activada(s), ${result.deactivated} desactivada(s))`
        );
      } else {
        this.logger.log('ℹ️  No se requirieron actualizaciones. Todas las campañas ya tienen el estado correcto.');
      }
    } catch (error) {
      this.logger.error(
        `❌ Error al actualizar el estado de las campañas: ${error.message}`,
        error.stack
      );
      // No lanzar el error para evitar que detenga el scheduler
    }
  }
}


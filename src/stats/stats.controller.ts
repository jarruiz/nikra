import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @RequirePermissions('participations.read.all', 'participations.manage')
  @ApiOperation({
    summary: 'Obtener estadísticas del dashboard',
    description: `
Obtiene todas las estadísticas necesarias para el dashboard administrativo, incluyendo:
- Métricas globales (tickets, volumen, usuarios) con comparación al periodo anterior
- Series temporales diarias para gráficos (tickets y volumen)
- Estadísticas detalladas por campaña (participaciones, progreso, top comercios, distribución)
- Resumen de campañas (activas, próximas, por expirar)
- Top usuarios (opcional)
- Top comercios (opcional)

Por defecto analiza los últimos 30 días. Se puede personalizar con filtros de fecha, campaña o comercio.
Requiere permisos de administración.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    type: DashboardStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver las estadísticas',
  })
  async getDashboardStats(@Query() query: DashboardQueryDto): Promise<DashboardStatsDto> {
    return this.statsService.getDashboardStats(query);
  }
}

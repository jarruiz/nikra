import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ExportService } from '../export/export.service';
import { ExportQueryDto } from '../export/dto/export-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController {
  constructor(private readonly exportService: ExportService) {}

  @Get('export')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @RequirePermissions('participations.read.all', 'participations.manage')
  @ApiOperation({
    summary: 'Exportar tickets a Excel',
    description: 'Genera y descarga un archivo Excel (.xlsx) con todos los tickets (participaciones) según los filtros aplicados. Acepta los mismos filtros que la tabla de tickets (requiere permisos de administración)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'ID del usuario para filtrar tickets específicos',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'associateId',
    required: false,
    description: 'ID del comercio para filtrar tickets específicos',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'numeroTicket',
    required: false,
    description: 'Filtrar por número de ticket (búsqueda parcial)',
    example: 'T-2025-',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    description: 'Fecha desde para filtrar tickets (formato YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    description: 'Fecha hasta para filtrar tickets (formato YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description: 'attachment; filename="tickets_YYYY-MM-DD.xlsx"',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron tickets con los filtros especificados',
  })
  async exportTickets(
    @Query() filters: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportService.exportParticipationsToExcel(filters);
    
    const filename = `tickets_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    
    res.send(buffer);
  }
}

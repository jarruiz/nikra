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
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ExportService } from './export.service';
import { ExportQueryDto } from './dto/export-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('participations/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOperation({
    summary: 'Exportar participaciones a Excel',
    description: 'Genera y descarga un archivo Excel (.xlsx) con todas las participaciones según los filtros aplicados',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'Content-Disposition': {
        description: 'attachment; filename="participaciones.xlsx"',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron participaciones con los filtros especificados',
  })
  async exportParticipationsToExcel(
    @Query() filters: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.exportService.exportParticipationsToExcel(filters);
    
    const filename = `participaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    
    res.send(buffer);
  }

  @Get('participations/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({
    summary: 'Exportar participaciones a CSV',
    description: 'Genera y descarga un archivo CSV con todas las participaciones según los filtros aplicados',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado exitosamente',
    headers: {
      'Content-Type': {
        description: 'text/csv; charset=utf-8',
      },
      'Content-Disposition': {
        description: 'attachment; filename="participaciones.csv"',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron participaciones con los filtros especificados',
  })
  async exportParticipationsToCSV(
    @Query() filters: ExportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const csvContent = await this.exportService.exportParticipationsToCSV(filters);
    
    const filename = `participaciones_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8').toString());
    
    // Agregar BOM para UTF-8 para compatibilidad con Excel
    const bom = '\ufeff';
    res.send(bom + csvContent);
  }

  @Get('participations/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de exportación',
    description: 'Obtiene estadísticas sobre las participaciones que serán exportadas según los filtros especificados',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalParticipations: {
          type: 'number',
          description: 'Total de participaciones',
          example: 150,
        },
        totalUsers: {
          type: 'number',
          description: 'Total de usuarios únicos',
          example: 75,
        },
        totalAssociates: {
          type: 'number',
          description: 'Total de comercios únicos',
          example: 25,
        },
        dateRange: {
          type: 'object',
          description: 'Rango de fechas de las participaciones',
          properties: {
            desde: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha más antigua',
              example: '2025-01-01T00:00:00.000Z',
            },
            hasta: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha más reciente',
              example: '2025-01-18T23:59:59.999Z',
            },
          },
        },
        totalAmount: {
          type: 'number',
          description: 'Importe total de todas las participaciones',
          example: 3750.25,
        },
      },
    },
  })
  async getExportStats(@Query() filters: ExportQueryDto) {
    return this.exportService.getExportStats(filters);
  }
}

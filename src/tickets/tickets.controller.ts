import {
  Controller,
  Get,
  Query,
  Param,
  Res,
  UseGuards,
  Header,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ExportService } from '../export/export.service';
import { ExportQueryDto } from '../export/dto/export-query.dto';
import { ParticipationsService } from '../participations/participations.service';
import { ParticipationSearchDto } from '../participations/dto/participation-search.dto';
import { ParticipationResponseDto } from '../participations/dto/participation-response.dto';
import { ParticipationsResponseDto } from '../participations/dto/participations-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class TicketsController {
  constructor(
    private readonly exportService: ExportService,
    private readonly participationsService: ParticipationsService,
  ) {}

  @Get()
  @RequirePermissions('participations.read.all', 'participations.manage')
  @ApiOperation({
    summary: 'Listar tickets',
    description: 'Obtiene una lista paginada de todos los tickets (participaciones) con filtros opcionales. Acepta los mismos filtros que la tabla de tickets (requiere permisos de administración)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tickets obtenida exitosamente',
    type: ParticipationsResponseDto,
  })
  async findAll(
    @Query() searchDto: ParticipationSearchDto,
    @Request() req: any,
  ): Promise<ParticipationsResponseDto> {
    const userPermissions: string[] = req.user.permissions || [];
    const canReadAll = userPermissions.includes('participations.read.all') || userPermissions.includes('participations.manage');
    return this.participationsService.findAll(searchDto, req.user.id, canReadAll);
  }

  @Get('me')
  @RequirePermissions('participations.read.own', 'participations.read.all', 'participations.manage')
  @ApiOperation({
    summary: 'Mis tickets',
    description: 'Obtiene todos los tickets (participaciones) del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets del usuario obtenidos exitosamente',
    type: [ParticipationResponseDto],
  })
  async findMyTickets(@Request() req: any): Promise<ParticipationResponseDto[]> {
    return this.participationsService.findByUser(req.user.id, req.user.id);
  }

  @Get('user/:userId')
  @RequirePermissions('participations.read.all', 'participations.manage')
  @ApiOperation({
    summary: 'Tickets por usuario',
    description: 'Obtiene todos los tickets (participaciones) de un usuario específico (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets del usuario obtenidos exitosamente',
    type: [ParticipationResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver los tickets de este usuario',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ): Promise<ParticipationResponseDto[]> {
    const userPermissions: string[] = req.user.permissions || [];
    const canReadAll = userPermissions.includes('participations.read.all') || userPermissions.includes('participations.manage');
    return this.participationsService.findByUser(userId, req.user.id, canReadAll);
  }

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

  @Get(':id')
  @RequirePermissions('participations.read.own', 'participations.read.all', 'participations.manage')
  @ApiOperation({
    summary: 'Obtener ticket por ID',
    description: 'Obtiene los datos de un ticket (participación) específico por su ID. Los usuarios solo pueden ver los suyos propios.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del ticket (participación)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket encontrado exitosamente',
    type: ParticipationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver este ticket',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket no encontrado',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<ParticipationResponseDto> {
    const userPermissions: string[] = req.user.permissions || [];
    const canReadAll = userPermissions.includes('participations.read.all') || userPermissions.includes('participations.manage');
    return this.participationsService.findOne(id, req.user.id, canReadAll);
  }
}

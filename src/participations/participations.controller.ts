import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ParticipationsService } from './participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { ParticipationResponseDto } from './dto/participation-response.dto';
import { ParticipationSearchDto } from './dto/participation-search.dto';
import { ParticipationsResponseDto } from './dto/participations-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('participations')
@Controller('participations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ParticipationsController {
  constructor(private readonly participationsService: ParticipationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva participación',
    description: 'Registra una nueva participación manual con los datos del ticket de compra',
  })
  @ApiResponse({
    status: 201,
    description: 'Participación creada exitosamente',
    type: ParticipationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o fecha/ticket inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Límite de participaciones por día alcanzado',
  })
  @ApiResponse({
    status: 404,
    description: 'Comercio no encontrado o inactivo',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una participación con este número de ticket',
  })
  async create(
    @Body() createParticipationDto: CreateParticipationDto,
    @Request() req: any,
  ): Promise<ParticipationResponseDto> {
    return this.participationsService.create(createParticipationDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar participaciones',
    description: 'Obtiene una lista paginada de participaciones. Los usuarios solo pueden ver las suyas propias.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de participaciones obtenida exitosamente',
    type: ParticipationsResponseDto,
  })
  async findAll(
    @Query() searchDto: ParticipationSearchDto,
    @Request() req: any,
  ): Promise<ParticipationsResponseDto> {
    return this.participationsService.findAll(searchDto, req.user.id);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Mis participaciones',
    description: 'Obtiene todas las participaciones del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Participaciones del usuario obtenidas exitosamente',
    type: [ParticipationResponseDto],
  })
  async findMyParticipations(@Request() req: any): Promise<ParticipationResponseDto[]> {
    return this.participationsService.findByUser(req.user.id, req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Participaciones por usuario',
    description: 'Obtiene todas las participaciones de un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Participaciones del usuario obtenidas exitosamente',
    type: [ParticipationResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver las participaciones de este usuario',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ): Promise<ParticipationResponseDto[]> {
    return this.participationsService.findByUser(userId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener participación por ID',
    description: 'Obtiene los datos de una participación específica por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la participación',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Participación encontrada exitosamente',
    type: ParticipationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver esta participación',
  })
  @ApiResponse({
    status: 404,
    description: 'Participación no encontrada',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<ParticipationResponseDto> {
    return this.participationsService.findOne(id, req.user.id);
  }
}

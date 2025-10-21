import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignSearchDto } from './dto/campaign-search.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { CampaignsResponseDto } from './dto/campaigns-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva campaña',
    description: 'Crea una nueva campaña promocional',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaña creada exitosamente',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una campaña con este nombre',
  })
  async create(@Body() createCampaignDto: CreateCampaignDto): Promise<CampaignResponseDto> {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar campañas',
    description: 'Obtiene una lista paginada de campañas con filtros de búsqueda',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de campañas obtenida exitosamente',
    type: CampaignsResponseDto,
  })
  async findAll(@Query() searchDto: CampaignSearchDto): Promise<CampaignsResponseDto> {
    return this.campaignsService.findAll(searchDto);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Obtener campañas activas',
    description: 'Obtiene solo las campañas que están actualmente activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de campañas activas obtenida exitosamente',
    type: [CampaignResponseDto],
  })
  async findActive(): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findActive();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener campaña por ID',
    description: 'Obtiene los datos de una campaña específica por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaña encontrada exitosamente',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña no encontrada',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CampaignResponseDto> {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar campaña',
    description: 'Actualiza los datos de una campaña específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaña actualizada exitosamente',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una campaña con este nombre',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Cambiar estado de campaña',
    description: 'Activa o desactiva una campaña específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'isActive',
    description: 'Estado activo de la campaña',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de campaña actualizado exitosamente',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña no encontrada',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isActive', ParseBoolPipe) isActive: boolean,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.updateStatus(id, isActive);
  }

  @Post(':id/clone')
  @ApiOperation({
    summary: 'Clonar campaña',
    description: 'Crea una copia de una campaña existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña a clonar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Campaña clonada exitosamente',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña original no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una campaña con este nombre',
  })
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('nombre') newName?: string,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.clone(id, newName);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar campaña',
    description: 'Realiza un soft delete de la campaña (la marca como inactiva)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Campaña eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña no encontrada',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.campaignsService.remove(id);
  }
}

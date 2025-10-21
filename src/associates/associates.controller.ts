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
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
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

import { AssociatesService } from './associates.service';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { AssociateResponseDto } from './dto/associate-response.dto';
import { AssociatesResponseDto } from './dto/associates-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('associates')
@Controller('associates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AssociatesController {
  constructor(private readonly associatesService: AssociatesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo comercio adherido',
    description: 'Registra un nuevo comercio adherido al sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Comercio creado exitosamente',
    type: AssociateResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un comercio con este nombre',
  })
  async create(@Body() createAssociateDto: CreateAssociateDto): Promise<AssociateResponseDto> {
    return this.associatesService.create(createAssociateDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar comercios adheridos',
    description: 'Obtiene una lista paginada de comercios adheridos con filtros de búsqueda',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Número de elementos por página',
    example: 100,
    required: false,
  })
  @ApiQuery({
    name: 'nombre',
    description: 'Filtrar por nombre del comercio',
    example: 'Supermercado',
    required: false,
  })
  @ApiQuery({
    name: 'activo',
    description: 'Filtrar por estado activo',
    example: true,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de comercios obtenida exitosamente',
    type: AssociatesResponseDto,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number = 100,
    @Query('nombre') nombre?: string,
    @Query('activo') activo?: string,
  ): Promise<AssociatesResponseDto> {
    const isActive = activo === undefined ? undefined : activo === 'true';
    return this.associatesService.findAll(page, limit, nombre, isActive);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Obtener comercios activos',
    description: 'Obtiene solo los comercios que están actualmente activos (útil para desplegables)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de comercios activos obtenida exitosamente',
    type: [AssociateResponseDto],
  })
  async findActive(): Promise<AssociateResponseDto[]> {
    return this.associatesService.findActive();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener comercio por ID',
    description: 'Obtiene los datos de un comercio específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del comercio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Comercio encontrado exitosamente',
    type: AssociateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comercio no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AssociateResponseDto> {
    return this.associatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar comercio',
    description: 'Actualiza los datos de un comercio específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del comercio a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Comercio actualizado exitosamente',
    type: AssociateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comercio no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un comercio con este nombre',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssociateDto: UpdateAssociateDto,
  ): Promise<AssociateResponseDto> {
    return this.associatesService.update(id, updateAssociateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar comercio',
    description: 'Realiza un soft delete del comercio (lo marca como inactivo)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del comercio a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Comercio eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Comercio no encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.associatesService.remove(id);
  }

  @Patch(':id/logo')
  @ApiOperation({
    summary: 'Actualizar logo del comercio',
    description: 'Actualiza el nombre del archivo de logo de un comercio asociado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del comercio',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Logo actualizado exitosamente',
    type: AssociateResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comercio no encontrado',
  })
  async updateLogo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { filename: string },
  ): Promise<AssociateResponseDto> {
    return this.associatesService.updateLogo(id, body.filename);
  }
}

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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';

import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CampaignSearchDto } from './dto/campaign-search.dto';
import { CampaignResponseDto } from './dto/campaign-response.dto';
import { CampaignsResponseDto } from './dto/campaigns-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadService } from '../upload/upload.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @RequirePermissions('campaigns.create', 'campaigns.manage')
  @ApiOperation({
    summary: 'Crear nueva campaña',
    description: 'Crea una nueva campaña promocional (requiere permisos de administración)',
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
  @RequirePermissions('campaigns.read', 'campaigns.manage')
  @ApiOperation({
    summary: 'Listar campañas',
    description: 'Obtiene una lista paginada de campañas con filtros de búsqueda (requiere permisos de administración)',
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
  @Public()
  @ApiOperation({
    summary: 'Obtener campañas activas',
    description: 'Obtiene solo las campañas que están actualmente activas (público)',
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
  @Public()
  @ApiOperation({
    summary: 'Obtener campaña por ID',
    description: 'Obtiene los datos de una campaña específica por su ID (público)',
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
  @RequirePermissions('campaigns.update', 'campaigns.manage')
  @ApiOperation({
    summary: 'Actualizar campaña',
    description: 'Actualiza los datos de una campaña específica (requiere permisos de administración)',
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
  @RequirePermissions('campaigns.update', 'campaigns.manage')
  @ApiOperation({
    summary: 'Cambiar estado de campaña',
    description: 'Activa o desactiva una campaña específica (requiere permisos de administración)',
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
  @RequirePermissions('campaigns.create', 'campaigns.manage')
  @ApiOperation({
    summary: 'Clonar campaña',
    description: 'Crea una copia de una campaña existente (requiere permisos de administración)',
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
  @RequirePermissions('campaigns.delete', 'campaigns.manage')
  @ApiOperation({
    summary: 'Eliminar campaña',
    description: 'Realiza un soft delete de la campaña (la marca como inactiva) (requiere permisos de administración)',
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

  @Post(':id/legal-bases')
  @RequirePermissions('campaigns.update', 'campaigns.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Solo se permiten archivos PDF'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Subir bases legales de campaña',
    description: 'Sube un archivo PDF con las bases legales de la campaña',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo PDF de bases legales (máximo 10MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Bases legales subidas exitosamente',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o demasiado grande',
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña no encontrada',
  })
  async uploadLegalBases(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CampaignResponseDto> {
    const uploadResult = await this.uploadService.saveFile(file, 'legal-bases');
    return this.campaignsService.update(id, {
      basesLegalesUrl: uploadResult.filename,
    });
  }

  @Get(':id/legal-bases')
  @Public()
  @ApiOperation({
    summary: 'Descargar bases legales de campaña',
    description: 'Obtiene el archivo PDF de las bases legales de la campaña',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la campaña',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo PDF de bases legales',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Campaña no encontrada o sin bases legales',
  })
  async getLegalBases(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const campaign = await this.campaignsService.findOne(id);
    
    if (!campaign.basesLegalesUrl) {
      throw new NotFoundException('La campaña no tiene bases legales asociadas');
    }

    const fileInfo = await this.uploadService.getFileInfo('legal-bases', campaign.basesLegalesUrl);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${campaign.basesLegalesUrl}"`);
    
    const fileStream = createReadStream(fileInfo.path);
    fileStream.pipe(res);
  }
}

import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PermissionsService } from './permissions.service';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('permissions.read', 'permissions.manage')
  @ApiOperation({
    summary: 'Listar todos los permisos',
    description: 'Obtiene una lista de todos los permisos disponibles en el sistema (requiere permisos de administración)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de permisos obtenida exitosamente',
    type: [PermissionResponseDto],
  })
  async findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('permissions.read', 'permissions.manage')
  @ApiOperation({
    summary: 'Obtener permiso por ID',
    description: 'Obtiene los datos de un permiso específico por su ID (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del permiso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Permiso encontrado exitosamente',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permiso no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PermissionResponseDto> {
    return this.permissionsService.findOne(id);
  }
}


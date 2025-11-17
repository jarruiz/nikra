import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('roles.create', 'roles.manage')
  @ApiOperation({
    summary: 'Crear nuevo rol',
    description: 'Crea un nuevo rol en el sistema (requiere permisos de administración)',
  })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un rol con este nombre',
  })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('roles.read', 'roles.manage')
  @ApiOperation({
    summary: 'Listar roles',
    description: 'Obtiene una lista de todos los roles del sistema (requiere permisos de administración)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente',
    type: [RoleResponseDto],
  })
  async findAll(): Promise<RoleResponseDto[]> {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('roles.read', 'roles.manage')
  @ApiOperation({
    summary: 'Obtener rol por ID',
    description: 'Obtiene los datos de un rol específico por su ID (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RoleResponseDto> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('roles.update', 'roles.manage')
  @ApiOperation({
    summary: 'Actualizar rol',
    description: 'Actualiza los datos de un rol específico (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un rol con este nombre',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('roles.delete', 'roles.manage')
  @ApiOperation({
    summary: 'Eliminar rol',
    description: 'Elimina un rol del sistema (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a eliminar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Rol eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar el único rol por defecto',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @RequirePermissions('permissions.manage', 'roles.manage')
  @ApiOperation({
    summary: 'Asignar permisos a un rol',
    description: 'Asigna permisos a un rol específico (reemplaza los permisos existentes) (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos asignados exitosamente',
    type: RoleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Rol o permiso no encontrado',
  })
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.assignPermissions(id, assignPermissionsDto);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('permissions.manage', 'roles.manage')
  @ApiOperation({
    summary: 'Quitar permiso de un rol',
    description: 'Elimina un permiso específico de un rol (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'permissionId',
    description: 'ID único del permiso',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 204,
    description: 'Permiso eliminado del rol exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Rol no encontrado',
  })
  async removePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ): Promise<RoleResponseDto> {
    return this.rolesService.removePermission(id, permissionId);
  }
}


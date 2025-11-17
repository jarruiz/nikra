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
  Request,
  ParseUUIDPipe,
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

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSearchDto } from './dto/user-search.dto';
import { UsersResponseDto } from './dto/users-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserRolesService } from '../roles/user-roles.service';
import { AssignRolesDto } from '../roles/dto/assign-roles.dto';
import { RoleResponseDto } from '../roles/dto/role-response.dto';
import { PermissionResponseDto } from '../roles/dto/permission-response.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Get()
  @RequirePermissions('users.read', 'users.manage')
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene una lista paginada de usuarios con filtros de búsqueda (requiere permisos de administración)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: UsersResponseDto,
  })
  async findAll(@Query() searchDto: UserSearchDto): Promise<UsersResponseDto> {
    return this.usersService.findAll(searchDto);
  }

  @Get('search')
  @RequirePermissions('users.read', 'users.manage')
  @ApiOperation({
    summary: 'Búsqueda avanzada de usuarios',
    description: 'Búsqueda de usuarios por término en nombre, apellidos, email o DNI (requiere permisos de administración)',
  })
  @ApiQuery({
    name: 'q',
    description: 'Término de búsqueda',
    example: 'Juan',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
    type: [UserProfileDto],
  })
  async searchUsers(
    @Query('q') searchTerm: string,
  ): Promise<UserProfileDto[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    return this.usersService.searchUsers(searchTerm.trim());
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Obtiene los datos completos del usuario actualmente autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
    type: UserProfileDto,
  })
  async getProfile(@Request() req: any): Promise<UserProfileDto> {
    return this.usersService.getProfile(req.user.id);
  }

  @Get(':id')
  @RequirePermissions('users.read', 'users.manage')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene los datos de un usuario específico por su ID (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserProfileDto> {
    const user = await this.usersService.findById(id);
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario autenticado',
    description: 'Permite al usuario actualizar sus propios datos personales',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Email o DNI ya registrado por otro usuario',
  })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Patch(':id')
  @RequirePermissions('users.update', 'users.manage')
  @ApiOperation({
    summary: 'Actualizar usuario por ID',
    description: 'Actualiza los datos de un usuario específico (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email o DNI ya registrado por otro usuario',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('users.delete', 'users.manage')
  @ApiOperation({
    summary: 'Desactivar usuario',
    description: 'Realiza un soft delete del usuario (lo marca como inactivo) (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a desactivar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.softDelete(id);
  }

  @Patch('profile/avatar')
  @ApiOperation({
    summary: 'Actualizar avatar del usuario',
    description: 'Actualiza el nombre del archivo de avatar del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar actualizado exitosamente',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async updateAvatar(
    @Request() req: any,
    @Body() body: { filename: string },
  ): Promise<UserProfileDto> {
    return this.usersService.updateAvatar(req.user.id, body.filename);
  }

  @Post(':id/roles')
  @RequirePermissions('roles.manage', 'users.manage')
  @ApiOperation({
    summary: 'Asignar roles a un usuario',
    description: 'Asigna roles a un usuario específico (reemplaza los roles existentes) (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles asignados exitosamente',
    type: [RoleResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o rol no encontrado',
  })
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ): Promise<RoleResponseDto[]> {
    return this.userRolesService.assignRoles(id, assignRolesDto);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('roles.manage', 'users.manage')
  @ApiOperation({
    summary: 'Quitar rol de un usuario',
    description: 'Elimina un rol específico de un usuario (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'roleId',
    description: 'ID único del rol',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 204,
    description: 'Rol eliminado del usuario exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ): Promise<void> {
    return this.userRolesService.removeRole(id, roleId);
  }

  @Get(':id/roles')
  @RequirePermissions('users.read', 'users.manage', 'roles.read')
  @ApiOperation({
    summary: 'Obtener roles de un usuario',
    description: 'Obtiene todos los roles asignados a un usuario específico (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles del usuario obtenidos exitosamente',
    type: [RoleResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserRoles(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RoleResponseDto[]> {
    return this.userRolesService.getUserRoles(id);
  }

  @Get(':id/permissions')
  @RequirePermissions('users.read', 'users.manage', 'permissions.read')
  @ApiOperation({
    summary: 'Obtener permisos de un usuario',
    description: 'Obtiene todos los permisos consolidados de un usuario (de todos sus roles) (requiere permisos de administración)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Permisos del usuario obtenidos exitosamente',
    type: [PermissionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserPermissions(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponseDto[]> {
    return this.userRolesService.getUserPermissions(id);
  }
}

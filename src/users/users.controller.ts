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

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene una lista paginada de usuarios con filtros de búsqueda',
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
  @ApiOperation({
    summary: 'Búsqueda avanzada de usuarios',
    description: 'Búsqueda de usuarios por término en nombre, apellidos, email o DNI',
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
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene los datos de un usuario específico por su ID',
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
  @ApiOperation({
    summary: 'Actualizar usuario por ID',
    description: 'Actualiza los datos de un usuario específico (requiere permisos de administrador)',
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
  @ApiOperation({
    summary: 'Desactivar usuario',
    description: 'Realiza un soft delete del usuario (lo marca como inactivo)',
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
}

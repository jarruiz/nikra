import {
  Controller,
  Post,
  Get,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { promises as fs } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService, UploadResult } from './upload.service';
import { ApiFileUpload } from '../common/decorators/file-upload.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiPublicOperation } from '../common/decorators/swagger-public.decorator';

@ApiTags('🖼️ File Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @ApiFileUpload('Avatar del usuario (JPG, PNG, WebP - máximo 5MB)')
  @ApiOperation({
    summary: 'Subir avatar de usuario',
    description: 'Sube una imagen de avatar para el usuario autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Nombre del archivo generado' },
        originalName: { type: 'string', description: 'Nombre original del archivo' },
        mimetype: { type: 'string', description: 'Tipo MIME del archivo' },
        size: { type: 'number', description: 'Tamaño del archivo en bytes' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o demasiado grande',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadService.saveFile(file, 'avatars');
  }

  @Post('campaign')
  @ApiFileUpload('Cartel de campaña (JPG, PNG, WebP - máximo 5MB)')
  @ApiOperation({
    summary: 'Subir cartel de campaña',
    description: 'Sube una imagen de cartel para una campaña',
  })
  @ApiResponse({
    status: 201,
    description: 'Cartel subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Nombre del archivo generado' },
        originalName: { type: 'string', description: 'Nombre original del archivo' },
        mimetype: { type: 'string', description: 'Tipo MIME del archivo' },
        size: { type: 'number', description: 'Tamaño del archivo en bytes' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o demasiado grande',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async uploadCampaign(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadService.saveFile(file, 'campaigns');
  }

  @Post('associate')
  @ApiFileUpload('Logo de comercio asociado (JPG, PNG, WebP, SVG - máximo 5MB)')
  @ApiOperation({
    summary: 'Subir logo de comercio asociado',
    description: 'Sube una imagen de logo para un comercio asociado',
  })
  @ApiResponse({
    status: 201,
    description: 'Logo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Nombre del archivo generado' },
        originalName: { type: 'string', description: 'Nombre original del archivo' },
        mimetype: { type: 'string', description: 'Tipo MIME del archivo' },
        size: { type: 'number', description: 'Tamaño del archivo en bytes' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo inválido o demasiado grande',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async uploadAssociate(@UploadedFile() file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadService.saveFile(file, 'associates');
  }

  @Get('avatar/:filename')
  @Public()
  @ApiPublicOperation(
    'Obtener imagen de avatar',
    'Sirve una imagen de avatar por nombre de archivo'
  )
  @ApiParam({
    name: 'filename',
    description: 'Nombre del archivo de avatar',
    example: '1642123456789-abc123-avatar.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen de avatar',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado',
  })
  async getAvatar(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    await this.serveImage(res, 'avatars', filename);
  }

  @Get('campaign/:filename')
  @Public()
  @ApiPublicOperation(
    'Obtener cartel de campaña',
    'Sirve una imagen de cartel por nombre de archivo'
  )
  @ApiParam({
    name: 'filename',
    description: 'Nombre del archivo de cartel',
    example: '1642123456789-abc123-cartel.png',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen de cartel',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado',
  })
  async getCampaign(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    await this.serveImage(res, 'campaigns', filename);
  }

  @Get('associate/:filename')
  @Public()
  @ApiPublicOperation(
    'Obtener logo de comercio',
    'Sirve una imagen de logo por nombre de archivo'
  )
  @ApiParam({
    name: 'filename',
    description: 'Nombre del archivo de logo',
    example: '1642123456789-abc123-logo.svg',
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen de logo',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
      'image/svg+xml': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Archivo no encontrado',
  })
  async getAssociate(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    await this.serveImage(res, 'associates', filename);
  }

  private async serveImage(
    res: Response,
    type: 'avatars' | 'campaigns' | 'associates',
    filename: string,
  ): Promise<void> {
    try {
      const fileInfo = await this.uploadService.getFileInfo(type, filename);
      const fileBuffer = await fs.readFile(fileInfo.path);
      
      res.setHeader('Content-Type', fileInfo.mimetype);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error interno del servidor' });
      }
    }
  }

  @Delete('avatar/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar avatar',
    description: 'Elimina un archivo de avatar por nombre',
  })
  @ApiResponse({
    status: 204,
    description: 'Avatar eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async deleteAvatar(@Param('filename') filename: string): Promise<void> {
    return this.uploadService.deleteFile('avatars', filename);
  }

  @Delete('campaign/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar cartel de campaña',
    description: 'Elimina un archivo de cartel por nombre',
  })
  @ApiResponse({
    status: 204,
    description: 'Cartel eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async deleteCampaign(@Param('filename') filename: string): Promise<void> {
    return this.uploadService.deleteFile('campaigns', filename);
  }

  @Delete('associate/:filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar logo de comercio',
    description: 'Elimina un archivo de logo por nombre',
  })
  @ApiResponse({
    status: 204,
    description: 'Logo eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async deleteAssociate(@Param('filename') filename: string): Promise<void> {
    return this.uploadService.deleteFile('associates', filename);
  }
}

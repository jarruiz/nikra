import {
  Controller,
  Post,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService, UploadResult, BatchUploadResult } from './upload.service';
import { ApiFileUpload } from '../common/decorators/file-upload.decorator';

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

  // Los endpoints GET de imágenes se han movido a upload-public.controller.ts
  // para que aparezcan como públicos en Swagger (sin autenticación)

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

  // ==============================================
  // 📦 ENDPOINTS DE CARGA EN LOTE
  // ==============================================

  @Post('batch/campaigns')
  @UseInterceptors(FilesInterceptor('files', 10, {
    fileFilter: (req, file, callback) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Solo se permiten archivos JPG, PNG y WebP'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB por archivo
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Archivos de carteles (máximo 10)',
        },
      },
      required: ['files'],
    },
  })
  @ApiOperation({
    summary: 'Subir múltiples carteles de campaña',
    description: 'Sube múltiples archivos de carteles de una vez (máximo 10 archivos)',
  })
  @ApiResponse({
    status: 201,
    description: 'Carteles subidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        successful: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              originalName: { type: 'string' },
              mimetype: { type: 'string' },
              size: { type: 'number' },
            },
          },
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalName: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
        totalFiles: { type: 'number' },
        successCount: { type: 'number' },
        failureCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la validación de archivos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async uploadBatchCampaigns(@UploadedFiles() files: Express.Multer.File[]): Promise<BatchUploadResult> {
    return this.uploadService.saveFiles(files, 'campaigns');
  }

  @Post('batch/associates')
  @UseInterceptors(FilesInterceptor('files', 10, {
    fileFilter: (req, file, callback) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Solo se permiten archivos JPG, PNG, WebP y SVG'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB por archivo
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Archivos de logos (máximo 10)',
        },
      },
      required: ['files'],
    },
  })
  @ApiOperation({
    summary: 'Subir múltiples logos de comercios',
    description: 'Sube múltiples archivos de logos de comercios de una vez (máximo 10 archivos)',
  })
  @ApiResponse({
    status: 201,
    description: 'Logos subidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        successful: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              originalName: { type: 'string' },
              mimetype: { type: 'string' },
              size: { type: 'number' },
            },
          },
        },
        failed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalName: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
        totalFiles: { type: 'number' },
        successCount: { type: 'number' },
        failureCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la validación de archivos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async uploadBatchAssociates(@UploadedFiles() files: Express.Multer.File[]): Promise<BatchUploadResult> {
    return this.uploadService.saveFiles(files, 'associates');
  }
}

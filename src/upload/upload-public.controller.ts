import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { promises as fs } from 'fs';
import { UploadService } from './upload.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('🖼️ Imágenes Públicas')
@Controller('upload')
export class UploadPublicController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('avatar/:filename')
  @Public()
  @ApiOperation({
    summary: 'Obtener imagen de avatar',
    description: 'Endpoint público - Sirve una imagen de avatar por nombre de archivo (no requiere autenticación)',
  })
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
  @ApiOperation({
    summary: 'Obtener cartel de campaña',
    description: 'Endpoint público - Sirve una imagen de cartel por nombre de archivo (no requiere autenticación)',
  })
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
  @ApiOperation({
    summary: 'Obtener logo de comercio',
    description: 'Endpoint público - Sirve una imagen de logo por nombre de archivo (no requiere autenticación)',
  })
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
}


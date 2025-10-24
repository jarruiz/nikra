import {
  applyDecorators,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileValidationInterceptor } from '../interceptors/file-validation.interceptor';

export function ApiFileUpload(description: string = 'Archivo a subir') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor('file', {
        limits: {
          fileSize: 2 * 1024 * 1024, // 2MB
        },
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.startsWith('image/')) {
            return callback(
              new BadRequestException('Solo se permiten archivos de imagen'),
              false,
            );
          }
          callback(null, true);
        },
      }),
      FileValidationInterceptor,
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description,
          },
        },
        required: ['file'],
      },
    }),
  );
}

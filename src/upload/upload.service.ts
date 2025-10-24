import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { extname } from 'path';

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

export interface BatchUploadResult {
  successful: UploadResult[];
  failed: Array<{
    originalName: string;
    error: string;
  }>;
  totalFiles: number;
  successCount: number;
  failureCount: number;
}

export interface FileInfo {
  path: string;
  mimetype: string;
}

@Injectable()
export class UploadService {
  private readonly uploadBasePath: string;

  constructor(private configService: ConfigService) {
    // En producción (Render), usar el disco persistente montado en /app/uploads
    // En desarrollo, usar la carpeta uploads local
    this.uploadBasePath = process.env.NODE_ENV === 'production' 
      ? '/app/uploads' 
      : 'uploads';
    
    console.log(`📁 UploadService: Ruta base configurada como: ${this.uploadBasePath}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  }

  async saveFile(
    file: Express.Multer.File,
    subfolder: 'avatars' | 'campaigns' | 'associates',
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validar tipo de archivo
    this.validateFileType(file, subfolder);

    // Validar tamaño del archivo
    this.validateFileSize(file);

    // Generar nombre único para el archivo
    const fileName = this.generateUniqueFileName(file.originalname);
    const filePath = path.join(this.uploadBasePath, subfolder, fileName);

    console.log(`💾 Guardando archivo en: ${filePath}`);

    // Asegurar que el directorio existe
    await this.ensureDirectoryExists(path.join(this.uploadBasePath, subfolder));

    // Guardar el archivo
    await fs.writeFile(filePath, file.buffer);
    
    console.log(`✅ Archivo guardado exitosamente: ${fileName}`);

    return {
      filename: fileName,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  /**
   * Guardar múltiples archivos en lote
   */
  async saveFiles(
    files: Express.Multer.File[],
    subfolder: 'avatars' | 'campaigns' | 'associates',
  ): Promise<BatchUploadResult> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (files.length > 25) {
      throw new BadRequestException('Maximum 25 files allowed per batch');
    }

    const successful: UploadResult[] = [];
    const failed: Array<{ originalName: string; error: string }> = [];

    console.log(`📦 Procesando lote de ${files.length} archivos para ${subfolder}`);

    for (const file of files) {
      try {
        const result = await this.saveFile(file, subfolder);
        successful.push(result);
        console.log(`✅ Archivo procesado: ${file.originalname} -> ${result.filename}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({
          originalName: file.originalname,
          error: errorMessage,
        });
        console.log(`❌ Error procesando ${file.originalname}: ${errorMessage}`);
      }
    }

    const result: BatchUploadResult = {
      successful,
      failed,
      totalFiles: files.length,
      successCount: successful.length,
      failureCount: failed.length,
    };

    console.log(`📊 Resultado del lote: ${result.successCount}/${result.totalFiles} exitosos`);
    
    return result;
  }

  /**
   * Obtener información de un archivo para servirlo
   */
  async getFileInfo(
    subfolder: 'avatars' | 'campaigns' | 'associates',
    filename: string,
  ): Promise<FileInfo> {
    const filePath = path.join(this.uploadBasePath, subfolder, filename);
    
    console.log(`🔍 Buscando archivo en: ${filePath}`);
    
    try {
      await fs.access(filePath);
      
      // Obtener el tipo MIME basado en la extensión
      const mimetype = this.getMimeTypeFromExtension(path.extname(filename));
      
      console.log(`✅ Archivo encontrado: ${filename}`);
      
      return {
        path: filePath,
        mimetype,
      };
    } catch (error) {
      console.log(`❌ Archivo no encontrado: ${filename} en ${filePath}`);
      throw new NotFoundException(`Archivo no encontrado: ${filename}`);
    }
  }

  async deleteFile(subfolder: string, filename: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadBasePath, subfolder, filename);
      await fs.unlink(filePath);
    } catch (error) {
      // Si el archivo no existe, no es un error crítico
      console.warn(`Could not delete file: ${filename}`);
    }
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  private validateFileType(
    file: Express.Multer.File,
    subfolder: 'avatars' | 'campaigns' | 'associates',
  ): void {
    const allowedTypes = {
      avatars: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      campaigns: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      associates: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
    };

    const allowedExtensions = {
      avatars: ['.jpg', '.jpeg', '.png', '.webp'],
      campaigns: ['.jpg', '.jpeg', '.png', '.webp'],
      associates: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    };

    const fileExtension = extname(file.originalname).toLowerCase();

    if (!allowedTypes[subfolder].includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes[subfolder].join(', ')}`,
      );
    }

    if (!allowedExtensions[subfolder].includes(fileExtension)) {
      throw new BadRequestException(
        `Extensión de archivo no permitida. Extensiones permitidas: ${allowedExtensions[subfolder].join(', ')}`,
      );
    }
  }

  private validateFileSize(file: Express.Multer.File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo permitido: 5MB`,
      );
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = extname(originalName);
    const baseName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${timestamp}-${randomString}-${baseName}${extension}`;
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

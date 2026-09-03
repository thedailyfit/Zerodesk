import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Query, BadRequestException, UseGuards, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'text/plain',
  'text/csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@ApiTags('Storage')
@Controller('storage')
@UseGuards(AuthGuard, TenantGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file directly to R2 (for small files)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          default: 'uploads',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: MAX_FILE_SIZE },
  }))
  async uploadFile(
    @TenantId() tenantId: string,
    @UploadedFile() file: any,
    @Body('folder') folder = 'uploads',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not permitted.`);
    }

    return this.storageService.uploadFile(
      tenantId,
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
    );
  }

  @Get('presigned-upload-url')
  @ApiOperation({ summary: 'Get a presigned URL to upload a file directly from the frontend to R2 (for large files)' })
  async getPresignedUploadUrl(
    @TenantId() tenantId: string,
    @Query('fileName') fileName: string,
    @Query('mimeType') mimeType: string,
    @Query('folder') folder = 'uploads',
  ) {
    if (!fileName || !mimeType) {
      throw new BadRequestException('fileName and mimeType query parameters are required');
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(`Mime type ${mimeType} is not permitted for upload.`);
    }

    return this.storageService.getPresignedUploadUrl(tenantId, fileName, mimeType, folder);
  }

  @Get('presigned-download-url')
  @ApiOperation({ summary: 'Get a temporary presigned URL to download/view a private file' })
  async getPresignedDownloadUrl(
    @TenantId() tenantId: string,
    @Query('key') key: string,
  ) {
    if (!key) {
      throw new BadRequestException('key query parameter is required');
    }

    if (!key.startsWith(`tenants/${tenantId}/`)) {
      throw new ForbiddenException('Access denied: You do not have permission to access this file.');
    }

    const url = await this.storageService.getPresignedDownloadUrl(tenantId, key);
    return { url };
  }
}

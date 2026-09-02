import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Storage')
@Controller('storage')
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any, @Body('folder') folder?: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
    );
  }

  @Get('presigned-upload-url')
  @ApiOperation({ summary: 'Get a presigned URL to upload a file directly from the frontend to R2 (for large files)' })
  async getPresignedUploadUrl(
    @Query('fileName') fileName: string,
    @Query('mimeType') mimeType: string,
    @Query('folder') folder?: string,
  ) {
    if (!fileName || !mimeType) {
      throw new BadRequestException('fileName and mimeType query parameters are required');
    }

    return this.storageService.getPresignedUploadUrl(fileName, mimeType, folder);
  }

  @Get('presigned-download-url')
  @ApiOperation({ summary: 'Get a temporary presigned URL to download/view a private file' })
  async getPresignedDownloadUrl(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('key query parameter is required');
    }

    const url = await this.storageService.getPresignedDownloadUrl(key);
    return { url };
  }
}

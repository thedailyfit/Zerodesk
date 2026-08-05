import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'zerodesk-uploads';

    const endpoint = process.env.R2_ENDPOINT || 'https://ffc82a5fa92c88a28f42b3557b33c1a6.r2.cloudflarestorage.com';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';

    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      this.logger.warn('Cloudflare R2 credentials are not fully configured in environment variables.');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private generateUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName);
    return `${uuidv4()}${ext}`;
  }

  async uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string, folder = 'uploads'): Promise<{ key: string; url: string }> {
    try {
      const fileName = this.generateUniqueFileName(originalName);
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully uploaded file to R2: ${key}`);

      return {
        key,
        url: `${process.env.R2_ENDPOINT}/${this.bucketName}/${key}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to upload file to R2: ${error?.message || error}`, error?.stack);
      throw new InternalServerErrorException('Failed to upload file to storage.');
    }
  }

  async getPresignedUploadUrl(originalName: string, mimeType: string, folder = 'uploads'): Promise<{ uploadUrl: string; key: string }> {
    try {
      const fileName = this.generateUniqueFileName(originalName);
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      return { uploadUrl, key };
    } catch (error: any) {
      this.logger.error(`Failed to generate presigned URL: ${error?.message || error}`, error?.stack);
      throw new InternalServerErrorException('Failed to generate upload URL.');
    }
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error: any) {
      this.logger.error(`Failed to generate presigned download URL for key ${key}: ${error?.message || error}`, error?.stack);
      throw new InternalServerErrorException('Failed to generate download URL.');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file from R2: ${key}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete file from R2 (key: ${key}): ${error?.message || error}`, error?.stack);
      throw new InternalServerErrorException('Failed to delete file from storage.');
    }
  }
}

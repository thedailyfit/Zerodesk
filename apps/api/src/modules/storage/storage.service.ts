import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {}

  async uploadFile(file: any, path: string) {
    this.logger.log(`Uploading file to ${path}`);
    return { url: `https://storage.zerodesk.ai/${path}` };
  }

  async downloadFile(path: string) {
    return { stream: null };
  }
}

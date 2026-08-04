import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async handleMessage(data: any) {
    // Process message and return response
    return { status: 'received', message: data.content };
  }

  async getWidgetConfig(tenantId: string) {
    return { tenantId, theme: 'light' };
  }
}

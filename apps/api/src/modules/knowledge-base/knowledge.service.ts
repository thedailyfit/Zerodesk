import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.knowledgeDocument.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.knowledgeDocument.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async uploadDocument(tenantId: string, data: any) {
    // Stub implementation for document upload
    return this.create(tenantId, data);
  }
}

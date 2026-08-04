import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: { customer: true, stage: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.lead.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async moveStage(tenantId: string, id: string, stageId: string) {
    return this.prisma.lead.update({
      where: { id, tenantId },
      data: { stageId },
    });
  }

  async calculateScore(tenantId: string, id: string) {
    // Scoring logic stub
    return 100;
  }
}

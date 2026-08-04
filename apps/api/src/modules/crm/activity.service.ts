import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(tenantId: string, type: string, content: string, references: any = {}) {
    return this.prisma.activity.create({
      data: {
        tenantId,
        type,
        content,
        leadId: references.leadId,
        customerId: references.customerId,
        userId: references.userId,
      },
    });
  }
}

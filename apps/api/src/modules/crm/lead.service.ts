import { Injectable, NotFoundException } from '@nestjs/common';
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
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        customer: {
          include: {
            appointments: { where: { status: { not: 'CANCELLED' } } },
            conversations: true,
          },
        },
        activities: true,
        tasks: true,
        stage: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead ${id} not found`);
    }

    if (lead.wonAt) {
      await this.prisma.lead.update({ where: { id }, data: { score: 100 } });
      return { score: 100, rationale: 'Deal marked as won' };
    }
    if (lead.lostAt) {
      await this.prisma.lead.update({ where: { id }, data: { score: 0 } });
      return { score: 0, rationale: 'Deal marked as lost' };
    }

    let score = 20; // Base baseline score

    // Treatment value factor
    const val = lead.value ? Number(lead.value) : 0;
    if (val >= 10000) score += 25;
    else if (val >= 3000) score += 15;
    else if (val > 0) score += 10;

    // Engagement: Booked appointment indicates high purchase intent
    if (lead.customer?.appointments && lead.customer.appointments.length > 0) {
      score += 30;
    }

    // Communication: Inbound inquiries via Voice or WhatsApp
    if (lead.customer?.conversations && lead.customer.conversations.length > 0) {
      score += 15;
    }

    // Activities logged
    if (lead.activities && lead.activities.length >= 2) {
      score += 10;
    }

    // Stage progression bonus
    const stageName = (lead.stage?.name || '').toLowerCase();
    if (stageName.includes('consult') || stageName.includes('visit') || stageName.includes('proposal')) {
      score += 15;
    }

    const finalScore = Math.min(99, Math.max(5, score));
    await this.prisma.lead.update({
      where: { id },
      data: { score: finalScore },
    });

    return { score: finalScore, leadId: id };
  }
}

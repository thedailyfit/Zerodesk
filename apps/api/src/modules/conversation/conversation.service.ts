import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, status?: string) {
    const where: any = { tenantId };
    if (status) {
      where.status = status.toUpperCase();
    }
    return this.prisma.conversation.findMany({
      where,
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id, tenantId },
      include: { customer: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async getMessages(tenantId: string, id: string) {
    return this.prisma.message.findMany({
      where: { conversationId: id, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(tenantId: string, customerId: string, channel: string) {
    return this.prisma.conversation.create({
      data: {
        tenantId,
        customerId,
        channel,
      },
    });
  }

  async transfer(tenantId: string, id: string, agentId: string) {
    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: { status: 'TRANSFERRED', metadata: { transferredTo: agentId } },
    });
  }

  async close(tenantId: string, id: string, summary: string) {
    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: { status: 'CLOSED', endedAt: new Date(), aiSummary: summary },
    });
  }

  async update(tenantId: string, id: string, data: { status?: string; aiSummary?: string; sentiment?: string; resolution?: string; metadata?: any }) {
    const allowed: any = {};
    if (data.status !== undefined) {
      allowed.status = String(data.status).toUpperCase();
      if (allowed.status === 'CLOSED') {
        allowed.endedAt = new Date();
      }
    }
    if (data.aiSummary !== undefined) allowed.aiSummary = data.aiSummary;
    if (data.sentiment !== undefined) allowed.sentiment = data.sentiment;
    if (data.resolution !== undefined) allowed.resolution = data.resolution;
    if (data.metadata !== undefined) allowed.metadata = data.metadata;

    return this.prisma.conversation.update({
      where: { id, tenantId },
      data: allowed,
    });
  }
}

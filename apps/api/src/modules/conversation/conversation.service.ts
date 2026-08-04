import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.conversation.findMany({
      where: { tenantId },
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
}

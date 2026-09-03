import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AiService } from '../ai/ai.service';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappAiListener {
  private readonly logger = new Logger(WhatsappAiListener.name);

  constructor(
    private readonly aiService: AiService,
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('whatsapp.message.received')
  async handleIncomingWhatsAppMessage(payload: {
    tenantId: string;
    customerId: string;
    conversationId: string;
    message: string;
    messageType: string;
    from: string;
  }) {
    // Only process text messages with actual content
    if (!payload.message || payload.messageType !== 'text') {
      return;
    }

    try {
      const { tenantId, customerId, conversationId, message, from } = payload;

      // 1. Check conversation state (skip auto-reply if human agent has taken over)
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation || conversation.status === 'CLOSED') {
        return;
      }

      const meta = (conversation.metadata as any) || {};
      if (meta.assignedTo || conversation.status === 'HANDOFF' || conversation.status === 'WAITING') {
        this.logger.log(`Conversation ${conversationId} in human handoff/assigned mode. Skipping AI auto-reply.`);
        return;
      }

      // 2. Check quota availability
      const subscription = await this.prisma.subscription.findUnique({
        where: { tenantId },
      });

      if (subscription && subscription.whatsappMessagesUsed >= subscription.whatsappMessagesLimit) {
        this.logger.warn(`Tenant ${tenantId} WhatsApp quota exhausted (${subscription.whatsappMessagesUsed}/${subscription.whatsappMessagesLimit}). Skipping AI reply.`);
        return;
      }

      // 3. Generate AI response with RAG context
      const aiResult = await this.aiService.generateResponse(
        tenantId,
        customerId,
        message,
        'WHATSAPP',
        conversationId,
      );

      if (!aiResult?.response) {
        return;
      }

      // 4. Send AI reply back to WhatsApp user
      await this.whatsappService.sendMessage(tenantId, from, aiResult.response);
      this.logger.log(`Auto-replied to WhatsApp user ${from} for tenant ${tenantId}`);

      // 5. Handle human escalation if requested or low confidence
      if (aiResult.shouldTransfer || aiResult.confidence < 0.6) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { status: 'WAITING' },
        });
        this.logger.log(`Conversation ${conversationId} flagged for human escalation`);
      }
    } catch (error: any) {
      this.logger.error(`Error in WhatsApp AI auto-reply: ${error?.message || error}`, error?.stack);
    }
  }
}

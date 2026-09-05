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
    messageId?: string;
    message: string;
    messageType: string;
    mediaUrl?: string;
    from: string;
    phoneNumberId?: string;
    accessToken?: string;
  }) {
    try {
      const { tenantId, customerId, conversationId, messageId, message, messageType, mediaUrl, from, accessToken } = payload;
      let effectiveMessage = message;

      // Handle WhatsApp Voice Notes (audio/ogg)
      if (messageType === 'audio' && mediaUrl && accessToken) {
        this.logger.log(`Processing WhatsApp voice note for tenant ${tenantId} from ${from} (Media ID: ${mediaUrl})`);
        try {
          const media = await this.whatsappService.downloadMedia(mediaUrl, accessToken);
          const transcription = await this.aiService.transcribeAudio(media.buffer, media.mimeType);

          if (transcription) {
            this.logger.log(`Transcribed WhatsApp voice note: "${transcription}"`);
            effectiveMessage = transcription;

            // Update stored message with transcript
            if (messageId) {
              await this.prisma.message.update({
                where: { id: messageId },
                data: {
                  content: `[Voice Note]: "${transcription}"`,
                },
              });
            }
          } else {
            this.logger.warn(`Could not transcribe voice note for media ${mediaUrl}`);
            return;
          }
        } catch (mediaErr: any) {
          this.logger.error(`Failed to download/transcribe WhatsApp voice note: ${mediaErr.message}`);
          return;
        }
      } else if (messageType !== 'text' || !effectiveMessage) {
        // Skip unsupported non-text media types (e.g. raw stickers/locations)
        return;
      }

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
        effectiveMessage,
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

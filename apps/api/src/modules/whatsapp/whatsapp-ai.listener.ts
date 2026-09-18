import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AiService } from '../ai/ai.service';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptGuardService } from '../../common/security/prompt-guard.service';
import { AppointmentService } from '../appointment/appointment.service';

@Injectable()
export class WhatsappAiListener {
  private readonly logger = new Logger(WhatsappAiListener.name);

  constructor(
    private readonly aiService: AiService,
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
    private readonly promptGuard: PromptGuardService,
    @Inject(forwardRef(() => AppointmentService))
    private readonly appointmentService: AppointmentService,
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
            const { sanitized, isInjected } = this.promptGuard.sanitizeUserInput(transcription);
            if (isInjected) {
              this.logger.warn(`[SECURITY ALERT] Audio note prompt injection detected for tenant ${tenantId} from ${from}: "${transcription}"`);
            }
            effectiveMessage = sanitized;

            // Update stored message with sanitized transcript
            if (messageId) {
              await this.prisma.message.update({
                where: { id: messageId },
                data: {
                  content: `[Voice Note]: "${sanitized}"`,
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

      let replyText = aiResult.response;

      // 4. Real execution of AI booking action
      const bookAction = aiResult.actions?.find((a) => a.type === 'BOOK_APPOINTMENT');
      if (bookAction && bookAction.params) {
        try {
          const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
          const bookingResult = await this.appointmentService.bookFromVoice(tenantId, {
            customerName: customer?.name || 'WhatsApp Patient',
            customerPhone: from,
            serviceName: bookAction.params.serviceName || bookAction.params.service,
            doctorName: bookAction.params.doctorName || bookAction.params.doctor,
            date: bookAction.params.date,
            time: bookAction.params.time,
            dateTime: bookAction.params.dateTime,
            source: 'WHATSAPP',
            notes: `Booked autonomously via WhatsApp AI: "${effectiveMessage}"`,
          });

          if (bookingResult && bookingResult.id) {
            this.logger.log(`Successfully executed appointment ${bookingResult.id} from WhatsApp for customer ${customerId}`);
            if (!replyText.toLowerCase().includes('booking ref') && !replyText.toLowerCase().includes('reference')) {
              replyText += `\n\n✅ *Appointment Confirmed!*` +
                `\n📅 *Slot:* ${bookingResult.date || 'Scheduled Date'} at ${bookingResult.time || 'Scheduled Time'}` +
                `\n🆔 *Booking Ref:* ${bookingResult.id.slice(0, 8).toUpperCase()}`;
            }
          }
        } catch (bookingError) {
          this.logger.error(`Failed to execute appointment booking from WhatsApp AI: ${bookingError}`, (bookingError as Error).stack);
        }
      }

      // 5. Send AI reply back to WhatsApp user
      await this.whatsappService.sendMessage(tenantId, from, replyText);
      this.logger.log(`Auto-replied to WhatsApp user ${from} for tenant ${tenantId}`);

      // 6. Handle human escalation if requested or low confidence
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

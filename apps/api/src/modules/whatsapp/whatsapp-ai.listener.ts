import { Injectable, Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AiService } from '../ai/ai.service';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptGuardService } from '../../common/security/prompt-guard.service';
import { AppointmentService } from '../appointment/appointment.service';
import { ObservabilityService } from '../observability/observability.service';
import { GovernanceService } from '../governance/governance.service';
import { ActionPolicyGuard } from '../../common/guards/action-policy.guard';
import { MemoryQuarantineService } from '../../common/security/memory-quarantine.service';
import { TypeSafeService } from '../typesafe/typesafe.service';

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
    @Optional()
    private readonly observability?: ObservabilityService,
    @Optional()
    private readonly governance?: GovernanceService,
    @Optional()
    private readonly actionPolicy?: ActionPolicyGuard,
    @Optional()
    private readonly memoryQuarantine?: MemoryQuarantineService,
    @Optional()
    private readonly typeSafeService?: TypeSafeService,
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

      // TRAI DND Compliance: Immediate statutory opt-out check BEFORE any conversation or handoff gating
      const normalizedMsg = (effectiveMessage || '').trim().toUpperCase();
      const isExplicitDnd = ['STOP', 'OPT OUT', 'UNSUBSCRIBE', 'STOP PROMO', 'DND'].includes(normalizedMsg);

      if (isExplicitDnd) {
        if (customerId) {
          await this.prisma.customer.update({
            where: { id: customerId },
            data: { dndStatus: true, optedOutAt: new Date() },
          });
        }
        await this.whatsappService.sendMessage(
          tenantId,
          from,
          'You have been unsubscribed from automated notifications in compliance with TRAI regulations. Reply "START" at any time to resume communication.',
        );
        this.logger.log(`Customer ${customerId} opted out of WhatsApp notifications (TRAI statutory DND enabled).`);
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

      // 1b. Fast-Pass Front-Door Screening via TypeSafe Jev (70ms)
      let dndTriggered = false;
      let fastTrackHandoff = false;
      let handoffReason = '';

      if (this.typeSafeService) {
        try {
          const triage = await this.typeSafeService.triageWhatsAppMessage(effectiveMessage, '', 150);
          if (triage) {
            if (triage.isDndOptOut) {
              dndTriggered = true;
            }
            if (triage.requiresHuman || triage.urgencyScore >= 1.8 || triage.sentimentScore >= 1.8) {
              fastTrackHandoff = true;
              handoffReason = `TypeSafe Jev: high urgency (${triage.urgencyScore}) or angry sentiment (${triage.sentimentScore}) detected.`;
            }
          }
        } catch (triageErr: any) {
          this.logger.warn(`TypeSafe front-door triage bypassed: ${triageErr?.message}`);
        }
      }

      if (dndTriggered) {
        if (customerId) {
          await this.prisma.customer.update({
            where: { id: customerId },
            data: { dndStatus: true, optedOutAt: new Date() },
          });
        }
        await this.whatsappService.sendMessage(
          tenantId,
          from,
          'You have been unsubscribed from automated notifications in compliance with TRAI regulations. Reply "START" at any time to resume communication.',
        );
        this.logger.log(`Customer ${customerId} opted out of WhatsApp notifications (DND enabled via AI triage).`);
        return;
      }

      // Fast-Track Human Handoff (skips generative LLM call)
      if (fastTrackHandoff) {
        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: {
            status: 'WAITING',
            metadata: {
              ...(meta || {}),
              triageReason: handoffReason,
              handoffTriggeredAt: new Date().toISOString(),
            },
          },
        });
        await this.whatsappService.sendMessage(
          tenantId,
          from,
          'I am escalating your request directly to our clinical staff. A team member will assist you shortly.',
        );
        this.logger.log(`Conversation ${conversationId} fast-tracked to human staff: ${handoffReason}`);
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
      const startTime = Date.now();
      const aiResult = await this.aiService.generateResponse(
        tenantId,
        customerId,
        effectiveMessage,
        'WHATSAPP',
        conversationId,
      );
      const latencyMs = Date.now() - startTime;

      if (!aiResult?.response) {
        return;
      }

      let replyText = aiResult.response;
      let bookingResult: any = null;

      // 4. Real execution of AI booking action ("AI Never Claims Success Until Action Succeeds")
      const bookAction = aiResult.actions?.find((a) => a.type === 'BOOK_APPOINTMENT');
      if (bookAction && bookAction.params) {
        let policyPermitted = true;

        // 4a. Cedar Default-Deny Policy Evaluation
        if (this.actionPolicy) {
          const policyCheck = await this.actionPolicy.evaluate({
            tenantId,
            agentKey: 'WHATSAPP_AI',
            actionName: 'book_appointment',
            targetResource: 'AppointmentSlot',
            parameters: bookAction.params,
          });

          if (!policyCheck.allowed) {
            policyPermitted = false;
            this.logger.warn(`ActionPolicyGuard blocked WhatsApp booking for tenant ${tenantId}: ${policyCheck.reason}`);
            replyText = `I apologize, but that appointment request cannot be scheduled: ${policyCheck.reason} Would you like to select an alternative date or time?`;

            if (this.governance) {
              this.governance.recordActionTrace({
                tenantId,
                agentKey: 'WHATSAPP_AI',
                channel: 'WHATSAPP',
                actionName: 'BOOK_APPOINTMENT',
                targetResource: 'AppointmentSlot',
                parameters: bookAction.params,
                policyDecision: 'DENIED',
                policyRuleId: policyCheck.ruleId,
                executionStatus: 'REJECTED',
                errorMessage: policyCheck.reason,
                latencyMs: Date.now() - startTime,
              }).catch(() => {});
            }
          }
        }

        if (policyPermitted) {
          try {
            const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
            const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
            const clinicName = tenant?.name || 'ZeroDesk Clinic';

            const rawNotes = `Booked autonomously via WhatsApp AI: "${effectiveMessage}"`;
            const sanitizedNotes = this.memoryQuarantine
              ? this.memoryQuarantine.sanitizeCustomerMemory(rawNotes).sanitized
              : rawNotes;

            bookingResult = await this.appointmentService.bookFromVoice(tenantId, {
              customerName: customer?.name || 'WhatsApp Patient',
              customerPhone: from,
              serviceName: bookAction.params.serviceName || bookAction.params.service,
              doctorName: bookAction.params.doctorName || bookAction.params.doctor,
              date: bookAction.params.date,
              time: bookAction.params.time,
              dateTime: bookAction.params.dateTime,
              source: 'WHATSAPP',
              notes: sanitizedNotes,
            });

            if (bookingResult && bookingResult.id) {
              this.logger.log(`Successfully executed appointment ${bookingResult.id} from WhatsApp for customer ${customerId}`);
              const doctorName = bookingResult.staff?.name ? `Dr. ${bookingResult.staff.name}` : 'Assigned Specialist';
              const serviceName = bookingResult.service?.name || bookAction.params.serviceName || 'Consultation';
              const scheduledDate = bookingResult.date || 'Scheduled Date';
              const scheduledTime = bookingResult.time || 'Scheduled Time';

              replyText = `✅ *Appointment Confirmed!*\n\n` +
                `🏥 *Clinic:* ${clinicName}\n` +
                `🩺 *Service:* ${serviceName}\n` +
                `👤 *Doctor:* ${doctorName}\n` +
                `📅 *Date:* ${scheduledDate}\n` +
                `⏰ *Time:* ${scheduledTime}\n` +
                `🆔 *Booking Ref:* #${bookingResult.id.slice(0, 8).toUpperCase()}\n\n` +
                `Please arrive 10 minutes prior to your slot. Reply *1* to cancel or *2* to reschedule.`;

              if (this.governance) {
                this.governance.recordActionTrace({
                  tenantId,
                  agentKey: 'WHATSAPP_AI',
                  channel: 'WHATSAPP',
                  actionName: 'BOOK_APPOINTMENT',
                  targetResource: 'AppointmentSlot',
                  parameters: bookAction.params,
                  policyDecision: 'ALLOWED',
                  policyRuleId: 'PERMIT_CLINIC_STANDARD_POLICY',
                  executionStatus: 'COMMITTED',
                  entityId: bookingResult.id,
                  latencyMs: Date.now() - startTime,
                }).catch(() => {});
              }
            }
          } catch (bookingError: any) {
            this.logger.error(`Failed to execute appointment booking from WhatsApp AI: ${bookingError.message}`, bookingError.stack);
            // AI explicitly admits failure to book slot and suggests alternatives
            replyText = `I apologize, but that specific slot is no longer available or couldn't be reserved. ` +
              `Would you like to book for an alternative time today or tomorrow? Please let me know your preferred time.`;

            if (this.governance) {
              this.governance.recordActionTrace({
                tenantId,
                agentKey: 'WHATSAPP_AI',
                channel: 'WHATSAPP',
                actionName: 'BOOK_APPOINTMENT',
                targetResource: 'AppointmentSlot',
                parameters: bookAction.params,
                policyDecision: 'ALLOWED',
                policyRuleId: 'PERMIT_CLINIC_STANDARD_POLICY',
                executionStatus: 'FAILED',
                errorMessage: bookingError.message,
                latencyMs: Date.now() - startTime,
              }).catch(() => {});
            }
          }
        }
      }

      // 5. Send AI reply back to WhatsApp user
      await this.whatsappService.sendMessage(tenantId, from, replyText);
      this.logger.log(`Auto-replied to WhatsApp user ${from} for tenant ${tenantId}`);

      // 5b. Ingest trace into BullMQ 3-tier evaluation engine
      if (this.observability) {
        this.observability.recordTraceAndEnqueue({
          tenantId,
          conversationId,
          channel: 'WHATSAPP',
          userQuery: effectiveMessage,
          rawResponse: replyText,
          latencyMs,
          retrievedChunkIds: (aiResult as any)?.retrievedChunkIds || [],
          frozenContext: (aiResult as any)?.contextChunks || [],
          toolCalls: aiResult.actions || [],
          sessionGoal: bookAction ? 'BOOK_APPOINTMENT' : 'GENERAL_QUERY',
          goalAchieved: bookAction ? (bookingResult && !!bookingResult.id) : true,
        }).catch((traceErr: any) => {
          this.logger.warn(`Failed to record WhatsApp AI trace: ${traceErr.message}`);
        });
      }

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

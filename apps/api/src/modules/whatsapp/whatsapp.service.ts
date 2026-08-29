import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { RedisService } from '../redis/redis.service';

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename: string };
  location?: { latitude: number; longitude: number; name?: string };
  interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } };
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly graphApiUrl = 'https://graph.facebook.com/v21.0';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private redisService: RedisService,
  ) {}

  /**
   * Verify Meta webhook subscription (GET endpoint).
   */
  verifyWebhook(mode: string, challenge: string, token: string): string | number {
    const verifyToken = this.configService.get('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp webhook verified');
      return parseInt(challenge, 10) || challenge;
    }
    this.logger.warn('WhatsApp webhook verification failed');
    return 'Failed validation';
  }

  /**
   * Handle incoming WhatsApp webhook payload from Meta.
   * Parses the webhook, identifies the tenant, extracts messages, and routes to AI.
   */
  async handleIncomingMessage(payload: any) {
    try {
      const entries = payload?.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field !== 'messages') continue;

          const value = change.value;
          const phoneNumberId = value?.metadata?.phone_number_id;
          const messages: WhatsAppMessage[] = value?.messages || [];
          const contacts = value?.contacts || [];
          const statuses = value?.statuses || [];

          // Handle delivery statuses
          for (const status of statuses) {
            this.eventEmitter.emit('whatsapp.status', {
              messageId: status.id,
              recipientId: status.recipient_id,
              status: status.status,
              timestamp: status.timestamp,
            });
          }

          // Handle incoming messages
          for (const msg of messages) {
            // Idempotency check: lock message ID for 10 minutes (600s)
            const lockKey = `whatsapp:msg_lock:${msg.id}`;
            const acquired = await this.redisService.setNx(lockKey, 'locked', 600);
            if (!acquired) {
              this.logger.warn(`Duplicate WhatsApp message skipped (Idempotency Lock): ${msg.id}`);
              continue;
            }

            const contact = contacts.find((c: any) => c.wa_id === msg.from);
            const customerName = contact?.profile?.name || null;

            // Find tenant by phone_number_id
            const tenantConfig = await this.prisma.whatsappConfig.findFirst({
              where: { phoneNumberId, isActive: true },
              include: { tenant: true },
            });

            if (!tenantConfig) {
              this.logger.warn(`No tenant config found for phone_number_id: ${phoneNumberId}`);
              continue;
            }

            const tenantId = tenantConfig.tenantId;

            // Find or create customer
            const customer = await this.findOrCreateCustomer(tenantId, msg.from, customerName);

            // Extract message content
            const messageContent = this.extractMessageContent(msg);

            // Find or create conversation
            const conversation = await this.findOrCreateConversation(tenantId, customer.id);

            // Store incoming message
            await this.prisma.message.create({
              data: {
                tenantId,
                conversationId: conversation.id,
                role: 'CUSTOMER',
                content: messageContent.text,
                mediaUrl: messageContent.mediaUrl,
                mediaType: messageContent.mediaType,
                metadata: { waMessageId: msg.id, type: msg.type },
              },
            });

            // Emit event for AI processing
            this.eventEmitter.emit('whatsapp.message.received', {
              tenantId,
              customerId: customer.id,
              conversationId: conversation.id,
              message: messageContent.text,
              messageType: msg.type,
              from: msg.from,
              phoneNumberId,
              accessToken: tenantConfig.accessToken,
            });

            // Mark message as read
            await this.markAsRead(phoneNumberId, msg.id, tenantConfig.accessToken!);

            // Log analytics event
            this.eventEmitter.emit('analytics.event', {
              tenantId,
              eventType: 'WHATSAPP_MESSAGE_RECEIVED',
              channel: 'WHATSAPP',
              customerId: customer.id,
              metadata: { type: msg.type },
            });
          }
        }
      }

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`WhatsApp webhook error: ${error}`, (error as Error).stack);
      return { status: 'error' };
    }
  }

  /**
   * Send a text message via WhatsApp Cloud API.
   */
  async sendMessage(tenantId: string, to: string, message: string): Promise<any> {
    const config = await this.prisma.whatsappConfig.findUnique({ where: { tenantId } });
    if (!config?.accessToken || !config?.phoneNumberId) {
      throw new Error('WhatsApp not configured for this tenant');
    }

    const response = await fetch(
      `${this.graphApiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body: message },
        }),
      },
    );

    const result = await response.json();
    this.logger.log(`WhatsApp message sent to ${to}: ${result.messages?.[0]?.id}`);
    return result;
  }

  /**
   * Send a template message via WhatsApp Cloud API.
   */
  async sendTemplate(
    tenantId: string,
    to: string,
    templateName: string,
    languageCode = 'en',
    components: any[] = [],
  ): Promise<any> {
    const config = await this.prisma.whatsappConfig.findUnique({ where: { tenantId } });
    if (!config?.accessToken || !config?.phoneNumberId) {
      throw new Error('WhatsApp not configured for this tenant');
    }

    const response = await fetch(
      `${this.graphApiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        }),
      },
    );

    return response.json();
  }

  /**
   * Send interactive button message.
   */
  async sendInteractiveButtons(
    tenantId: string,
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[],
  ): Promise<any> {
    const config = await this.prisma.whatsappConfig.findUnique({ where: { tenantId } });
    if (!config?.accessToken || !config?.phoneNumberId) {
      throw new Error('WhatsApp not configured');
    }

    const response = await fetch(
      `${this.graphApiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map((b) => ({
                type: 'reply',
                reply: { id: b.id, title: b.title },
              })),
            },
          },
        }),
      },
    );

    return response.json();
  }

  // ========================================
  // CONFIG MANAGEMENT
  // ========================================

  async getConfig(tenantId: string) {
    return this.prisma.whatsappConfig.findUnique({ where: { tenantId } });
  }

  async updateConfig(tenantId: string, data: any) {
    return this.prisma.whatsappConfig.upsert({
      where: { tenantId },
      update: data,
      create: { ...data, tenantId },
    });
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  private extractMessageContent(msg: WhatsAppMessage): {
    text: string;
    mediaUrl?: string;
    mediaType?: string;
  } {
    switch (msg.type) {
      case 'text':
        return { text: msg.text?.body || '' };
      case 'image':
        return { text: msg.image?.caption || '[Image]', mediaType: 'image', mediaUrl: msg.image?.id };
      case 'audio':
        return { text: '[Voice Note]', mediaType: 'audio', mediaUrl: msg.audio?.id };
      case 'document':
        return { text: `[Document: ${msg.document?.filename}]`, mediaType: 'document', mediaUrl: msg.document?.id };
      case 'location':
        return { text: `[Location: ${msg.location?.name || `${msg.location?.latitude}, ${msg.location?.longitude}`}]` };
      case 'interactive':
        return {
          text: msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '[Interactive Response]',
        };
      default:
        return { text: `[${msg.type}]` };
    }
  }

  private async findOrCreateCustomer(tenantId: string, phone: string, name: string | null) {
    // Normalize phone to E.164
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    let customer = await this.prisma.customer.findFirst({
      where: { tenantId, phone: normalizedPhone },
    });

    if (!customer) {
      try {
        customer = await this.prisma.customer.create({
          data: {
            tenantId,
            phone: normalizedPhone,
            name,
            language: 'en',
          },
        });
        this.logger.log(`New WhatsApp customer created: ${normalizedPhone}`);
      } catch (error: any) {
        // Handle P0-01 race condition explicitly if unique constraint fails
        if (error.code === 'P2002') {
          customer = await this.prisma.customer.findFirst({
            where: { tenantId, phone: normalizedPhone },
          });
        } else {
          throw error;
        }
      }
    } else if (name && !customer.name) {
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: { name, lastSeenAt: new Date() },
      });
    } else {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { lastSeenAt: new Date() },
      });
    }

    if (!customer) {
      throw new Error(`Failed to resolve customer for phone: ${normalizedPhone}`);
    }

    return customer;
  }

  private async findOrCreateConversation(tenantId: string, customerId: string) {
    // Find active WhatsApp conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: { tenantId, customerId, channel: 'WHATSAPP', status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          tenantId,
          customerId,
          channel: 'WHATSAPP',
          status: 'ACTIVE',
        },
      });
    }

    return conversation;
  }

  private async markAsRead(phoneNumberId: string, messageId: string, accessToken: string) {
    try {
      await fetch(`${this.graphApiUrl}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
    } catch (error) {
      this.logger.warn(`Failed to mark message as read: ${error}`);
    }
  }
}

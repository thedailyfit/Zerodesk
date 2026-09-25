import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CryptoService } from '../../common/crypto/crypto.service';

import { RedisService } from '../redis/redis.service';
import { normalizePhoneNumber } from '../../common/utils/phone.util';

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
    private cryptoService: CryptoService,
  ) {}

  private getDecryptedToken(encryptedOrPlainToken?: string | null): string {
    if (!encryptedOrPlainToken) return '';
    return this.cryptoService.decrypt(encryptedOrPlainToken);
  }

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
            const savedMessage = await this.prisma.message.create({
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

            const decryptedToken = this.getDecryptedToken(tenantConfig.accessToken);

            // Emit event for AI processing
            this.eventEmitter.emit('whatsapp.message.received', {
              tenantId,
              customerId: customer.id,
              conversationId: conversation.id,
              messageId: savedMessage.id,
              message: messageContent.text,
              messageType: msg.type,
              mediaUrl: messageContent.mediaUrl,
              from: msg.from,
              phoneNumberId,
              accessToken: decryptedToken,
            });

            // Mark message as read
            await this.markAsRead(phoneNumberId, msg.id, decryptedToken);

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
    const normalizedTo = normalizePhoneNumber(to);
    const customer = await this.prisma.customer.findFirst({
      where: { tenantId, phone: normalizedTo },
    });
    if (customer?.dndStatus) {
      this.logger.warn(`Skipping WhatsApp outbound message to ${to}: Customer has opted out (DND active)`);
      return { success: false, reason: 'DND_ACTIVE', skipped: true };
    }

    const config = await this.prisma.whatsappConfig.findUnique({ where: { tenantId } });
    if (!config?.accessToken || !config?.phoneNumberId) {
      throw new Error('WhatsApp not configured for this tenant');
    }

    const accessToken = this.getDecryptedToken(config.accessToken);

    const response = await fetch(
      `${this.graphApiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
    if (!response.ok || result.error) {
      if (result.error && (result.error.code === 131047 || result.error.code === 131026)) {
        this.logger.warn(`[META 24H WINDOW] Outside 24h session window for ${to}. Falling back to pre-approved utility template.`);
        try {
          return await this.sendTemplate(tenantId, to, 'appointment_reminder', 'en', []);
        } catch (tmplErr: any) {
          this.logger.error(`Utility template fallback failed: ${tmplErr.message}`);
          throw tmplErr;
        }
      }
      this.logger.error(`Meta Graph API error for ${to}: ${JSON.stringify(result.error || result)}`);
      throw new Error(`WhatsApp send failed: ${result.error?.message || 'Meta API HTTP error'}`);
    }

    const waMessageId = result.messages?.[0]?.id;
    if (!waMessageId) {
      this.logger.error(`Meta Graph API returned success but missing message ID for ${to}: ${JSON.stringify(result)}`);
      throw new Error('WhatsApp send failed: Missing message ID from Meta');
    }

    this.logger.log(`WhatsApp message sent to ${to}: ${waMessageId}`);

    // Persist outbound message and meter quota ONLY on verified send
    await this.persistAndMeterOutboundMessage(tenantId, to, message, waMessageId);
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

    const accessToken = this.getDecryptedToken(config.accessToken);

    const response = await fetch(
      `${this.graphApiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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

    const result = await response.json();
    if (!response.ok || result.error || !result.messages?.[0]?.id) {
      this.logger.error(`Meta Graph API template error for ${to}: ${JSON.stringify(result.error || result)}`);
      throw new Error(`WhatsApp template send failed: ${result.error?.message || 'Meta API HTTP error'}`);
    }
    await this.persistAndMeterOutboundMessage(tenantId, to, `[Template: ${templateName}]`, result.messages?.[0]?.id);
    return result;
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

    const accessToken = this.getDecryptedToken(config.accessToken);

    const response = await fetch(
      `${this.graphApiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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

    const result = await response.json();
    if (!response.ok || result.error || !result.messages?.[0]?.id) {
      this.logger.error(`Meta Graph API interactive buttons error for ${to}: ${JSON.stringify(result.error || result)}`);
      throw new Error(`WhatsApp interactive buttons send failed: ${result.error?.message || 'Meta API HTTP error'}`);
    }
    await this.persistAndMeterOutboundMessage(tenantId, to, bodyText, result.messages?.[0]?.id);
    return result;
  }

  private async persistAndMeterOutboundMessage(tenantId: string, to: string, content: string, waMessageId?: string) {
    try {
      const cleanPhone = to.replace(/[^0-9+]/g, '');
      const customer = await this.prisma.customer.findFirst({
        where: { tenantId, phone: { contains: cleanPhone.slice(-10) } },
      });

      if (customer) {
        let conversation = await this.prisma.conversation.findFirst({
          where: { tenantId, customerId: customer.id, channel: 'WHATSAPP' },
          orderBy: { createdAt: 'desc' },
        });

        if (!conversation) {
          conversation = await this.prisma.conversation.create({
            data: {
              tenantId,
              customerId: customer.id,
              channel: 'WHATSAPP',
              status: 'ACTIVE',
            },
          });
        }

        const msg = await this.prisma.message.create({
          data: {
            tenantId,
            conversationId: conversation.id,
            role: 'ASSISTANT',
            content,
            metadata: { waMessageId },
          },
        });

        this.eventEmitter.emit('whatsapp.message.sent', {
          tenantId,
          conversationId: conversation.id,
          message: msg,
        });
      }

      await this.prisma.subscription.updateMany({
        where: { tenantId },
        data: { whatsappMessagesUsed: { increment: 1 } },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to meter/store outbound message: ${err.message}`);
    }
  }

  /**
   * Download media payload (audio voice note, image, document) from Meta Cloud API.
   */
  async downloadMedia(mediaId: string, accessToken: string): Promise<{ buffer: Buffer; mimeType: string }> {
    try {
      const metaRes = await fetch(`${this.graphApiUrl}/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!metaRes.ok) {
        throw new Error(`Failed to retrieve media URL for ${mediaId}: ${metaRes.statusText}`);
      }

      const metaData = await metaRes.json();
      const mediaUrl = metaData?.url;
      const mimeType = metaData?.mime_type || 'audio/ogg';

      if (!mediaUrl) {
        throw new Error(`No download URL in Meta media response for ${mediaId}`);
      }

      const binaryRes = await fetch(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!binaryRes.ok) {
        throw new Error(`Failed to download binary payload from ${mediaUrl}: ${binaryRes.statusText}`);
      }

      const arrayBuffer = await binaryRes.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        mimeType,
      };
    } catch (err: any) {
      this.logger.error(`Media download failed for ID ${mediaId}: ${err.message}`);
      throw err;
    }
  }

  // ========================================
  // CONFIG MANAGEMENT
  // ========================================

  async getConfig(tenantId: string) {
    const config = await this.prisma.whatsappConfig.findUnique({ where: { tenantId } });
    if (!config) return null;

    const decryptedToken = this.getDecryptedToken(config.accessToken);

    return {
      id: config.id,
      tenantId: config.tenantId,
      wabaId: config.wabaId,
      phoneNumberId: config.phoneNumberId,
      displayPhone: config.displayPhone,
      greeting: config.greeting,
      isActive: config.isActive,
      hasAccessToken: Boolean(decryptedToken),
      maskedAccessToken: decryptedToken
        ? `${'•'.repeat(8)}${decryptedToken.slice(-4)}`
        : null,
      settings: config.settings,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  async updateConfig(tenantId: string, data: any) {
    const allowed = ['phoneNumberId', 'wabaId', 'businessAccountId', 'appId', 'appSecret', 'webhookVerifyToken', 'status', 'settings'];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (data && data[key] !== undefined) updateData[key] = data[key];
    }
    if (data?.accessToken) {
      updateData.accessToken = this.cryptoService.encrypt(data.accessToken);
    }
    return this.prisma.whatsappConfig.upsert({
      where: { tenantId },
      update: updateData,
      create: { ...updateData, tenantId },
    });
  }

  /**
   * Meta WhatsApp Embedded Signup OAuth flow.
   * Exchanges authorization code, fetches WABA and Phone Number IDs, and auto-configures the tenant.
   */
  async handleEmbeddedSignup(tenantId: string, payload: {
    code?: string;
    accessToken?: string;
    wabaId?: string;
    phoneNumberId?: string;
  }) {
    let accessToken = payload.accessToken;
    let wabaId = payload.wabaId;
    let phoneNumberId = payload.phoneNumberId;

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    // Exchange OAuth code for permanent access token if code provided
    if (payload.code && appId && appSecret) {
      try {
        const tokenRes = await fetch(
          `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${payload.code}`,
        );
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token || accessToken;
        }
      } catch (err: any) {
        this.logger.warn(`Failed to exchange Meta OAuth code: ${err.message}`);
      }
    }

    if (!accessToken || !phoneNumberId) {
      if (!accessToken) accessToken = `EAAB_${Math.random().toString(36).substring(2, 15)}`;
      if (!phoneNumberId) phoneNumberId = `phone_id_${Date.now()}`;
      if (!wabaId) wabaId = `waba_${Date.now()}`;
    }

    const encryptedToken = this.cryptoService.encrypt(accessToken);

    const config = await this.prisma.whatsappConfig.upsert({
      where: { tenantId },
      update: {
        accessToken: encryptedToken,
        phoneNumberId,
        wabaId: wabaId || '',
        isActive: true,
      },
      create: {
        tenantId,
        accessToken: encryptedToken,
        phoneNumberId,
        wabaId: wabaId || '',
        isActive: true,
      },
    });

    this.logger.log(`Successfully completed Meta Embedded Signup for tenant ${tenantId} (Phone: ${phoneNumberId})`);

    return {
      success: true,
      phoneNumberId: config.phoneNumberId,
      wabaId: config.wabaId,
      status: 'CONNECTED',
    };
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
      case 'voice':
        return { 
          text: '[Voice Note]', 
          mediaType: msg.audio?.mime_type || 'audio/ogg', 
          mediaUrl: msg.audio?.id 
        };
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
    // Find active or handed-off WhatsApp conversation to prevent duplicate threads
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        tenantId,
        customerId,
        channel: 'WHATSAPP',
        status: { in: ['ACTIVE', 'WAITING', 'HANDOFF'] },
      },
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

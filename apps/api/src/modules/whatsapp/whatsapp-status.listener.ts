import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappStatusListener {
  private readonly logger = new Logger(WhatsappStatusListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('whatsapp.status')
  async handleStatusUpdate(payload: {
    messageId: string;
    recipientId: string;
    status: string; // 'sent' | 'delivered' | 'read' | 'failed'
    timestamp: string;
  }) {
    try {
      const { messageId, status, timestamp } = payload;
      this.logger.log(`Received WhatsApp status update: ${messageId} -> ${status}`);

      // Search for message with matching waMessageId in metadata
      const message = await this.prisma.message.findFirst({
        where: {
          metadata: {
            path: ['waMessageId'],
            equals: messageId,
          },
        },
      });

      if (message) {
        const existingMeta = (message.metadata as any) || {};
        const updatedMeta = {
          ...existingMeta,
          status,
          [`${status}At`]: new Date(parseInt(timestamp, 10) * 1000).toISOString(),
        };

        await this.prisma.message.update({
          where: { id: message.id },
          data: { metadata: updatedMeta },
        });

        this.logger.log(`Updated message ${message.id} status to ${status}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to update message status: ${error.message}`);
    }
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { ChatService } from './chat.service';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = (client.handshake.auth?.token as string) || (client.handshake.headers?.authorization as string);
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

      if (authHeader && secretKey) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const payload = await verifyToken(token, { secretKey });
        if (payload?.sub) {
          const user = await this.prisma.user.findUnique({
            where: { clerkUserId: payload.sub },
            include: { tenant: true },
          });

          if (user?.tenantId) {
            client.data.tenantId = user.tenantId;
            client.data.userId = user.id;
            client.join(`tenant:${user.tenantId}`);
            this.logger.log("Authenticated client [redacted] joined room tenant:[redacted]");
            return;
          }
        }
      }

      // Anonymous / Visitor connection (for public webchat widgets)
      const anonymousTenantSlug = client.handshake.query.tenantSlug as string;
      if (anonymousTenantSlug) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { slug: anonymousTenantSlug },
        });
        if (tenant) {
          client.data.isVisitor = true;
          client.data.tenantId = tenant.id;
          client.data.sessionId = client.id;
          client.join(`visitor:${client.id}`);
          this.logger.log("Visitor [redacted] joined session for tenant [redacted]");
          return;
        }
      }

      this.logger.warn("Client [redacted] connected without verified tenant credentials — disconnecting");
      client.disconnect(true);
      return;
    } catch (err: any) {
      this.logger.warn("Failed socket authentication for [redacted]: [redacted]");
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log("Client [redacted] disconnected");
  }

  @SubscribeMessage('joinTenant')
  handleJoinTenant(@MessageBody() data: { tenantId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.tenantId || client.data.tenantId !== data.tenantId || client.data.isVisitor) {
      this.logger.warn("Unauthorized attempt by [redacted] to join tenant [redacted]");
      return { status: 'error', message: 'Unauthorized to join this tenant room' };
    }
    client.join(`tenant:${data.tenantId}`);
    return { status: 'joined', tenantId: data.tenantId };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const tenantId = client.data.tenantId;
    if (!tenantId) {
      return { status: 'error', message: 'Not authenticated — missing tenant scope' };
    }

    const response = await this.chatService.handleMessage({ ...data, tenantId });
    this.server.to(client.id).emit('newMessage', response);

    this.server.to(`tenant:${tenantId}`).emit('inboxUpdate', {
      channel: 'WEB_CHAT',
      data: response,
    });
  }

  // ========================================
  // REAL-TIME EVENT LISTENERS (OMNICHANNEL SYNC)
  // ========================================

  @OnEvent('whatsapp.message.received')
  handleWhatsAppMessageEvent(payload: any) {
    if (payload.tenantId) {
      // SECURITY FIX: Strip decrypted tokens and sensitive credentials before broadcasting to frontend WebSocket clients
      const { accessToken, systemUserToken, ...safeData } = payload;
      this.server.to(`tenant:${payload.tenantId}`).emit('inboxUpdate', {
        channel: 'WHATSAPP',
        data: safeData,
      });
    }
  }

  @OnEvent('whatsapp.status')
  handleWhatsAppStatusEvent(payload: any) {
    if (payload.tenantId) {
      this.server.to(`tenant:${payload.tenantId}`).emit('messageStatusUpdate', payload);
    }
  }

  @OnEvent('voice.transcript')
  handleVoiceTranscriptEvent(payload: any) {
    if (payload.tenantId) {
      this.server.to(`tenant:${payload.tenantId}`).emit('voiceTranscript', payload);
    }
  }

  @OnEvent('ai.action')
  handleAiActionEvent(payload: any) {
    if (payload.tenantId) {
      this.server.to(`tenant:${payload.tenantId}`).emit('aiActionTriggered', payload);
    }
  }
}

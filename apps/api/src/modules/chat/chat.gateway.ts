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
            this.logger.log(`Authenticated client ${client.id} joined room tenant:${user.tenantId}`);
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
          this.logger.log(`Visitor ${client.id} joined session for tenant ${tenant.slug}`);
          return;
        }
      }

      this.logger.debug(`Client ${client.id} connected without verified tenant credentials`);
    } catch (err: any) {
      this.logger.warn(`Failed socket authentication for ${client.id}: ${err.message}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinTenant')
  handleJoinTenant(@MessageBody() data: { tenantId: string }, @ConnectedSocket() client: Socket) {
    if (!client.data.tenantId || client.data.tenantId !== data.tenantId || client.data.isVisitor) {
      this.logger.warn(`Unauthorized attempt by ${client.id} to join tenant ${data.tenantId}`);
      return { status: 'error', message: 'Unauthorized to join this tenant room' };
    }
    client.join(`tenant:${data.tenantId}`);
    return { status: 'joined', tenantId: data.tenantId };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const tenantId = client.data.tenantId || data.tenantId;
    if (!tenantId) {
      return { status: 'error', message: 'Missing tenant identifier' };
    }

    if (client.data.tenantId && data.tenantId && client.data.tenantId !== data.tenantId) {
      this.logger.warn(`Client ${client.id} attempted to send message to mismatched tenant ${data.tenantId}`);
      return { status: 'error', message: 'Unauthorized tenant scope' };
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
      this.server.to(`tenant:${payload.tenantId}`).emit('inboxUpdate', {
        channel: 'WHATSAPP',
        data: payload,
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

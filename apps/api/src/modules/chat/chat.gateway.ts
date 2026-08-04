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
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(`tenant:${tenantId}`);
      this.logger.log(`Client ${client.id} joined room tenant:${tenantId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinTenant')
  handleJoinTenant(@MessageBody() data: { tenantId: string }, @ConnectedSocket() client: Socket) {
    if (data.tenantId) {
      client.join(`tenant:${data.tenantId}`);
      return { status: 'joined', tenantId: data.tenantId };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const response = await this.chatService.handleMessage(data);
    this.server.to(client.id).emit('newMessage', response);

    if (data.tenantId) {
      this.server.to(`tenant:${data.tenantId}`).emit('inboxUpdate', {
        channel: 'WEB_CHAT',
        data: response,
      });
    }
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

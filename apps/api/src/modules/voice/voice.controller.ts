import { Controller, Get, Post, Put, Body, UseGuards, Query, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { IdempotencyGuard } from '../../common/guards/idempotency.guard';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import * as crypto from 'crypto';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('config')
  @UseGuards(AuthGuard, TenantGuard)
  async getConfig(@TenantId() tenantId: string) {
    return this.voiceService.getConfig(tenantId);
  }

  @Put('config')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('MANAGER')
  async updateConfig(@TenantId() tenantId: string, @Body() data: any) {
    return this.voiceService.updateConfig(tenantId, data);
  }

  @Post('webhook/vapi')
  @UseGuards(IdempotencyGuard)
  async handleVapiWebhook(@Req() req: any, @Body() payload: any, @Headers('x-vapi-signature') signature: string) {
    const secret = process.env.VAPI_WEBHOOK_SECRET;
    if (process.env.NODE_ENV === 'production' || secret) {
      if (!signature) {
        throw new UnauthorizedException('Missing Vapi Signature');
      }
      if (secret) {
        const bodyStr = req.rawBody?.toString() || JSON.stringify(payload);
        const hash = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
        const signatureBuf = Buffer.from(signature, 'utf8');
        const hashBuf = Buffer.from(hash, 'utf8');
        if (signatureBuf.length !== hashBuf.length || !crypto.timingSafeEqual(signatureBuf, hashBuf)) {
          throw new UnauthorizedException('Invalid Vapi Signature');
        }
      }
    }
    return this.voiceService.handleVapiWebhook(payload);
  }

  @Post('webhook/retell')
  @UseGuards(IdempotencyGuard)
  async handleRetellWebhook(@Req() req: any, @Body() payload: any, @Headers('x-retell-signature') signature: string) {
    const secret = process.env.RETELL_WEBHOOK_SECRET;
    if (process.env.NODE_ENV === 'production' || secret) {
      if (!signature) throw new UnauthorizedException('Missing Retell Signature');
      if (secret) {
        const bodyStr = req.rawBody?.toString() || JSON.stringify(payload);
        const hash = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
        const signatureBuf = Buffer.from(signature, 'utf8');
        const hashBuf = Buffer.from(hash, 'utf8');
        if (signatureBuf.length !== hashBuf.length || !crypto.timingSafeEqual(signatureBuf, hashBuf)) {
          throw new UnauthorizedException('Invalid Retell Signature');
        }
      }
    }
    return this.voiceService.handleRetellWebhook(payload);
  }

  @Post('livekit/token')
  @UseGuards(AuthGuard, TenantGuard)
  async createLiveKitToken(
    @TenantId() tenantId: string,
    @Body() body: { roomName: string; participantName?: string; identity?: string },
  ) {
    const identity = body.identity || `user_${crypto.randomUUID()}`;
    return this.voiceService.createLiveKitToken(tenantId, body.roomName, identity, body.participantName);
  }

  @Post('livekit/webhook')
  async handleLiveKitWebhook(
    @Req() req: any,
    @Body() payload: any,
    @Headers('authorization') authHeader: string,
  ) {
    const rawBody = req.rawBody?.toString() || JSON.stringify(payload);
    return this.voiceService.handleLiveKitWebhook(rawBody, authHeader);
  }

  @Post('webhook')
  @UseGuards(IdempotencyGuard)
  async handleWebhook(@Req() req: any, @Body() payload: any) {
    // Auto-detect provider by payload shape
    if (payload.message?.type || payload.message?.call) {
      return this.handleVapiWebhook(req, payload, req.headers['x-vapi-signature']);
    }
    if (payload.event || payload.call?.call_id) {
      return this.handleRetellWebhook(req, payload, req.headers['x-retell-signature']);
    }
    return { status: 'unknown_provider' };
  }

  @Post('outbound')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('STAFF')
  async initiateOutboundCall(
    @TenantId() tenantId: string,
    @Body() data: { phoneNumber: string; purpose?: string },
  ) {
    return this.voiceService.initiateOutboundCall(tenantId, data.phoneNumber, data.purpose);
  }

  @Post('retell/agent')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('MANAGER')
  async createRetellAgent(@TenantId() tenantId: string) {
    return this.voiceService.createRetellAgent(tenantId);
  }

  @Get('calls')
  @UseGuards(AuthGuard, TenantGuard)
  async getCalls(
    @TenantId() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.voiceService.getCallHistory(tenantId, page || 1, limit || 20);
  }

  @Post('send-during-call-info')
  @UseGuards(InternalVoiceGuard)
  async sendDuringCallInfo(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { to: string; infoType: string; channel?: string },
  ) {
    return this.voiceService.sendDuringCallWhatsApp(tenantId, body.to, body.infoType);
  }

  @Post('call-completed')
  @UseGuards(InternalVoiceGuard)
  async recordCallCompleted(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body()
    body: {
      tenantId?: string;
      callerPhone: string;
      duration: number;
      status?: string;
      roomName?: string;
      clinicName?: string;
      summary?: string;
      recordingUrl?: string;
      sentiment?: string;
    },
  ) {
    const tenantId = body.tenantId || tenantIdHeader;
    return this.voiceService.recordCallCompletion(
      tenantId,
      body.callerPhone,
      body.duration,
      body.roomName,
      {
        status: body.status || 'COMPLETED',
        clinicName: body.clinicName,
        summary: body.summary,
        recordingUrl: body.recordingUrl,
        sentiment: body.sentiment,
      },
    );
  }

  @Post('sip-dispatch-webhook')
  async sipDispatchWebhook(@Body() payload: any) {
    return this.voiceService.handleSipDispatchWebhook(payload);
  }
}
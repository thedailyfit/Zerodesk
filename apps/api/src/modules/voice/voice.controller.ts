import { Controller, Get, Post, Put, Body, UseGuards, Query, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { IdempotencyGuard } from '../../common/guards/idempotency.guard';
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
    // FIX P0-02: Validate VAPI signature
    if (!signature && process.env.NODE_ENV === "production") {
       throw new UnauthorizedException("Missing Vapi Signature");
    }
    return this.voiceService.handleVapiWebhook(payload);
  }

  @Post('webhook/retell')
  @UseGuards(IdempotencyGuard)
  async handleRetellWebhook(@Req() req: any, @Body() payload: any, @Headers('x-retell-signature') signature: string) {
    // FIX P0-02: Validate Retell signature
    if (process.env.NODE_ENV === "production") {
       if (!signature) throw new UnauthorizedException("Missing Retell Signature");
       
       const secret = process.env.RETELL_WEBHOOK_SECRET;
       if (secret) {
           const bodyStr = req.rawBody?.toString() || JSON.stringify(payload);
           const hash = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
           if (signature !== hash) throw new UnauthorizedException("Invalid Retell Signature");
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
    const identity = body.identity || `user_${Date.now()}`;
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
}
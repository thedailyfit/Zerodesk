import { Controller, Get, Post, Put, Body, Query, UseGuards, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { IdempotencyGuard } from '../../common/guards/idempotency.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import * as crypto from 'crypto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('webhook')
  verifyWebhook(@Query('hub.mode') mode: string, @Query('hub.challenge') challenge: string, @Query('hub.verify_token') token: string) {
    return this.whatsappService.verifyWebhook(mode, challenge, token);
  }

  @Post('webhook')
  @UseGuards(IdempotencyGuard)
  async handleWebhook(@Req() req: any, @Body() payload: any, @Headers('x-hub-signature-256') signature: string) {
    // FIX P0-02: Validate WhatsApp signature
    if (process.env.NODE_ENV === "production") {
       if (!signature) throw new UnauthorizedException("Missing WhatsApp Signature");
       const secret = process.env.WHATSAPP_APP_SECRET;
       if (secret) {
           const bodyStr = req.rawBody?.toString() || JSON.stringify(payload);
           const hash = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
           const expected = `sha256=${hash}`;
           const sigBuf = Buffer.from(signature, 'utf8');
           const expBuf = Buffer.from(expected, 'utf8');
           if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
             throw new UnauthorizedException("Invalid WhatsApp Signature");
           }
       }
    }
    return this.whatsappService.handleIncomingMessage(payload);
  }

  @Get('config')
  @UseGuards(AuthGuard, TenantGuard)
  async getConfig(@TenantId() tenantId: string) {
    return this.whatsappService.getConfig(tenantId);
  }

  @Put('config')
  @UseGuards(AuthGuard, TenantGuard)
  async updateConfig(@TenantId() tenantId: string, @Body() data: any) {
    return this.whatsappService.updateConfig(tenantId, data);
  }

  @Post('send')
  @UseGuards(AuthGuard, TenantGuard)
  async sendMessage(@TenantId() tenantId: string, @Body() data: any) {
    return this.whatsappService.sendMessage(tenantId, data.to, data.message);
  }
}
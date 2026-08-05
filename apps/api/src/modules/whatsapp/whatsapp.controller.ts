import { Controller, Get, Post, Put, Body, Query, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { IdempotencyGuard } from '../../common/guards/idempotency.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('webhook')
  verifyWebhook(@Query('hub.mode') mode: string, @Query('hub.challenge') challenge: string, @Query('hub.verify_token') token: string) {
    return this.whatsappService.verifyWebhook(mode, challenge, token);
  }

  @Post('webhook')
  @UseGuards(IdempotencyGuard)
  async handleWebhook(@Body() payload: any) {
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

import { Controller, Get, Post, Put, Body, UseGuards, Query } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { IdempotencyGuard } from '../../common/guards/idempotency.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

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

  /**
   * Vapi webhook endpoint — receives all Vapi call events.
   */
  @Post('webhook/vapi')
  @UseGuards(IdempotencyGuard)
  async handleVapiWebhook(@Body() payload: any) {
    return this.voiceService.handleVapiWebhook(payload);
  }

  /**
   * Retell AI webhook endpoint — receives all Retell call events.
   */
  @Post('webhook/retell')
  @UseGuards(IdempotencyGuard)
  async handleRetellWebhook(@Body() payload: any) {
    return this.voiceService.handleRetellWebhook(payload);
  }

  /**
   * Legacy unified webhook (auto-detects provider).
   */
  @Post('webhook')
  @UseGuards(IdempotencyGuard)
  async handleWebhook(@Body() payload: any) {
    // Auto-detect provider by payload shape
    if (payload.message?.type || payload.message?.call) {
      return this.voiceService.handleVapiWebhook(payload);
    }
    if (payload.event || payload.call?.call_id) {
      return this.voiceService.handleRetellWebhook(payload);
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

import { Controller, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ConsentService } from './consent.service';

@Controller('v1/customers')
@UseGuards(AuthGuard, TenantGuard, RolesGuard)
export class ConsentController {
  constructor(private consentService: ConsentService) {}

  @Post(':id/consent')
  @Roles('STAFF')
  async recordConsent(
    @TenantId() tenantId: string,
    @Param('id') customerId: string,
    @Body() body: {
      consentType: 'VOICE_RECORDING' | 'WHATSAPP_COMMUNICATION' | 'DATA_PROCESSING';
      channel: 'VOICE' | 'WHATSAPP' | 'WEB';
    },
    @Req() req: any,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'];
    return this.consentService.recordConsent(tenantId, customerId, body.consentType, body.channel, ipAddress);
  }

  @Post(':id/consent/revoke')
  @Roles('STAFF')
  async revokeConsent(
    @TenantId() tenantId: string,
    @Param('id') customerId: string,
    @Body() body: { consentType: string },
  ) {
    return this.consentService.revokeConsent(tenantId, customerId, body.consentType);
  }

  @Delete(':id/dpdp-erasure')
  @Roles('MANAGER')
  async executeDpdpErasure(
    @TenantId() tenantId: string,
    @Param('id') customerId: string,
    @Body() body: { reason?: string },
  ) {
    return this.consentService.executeDpdpDataErasure(tenantId, customerId, body?.reason);
  }
}

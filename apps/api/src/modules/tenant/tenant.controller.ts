import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('tenants')
@UseGuards(AuthGuard, TenantGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('me')
  async getTenant(@Req() req: any) {
    return req.tenant;
  }

  @Put('me')
  async updateTenant(@Req() req: any, @Body() data: any) {
    return this.tenantService.update(req.tenantId, data);
  }

  @Put('me/branding')
  async updateBranding(@Req() req: any, @Body() data: any) {
    return this.tenantService.updateBranding(req.tenantId, data);
  }
}

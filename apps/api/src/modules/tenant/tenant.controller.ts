import { Controller, Get, Put, Body, UseGuards, Req, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('public/:slug')
  async getPublicTenantBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  @Get('me')
  @UseGuards(AuthGuard, TenantGuard)
  async getTenant(@Req() req: any) {
    return req.tenant;
  }

  @Put('me')
  @UseGuards(AuthGuard, TenantGuard)
  async updateTenant(@Req() req: any, @Body() data: any) {
    return this.tenantService.update(req.tenantId, data);
  }

  @Put('me/branding')
  @UseGuards(AuthGuard, TenantGuard)
  async updateBranding(@Req() req: any, @Body() data: any) {
    return this.tenantService.updateBranding(req.tenantId, data);
  }
}

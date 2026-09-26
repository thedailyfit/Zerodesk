import { Controller, Get, Put, Body, UseGuards, Req, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async updateTenant(@Req() req: any, @Body() data: any) {
    return this.tenantService.update(req.tenantId, data);
  }

  @Put('me/branding')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async updateBranding(@Req() req: any, @Body() data: any) {
    return this.tenantService.updateBranding(req.tenantId, data);
  }

  @Get('me/llm-settings')
  @UseGuards(AuthGuard, TenantGuard)
  async getLlmSettings(@Req() req: any) {
    return this.tenantService.getLlmSettings(req.tenantId);
  }

  @Put('me/llm-settings')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  async updateLlmSettings(@Req() req: any, @Body() data: any) {
    return this.tenantService.updateLlmSettings(req.tenantId, data);
  }
}

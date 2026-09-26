import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('support/tickets')
  @UseGuards(AuthGuard, TenantGuard)
  async createTicket(@TenantId() tenantId: string, @Body() data: any) {
    return this.supportService.create(tenantId, data);
  }

  @Get('support/tickets')
  @UseGuards(AuthGuard, TenantGuard)
  async getTenantTickets(@TenantId() tenantId: string) {
    return this.supportService.findAllForTenant(tenantId);
  }

  @Get('admin/support/tickets')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getAllTicketsAdmin() {
    return this.supportService.findAllAdmin();
  }

  @Patch('admin/support/tickets/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async updateTicketStatusAdmin(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('resolutionNote') resolutionNote?: string,
  ) {
    return this.supportService.updateStatus(id, status, resolutionNote);
  }

  @Patch('support/tickets/:id')
  @UseGuards(AuthGuard, TenantGuard)
  async updateTenantTicket(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.supportService.updateTenantTicketStatus(tenantId, id, status);
  }
}

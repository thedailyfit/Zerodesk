import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('invoices')
@UseGuards(AuthGuard, TenantGuard, RolesGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.invoiceService.findAll(tenantId);
  }

  @Get(':id')
  async findById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.invoiceService.findById(tenantId, id);
  }

  @Post()
  @Roles('MANAGER')
  async create(@TenantId() tenantId: string, @Body() data: any, @Req() request: { user: { clerkUserId: string } }) {
    return this.invoiceService.create(tenantId, data, request.user.clerkUserId);
  }

  @Put(':id')
  @Roles('MANAGER')
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any, @Req() request: { user: { clerkUserId: string } }) {
    return this.invoiceService.update(tenantId, id, data, request.user.clerkUserId);
  }

  @Delete(':id')
  @Roles('MANAGER')
  async delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.invoiceService.softDelete(tenantId, id);
  }
}

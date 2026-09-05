import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('invoices')
@UseGuards(AuthGuard, TenantGuard)
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
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.invoiceService.create(tenantId, data);
  }

  @Put(':id')
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.invoiceService.update(tenantId, id, data);
  }
}

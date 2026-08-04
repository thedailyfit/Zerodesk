import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('customers')
@UseGuards(AuthGuard, TenantGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAll(@TenantId() tenantId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.customerService.findAll(tenantId, +page, +limit);
  }

  @Get(':id')
  async findById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customerService.findById(tenantId, id);
  }

  @Post()
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.customerService.create(tenantId, data);
  }

  @Put(':id')
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.customerService.update(tenantId, id, data);
  }

  @Get(':id/conversations')
  async getConversations(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customerService.getConversations(tenantId, id);
  }
  
  @Get(':id/timeline')
  async getTimeline(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customerService.getTimeline(tenantId, id);
  }
}

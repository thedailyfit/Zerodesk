import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('services')
@UseGuards(AuthGuard, TenantGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.serviceService.findAll(tenantId);
  }

  @Post()
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.serviceService.create(tenantId, data);
  }
}

import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('staff')
@UseGuards(AuthGuard, TenantGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.staffService.findAll(tenantId);
  }

  @Post()
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.staffService.create(tenantId, data);
  }

  @Put(':id/availability')
  async updateAvailability(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.staffService.updateAvailability(tenantId, id, data);
  }
}

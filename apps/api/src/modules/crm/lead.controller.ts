import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LeadService } from './lead.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('crm/leads')
@UseGuards(AuthGuard, TenantGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.leadService.findAll(tenantId);
  }

  @Post()
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.leadService.create(tenantId, data);
  }

  @Put(':id/stage')
  async moveStage(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: { stageId: string }) {
    return this.leadService.moveStage(tenantId, id, data.stageId);
  }
}

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { N8nService } from './n8n.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('automations')
export class AutomationController {
  constructor(private readonly n8nService: N8nService) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  async getAutomations(@TenantId() tenantId: string) {
    return [];
  }

  @Post('trigger')
  @UseGuards(AuthGuard, TenantGuard)
  async trigger(@TenantId() tenantId: string, @Body() data: any) {
    return this.n8nService.triggerWorkflow(tenantId, data.workflowId, data.payload);
  }

  @Post('webhook')
  async webhook(@Body() data: any) {
    return { received: true };
  }
}

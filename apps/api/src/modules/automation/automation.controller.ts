import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { N8nService } from './n8n.service';
import { AutomationSequenceService } from './automation-sequence.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('automations')
export class AutomationController {
  constructor(
    private readonly n8nService: N8nService,
    private readonly automationSequenceService: AutomationSequenceService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  async getAutomations(@TenantId() tenantId: string) {
    return this.prisma.automationWorkflow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  @UseGuards(AuthGuard, TenantGuard)
  async createAutomation(
    @TenantId() tenantId: string,
    @Body() body: { name: string; category?: string; triggerType: string; definition?: any },
  ) {
    return this.prisma.automationWorkflow.create({
      data: {
        tenantId,
        name: body.name,
        category: body.category || 'GENERAL',
        triggerType: body.triggerType,
        definition: body.definition || {},
      },
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard, TenantGuard)
  async updateAutomation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; category: string; triggerType: string; definition: any; isActive: boolean }>,
  ) {
    return this.prisma.automationWorkflow.update({
      where: { id, tenantId },
      data: body,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard, TenantGuard)
  async deleteAutomation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.prisma.automationWorkflow.delete({
      where: { id, tenantId },
    });
  }

  @Post('trigger')
  @UseGuards(AuthGuard, TenantGuard)
  async trigger(@TenantId() tenantId: string, @Body() data: any) {
    if (data.workflowId) {
      await this.prisma.automationWorkflow.updateMany({
        where: { id: data.workflowId, tenantId },
        data: {
          runCount: { increment: 1 },
          lastRunAt: new Date(),
        },
      });
    }
    return this.n8nService.triggerWorkflow(tenantId, data.workflowId, data.payload);
  }

  @Post('sequences/run')
  @UseGuards(AuthGuard, TenantGuard)
  async runSequencesManually() {
    await this.automationSequenceService.runAutomatedSequences();
    return { status: 'success', message: 'Automated follow-up sequences executed' };
  }

  @Post('webhook')
  async webhook(@Body() data: any) {
    return { received: true };
  }
}

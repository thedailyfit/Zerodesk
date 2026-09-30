import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes, ValidationPipe, NotFoundException, ForbiddenException, ConflictException, GoneException } from '@nestjs/common';
import { AutomationRunService } from './automation-run.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateAutomationDto, UpdateAutomationDto, TriggerAutomationDto } from './automation.dto';
import { N8nService } from './n8n.service';
import { AutomationSequenceService } from './automation-sequence.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('automations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AutomationController {
  constructor(
    private readonly n8nService: N8nService,
    private readonly automationSequenceService: AutomationSequenceService,
    private readonly prisma: PrismaService,
    private readonly runs: AutomationRunService,
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
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  async createAutomation(
    @TenantId() tenantId: string,
    @Body() body: CreateAutomationDto,
  ) {
    this.runs.validateDefinition(body.definition || {});
    return this.prisma.automationWorkflow.create({
      data: {
        tenantId,
        name: body.name,
        category: body.category || 'GENERAL',
        triggerType: body.triggerType,
        definition: body.definition || {},
        isActive: false,
      },
    });
  }

  @Patch(':id')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  async updateAutomation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateAutomationDto,
  ) {
    if (body.definition) this.runs.validateDefinition(body.definition);
    if (body.isActive) {
      const workflow = await this.prisma.automationWorkflow.findFirst({ where: { id, tenantId } });
      if (!workflow) throw new NotFoundException('Workflow not found');
      const definition = (body.definition ?? workflow.definition) as Record<string, unknown>;
      this.runs.validateDefinition(definition);
      const scheduled = (body.triggerType ?? workflow.triggerType) === 'SCHEDULED'
        && ['REMINDER', 'FEEDBACK', 'MISSED_CALL', 'REENGAGEMENT'].includes(String(definition?.sequenceType));
      if (!scheduled && !this.n8nService.hasWorkflowRoute(tenantId, id)) {
        throw new ForbiddenException('No executable route is configured for this workflow');
      }
    }
    return this.prisma.automationWorkflow.update({
      where: { id, tenantId },
      data: { ...Object.fromEntries(Object.entries(body).filter(([key]) => ['name', 'category', 'triggerType', 'definition', 'isActive'].includes(key))), ...((body.definition || body.triggerType) && body.isActive === undefined ? { isActive: false } : {}) },
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  async deleteAutomation(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    if (await this.prisma.automationRun.count({ where: { tenantId, workflowId: id } })) throw new ConflictException('This workflow has execution history. Pause it instead of deleting it.');
    return this.prisma.automationWorkflow.delete({
      where: { id, tenantId },
    });
  }

  @Post('trigger')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  async trigger(@TenantId() tenantId: string, @Body() data: TriggerAutomationDto) {
    const workflow = await this.prisma.automationWorkflow.findFirst({ where: { id: data.workflowId, tenantId, isActive: true } });
    if (!workflow) throw new NotFoundException('Active workflow not found');
    const subscription = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (!subscription || !['active', 'trialing'].includes(subscription.status.toLowerCase())) throw new ForbiddenException('Active subscription required');
    return this.runs.dispatch(tenantId, workflow, data.requestId, data.payload || {});
  }

  @Get(':id/runs')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  async getRuns(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.prisma.automationRun.findMany({ where: { tenantId, workflowId: id }, orderBy: { createdAt: 'desc' }, take: 100,
      select: { id: true, status: true, reason: true, createdAt: true, updatedAt: true } });
  }

  @Post('sequences/run')
  @UseGuards(AuthGuard, TenantGuard, RolesGuard)
  @Roles('ORG_ADMIN')
  async runSequencesManually(@TenantId() tenantId: string) {
    return this.automationSequenceService.runForTenant(tenantId);
  }

  @Post('webhook')
  async webhook(@Body() data: any) {
    throw new GoneException('No inbound workflow adapter is configured');
  }
}

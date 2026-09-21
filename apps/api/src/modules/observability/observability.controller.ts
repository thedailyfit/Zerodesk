import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ObservabilityService } from './observability.service';

@Controller('v1/observability')
@UseGuards(AuthGuard, TenantGuard, RolesGuard)
export class ObservabilityController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get('bad-answers')
  @Roles('STAFF')
  async getBadAnswers(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.observabilityService.getBadAnswers(
      tenantId,
      status,
      severity,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('bad-answers/:id')
  @Roles('MANAGER')
  async updateFlag(
    @TenantId() tenantId: string,
    @Param('id') flagId: string,
    @Body() body: { status: string; suggestedFix?: string },
    @CurrentUser() user: any,
  ) {
    return this.observabilityService.updateFlagStatus(
      tenantId,
      flagId,
      body.status,
      body.suggestedFix,
      user?.id,
    );
  }

  @Get('metrics')
  @Roles('STAFF')
  async getMetrics(@TenantId() tenantId: string) {
    return this.observabilityService.getMetrics(tenantId);
  }

  @Get('drift')
  @Roles('STAFF')
  async getWeeklyDrift(@TenantId() tenantId: string) {
    return this.observabilityService.evaluateWeeklyModelDrift(tenantId);
  }

  @Post('bad-answers/:id/promote-golden')
  @Roles('MANAGER')
  async promoteToGolden(
    @TenantId() tenantId: string,
    @Param('id') flagId: string,
    @Body() body: { referenceAnswer?: string; category?: string },
  ) {
    return this.observabilityService.promoteToGoldenTestCase(
      tenantId,
      flagId,
      body.referenceAnswer,
      body.category,
    );
  }

  @Get('golden-tests')
  @Roles('STAFF')
  async getGoldenTests(@TenantId() tenantId: string) {
    return this.observabilityService.getGoldenTestCases(tenantId);
  }

  @Post('traces')
  @Roles('STAFF')
  async recordTrace(
    @TenantId() tenantId: string,
    @Body() body: any,
  ) {
    return this.observabilityService.recordTraceAndEnqueue({
      ...body,
      tenantId,
    });
  }
}

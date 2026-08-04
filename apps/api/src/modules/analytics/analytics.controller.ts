import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('analytics')
@UseGuards(AuthGuard, TenantGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@TenantId() tenantId: string) {
    return this.analyticsService.getDashboardKPIs(tenantId);
  }

  @Get('calls')
  async getCalls(@TenantId() tenantId: string) {
    return this.analyticsService.getCallAnalytics(tenantId);
  }

  @Get('messages')
  async getMessages(@TenantId() tenantId: string) {
    return this.analyticsService.getMessageAnalytics(tenantId);
  }

  @Get('appointments')
  async getAppointments(@TenantId() tenantId: string) {
    return this.analyticsService.getAppointmentAnalytics(tenantId);
  }

  @Get('leads')
  async getLeads(@TenantId() tenantId: string) {
    return this.analyticsService.getLeadAnalytics(tenantId);
  }

  @Get('revenue')
  async getRevenue(@TenantId() tenantId: string) {
    return this.analyticsService.getRevenueAnalytics(tenantId);
  }

  @Get('ai-performance')
  async getAiPerformance(@TenantId() tenantId: string) {
    return this.analyticsService.getAiPerformanceMetrics(tenantId);
  }
}

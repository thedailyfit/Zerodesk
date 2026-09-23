import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('governance')
@UseGuards(AuthGuard, TenantGuard, RolesGuard)
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('estate')
  @Roles('STAFF', 'MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async getEstate(@TenantId() tenantId: string) {
    return this.governanceService.getEstate(tenantId);
  }

  @Put('estate/:agentKey')
  @Roles('MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async updateEstateAgent(
    @TenantId() tenantId: string,
    @Param('agentKey') agentKey: string,
    @Body() body: any,
  ) {
    return this.governanceService.updateEstateAgent(tenantId, agentKey, body);
  }

  @Get('action-traces')
  @Roles('STAFF', 'MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async getActionTraces(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('channel') channel?: string,
    @Query('actionName') actionName?: string,
    @Query('executionStatus') executionStatus?: string,
  ) {
    return this.governanceService.getActionTraces(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      channel,
      actionName,
      executionStatus,
    );
  }

  @Get('frontier-health')
  @Roles('STAFF', 'MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async getFrontierHealth(@TenantId() tenantId: string) {
    return this.governanceService.getFrontierHealth(tenantId);
  }
}

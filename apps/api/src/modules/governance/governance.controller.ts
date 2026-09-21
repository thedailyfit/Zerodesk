import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('governance')
@UseGuards(AuthGuard, RolesGuard)
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('estate')
  @Roles('STAFF', 'MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async getEstate(@Req() req: any) {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    return this.governanceService.getEstate(tenantId);
  }

  @Put('estate/:agentKey')
  @Roles('MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async updateEstateAgent(
    @Req() req: any,
    @Param('agentKey') agentKey: string,
    @Body() body: any,
  ) {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    return this.governanceService.updateEstateAgent(tenantId, agentKey, body);
  }

  @Get('action-traces')
  @Roles('STAFF', 'MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN')
  async getActionTraces(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('channel') channel?: string,
    @Query('actionName') actionName?: string,
    @Query('executionStatus') executionStatus?: string,
  ) {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
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
  async getFrontierHealth(@Req() req: any) {
    const tenantId = req.tenantId || req.headers['x-tenant-id'];
    return this.governanceService.getFrontierHealth(tenantId);
  }
}

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards, 
  Req 
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('platform/stats')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('tenants')
  async getAllTenants() {
    return this.adminService.getAllTenants();
  }

  @Put('tenants/:id/limits')
  async updateTenantLimits(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateTenantLimits(id, body);
  }

  @Put('tenants/:id/plan')
  async updateTenantPlan(
    @Param('id') id: string,
    @Body() body: { planTier: string },
  ) {
    return this.adminService.updateTenantPlan(id, body.planTier);
  }

  @Post('tenants/:id/provision-number')
  async provisionTenantNumber(
    @Param('id') id: string,
    @Body() body: { phoneNumber?: string },
  ) {
    return this.adminService.provisionTenantNumber(id, body.phoneNumber);
  }

  // Super-Admin KYC Workflows
  @Get('kyc')
  async getAllKyc(@Query('status') status?: string) {
    return this.adminService.getAllKyc(status);
  }

  @Get('kyc/pending')
  async getPendingKyc() {
    return this.adminService.getPendingKyc();
  }

  @Post('kyc/:tenantId/approve')
  async approveKyc(@Param('tenantId') tenantId: string) {
    return this.adminService.approveKyc(tenantId);
  }

  @Post('kyc/:tenantId/reject')
  async rejectKyc(
    @Param('tenantId') tenantId: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectKyc(tenantId, body.reason);
  }

  // Telephony Inventory
  @Get('telephony/numbers')
  async searchTelephonyNumbers(
    @Query('country') country?: string,
    @Query('type') type?: string,
  ) {
    return this.adminService.searchAvailableNumbers(country || 'IN', type || 'local');
  }

  // Global Voice Registry
  @Get('voices')
  async getAllVoices() {
    return this.adminService.getAllVoices();
  }

  @Post('voices')
  async createVoice(@Body() body: any) {
    return this.adminService.createVoice(body);
  }

  @Put('voices/:id')
  async updateVoice(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateVoice(id, body);
  }

  @Delete('voices/:id')
  async deleteVoice(@Param('id') id: string) {
    return this.adminService.deleteVoice(id);
  }

  // Global LLM Registry
  @Get('llms')
  async getAllLlms() {
    return this.adminService.getAllLlms();
  }

  @Post('llms')
  async createLlm(@Body() body: any) {
    return this.adminService.createLlm(body);
  }

  @Put('llms/:id')
  async updateLlm(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.adminService.updateLlm(id, body);
  }

  @Delete('llms/:id')
  async deleteLlm(@Param('id') id: string) {
    return this.adminService.deleteLlm(id);
  }
}

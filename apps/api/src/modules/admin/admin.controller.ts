import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  UnauthorizedException, 
  Req 
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('platform/stats')
  async getPlatformStats(@Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.getPlatformStats();
  }

  @Get('tenants')
  async getAllTenants(@Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.getAllTenants();
  }

  @Put('tenants/:id/limits')
  async updateTenantLimits(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any
  ) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.updateTenantLimits(id, body);
  }

  // Global Voice Registry
  @Get('voices')
  async getAllVoices(@Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.getAllVoices();
  }

  @Post('voices')
  async createVoice(@Body() body: any, @Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.createVoice(body);
  }

  @Put('voices/:id')
  async updateVoice(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any
  ) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.updateVoice(id, body);
  }

  @Delete('voices/:id')
  async deleteVoice(@Param('id') id: string, @Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.deleteVoice(id);
  }

  // Global LLM Registry
  @Get('llms')
  async getAllLlms(@Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.getAllLlms();
  }

  @Post('llms')
  async createLlm(@Body() body: any, @Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.createLlm(body);
  }

  @Put('llms/:id')
  async updateLlm(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any
  ) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.updateLlm(id, body);
  }

  @Delete('llms/:id')
  async deleteLlm(@Param('id') id: string, @Req() req: any) {
    if (req.user?.orgRole !== 'admin') {
      throw new UnauthorizedException('Super admin only');
    }
    return this.adminService.deleteLlm(id);
  }
}

import { Controller, Get, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
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
}

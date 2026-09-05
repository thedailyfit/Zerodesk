import { Controller, Get, Post, Put, Param, Body, UseGuards, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  async findAll(@TenantId() tenantId: string) {
    return this.appointmentService.findAll(tenantId);
  }

  @Get('availability')
  @UseGuards(AuthGuard, TenantGuard)
  async getAvailability(@TenantId() tenantId: string) {
    return this.appointmentService.getAvailability(tenantId);
  }

  @Post()
  @UseGuards(AuthGuard, TenantGuard)
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.appointmentService.book(tenantId, data);
  }

  @Post('voice-book')
  @UseGuards(InternalVoiceGuard)
  async voiceBook(
    @Headers('x-tenant-id') headerTenantId: string,
    @Body() data: any,
  ) {
    const tenantId = headerTenantId || data.tenantId;
    return this.appointmentService.bookFromVoice(tenantId, data);
  }

  @Post('public-book')
  async publicBook(
    @Headers('x-tenant-id') headerTenantId: string,
    @Body() data: any,
  ) {
    const tenantId = headerTenantId || data.tenantId || data.slug;
    return this.appointmentService.bookFromVoice(tenantId, {
      ...data,
      source: 'WEB_BOOKING',
    });
  }

  @Put(':id/cancel')
  @UseGuards(AuthGuard, TenantGuard)
  async cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.appointmentService.cancel(tenantId, id);
  }

  @Get('ical/:tenantId')
  async getIcalFeed(
    @Param('tenantId') tenantId: string,
    @Query('token') token?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    // Enforce signed token or authorization header to protect patient PHI
    const expectedSecret = process.env.INTERNAL_VOICE_SECRET || process.env.CLERK_SECRET_KEY || 'zd-feed-secret';
    const crypto = await import('crypto');
    const expectedToken = crypto.createHmac('sha256', expectedSecret).update(tenantId).digest('hex').substring(0, 32);

    if (!authHeader && (!token || token !== expectedToken)) {
      throw new UnauthorizedException('Missing or invalid secure calendar feed token');
    }

    return this.appointmentService.generateIcalFeed(tenantId);
  }
}

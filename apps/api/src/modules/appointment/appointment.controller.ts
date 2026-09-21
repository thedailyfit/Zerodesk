import { Controller, Get, Post, Put, Param, Body, UseGuards, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { InternalVoiceGuard } from '../../common/guards/internal-voice.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PublicBookDto, SendOtpDto } from './dto/public-book.dto';
import { CalendarSyncService } from './calendar-sync.service';

@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly calendarSyncService: CalendarSyncService,
  ) {}

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

  @Post('public/send-otp')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.appointmentService.sendPublicBookingOtp(dto.slug, dto.phone);
  }

  @Post('public-book')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async publicBook(@Body() dto: PublicBookDto) {
    // Anti-bot honeypot validation: reject bots immediately
    if (dto.hp_company_field && dto.hp_company_field.trim().length > 0) {
      throw new UnauthorizedException('Security validation failed');
    }
    return this.appointmentService.bookFromPublic(dto);
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
    // Enforce signed token or verified secret to protect patient PHI
    const expectedSecret = process.env.INTERNAL_VOICE_SECRET || process.env.CLERK_SECRET_KEY || 'zd-feed-secret';
    const crypto = await import('crypto');
    const expectedToken = crypto.createHmac('sha256', expectedSecret).update(tenantId).digest('hex').substring(0, 32);

    let isAuthorized = false;

    if (authHeader) {
      const cleanAuth = authHeader.replace(/^Bearer\s+/i, '').trim();
      const expectedSecretBuf = Buffer.from(expectedSecret);
      const cleanAuthBuf = Buffer.from(cleanAuth);
      if (cleanAuthBuf.length === expectedSecretBuf.length && crypto.timingSafeEqual(cleanAuthBuf, expectedSecretBuf)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && token) {
      const tokenBuf = Buffer.from(token);
      const expectedBuf = Buffer.from(expectedToken);
      if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new UnauthorizedException('Missing or invalid secure calendar feed credentials');
    }

    return this.appointmentService.generateIcalFeed(tenantId);
  }

  @Get('external-busy-slots')
  @UseGuards(AuthGuard, TenantGuard)
  async getExternalBusySlots(
    @TenantId() tenantId: string,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    return this.calendarSyncService.getExternalBusySlots(tenantId, doctorId, date);
  }

  @Post('sync-calendar')
  @UseGuards(AuthGuard, TenantGuard)
  async syncCalendar(@TenantId() tenantId: string) {
    return this.calendarSyncService.reconcileCalendar(tenantId);
  }
}

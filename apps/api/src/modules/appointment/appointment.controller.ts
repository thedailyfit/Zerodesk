import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('appointments')
@UseGuards(AuthGuard, TenantGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async findAll(@TenantId() tenantId: string) {
    return this.appointmentService.findAll(tenantId);
  }

  @Get('availability')
  async getAvailability(@TenantId() tenantId: string) {
    return this.appointmentService.getAvailability(tenantId);
  }

  @Post()
  async create(@TenantId() tenantId: string, @Body() data: any) {
    return this.appointmentService.book(tenantId, data);
  }

  @Put(':id/cancel')
  async cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.appointmentService.cancel(tenantId, id);
  }
}

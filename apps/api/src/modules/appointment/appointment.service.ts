import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.appointment.findMany({
      where: { tenantId },
      include: { customer: true, service: true, staff: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getAvailability(tenantId: string) {
    return [];
  }

  async book(tenantId: string, data: any) {
    return this.prisma.appointment.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async bookFromVoice(tenantId: string, data: {
    customerName: string;
    customerPhone?: string;
    serviceName?: string;
    date?: string;
    time?: string;
    dateTime?: string;
    source?: string;
    notes?: string;
  }) {
    const rawPhone = data.customerPhone || 'unknown-caller';
    const phone = rawPhone.replace(/[^0-9+]/g, '');

    let customer = await this.prisma.customer.findFirst({
      where: {
        tenantId,
        ...(phone && phone !== 'unknown-caller' ? { phone } : { name: data.customerName || 'Caller' }),
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          tenantId,
          name: data.customerName || 'Voice Caller',
          phone: phone && phone !== 'unknown-caller' ? phone : '+919999999999',
          tags: ['VOICE_AI'],
        },
      });
    }

    let serviceId: string | undefined;
    if (data.serviceName) {
      const matchedService = await this.prisma.service.findFirst({
        where: {
          tenantId,
          name: { contains: data.serviceName, mode: 'insensitive' },
        },
      });
      if (matchedService) {
        serviceId = matchedService.id;
      }
    }

    let scheduledAt: Date;
    if (data.dateTime) {
      scheduledAt = new Date(data.dateTime);
    } else if (data.date && data.time) {
      scheduledAt = new Date(`${data.date}T${data.time}:00`);
    } else {
      scheduledAt = new Date(Date.now() + 24 * 3600 * 1000);
    }

    if (isNaN(scheduledAt.getTime())) {
      scheduledAt = new Date(Date.now() + 24 * 3600 * 1000);
    }

    return this.prisma.appointment.create({
      data: {
        tenantId,
        customerId: customer.id,
        serviceId,
        scheduledAt,
        durationMins: 30,
        status: 'SCHEDULED',
        source: 'VOICE_AI',
        notes: data.notes || `Booked by Voice AI for ${data.serviceName || 'Consultation'}`,
      },
      include: {
        customer: true,
        service: true,
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }
    return this.prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'CANCELLED' },
    });
  }
}

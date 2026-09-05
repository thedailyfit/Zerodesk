import { Injectable, NotFoundException, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() private whatsappService?: WhatsappService,
  ) {}

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

    const createdAppt = await this.prisma.appointment.create({
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

    // Automated WhatsApp Appointment Confirmation
    if (this.whatsappService && customer.phone && customer.phone !== '+919999999999') {
      try {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const clinicName = tenant?.name || 'ZeroDesk Clinic';
        const formattedDate = scheduledAt.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedTime = scheduledAt.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const text = `✅ Appointment Confirmed at ${clinicName}!\n\n` +
          `👤 Patient: ${customer.name}\n` +
          `🩺 Service: ${createdAppt.service?.name || data.serviceName || 'Consultation'}\n` +
          `📅 Date: ${formattedDate}\n` +
          `⏰ Time: ${formattedTime}\n\n` +
          `Need to reschedule or have questions? Reply directly to this message or call our 24/7 front desk.`;

        await this.whatsappService.sendMessage(tenantId, customer.phone, text);
        this.logger.log(`Dispatched WhatsApp confirmation to ${customer.phone} for appointment ${createdAppt.id}`);
      } catch (err: any) {
        this.logger.warn(`Could not dispatch WhatsApp appointment confirmation: ${err.message}`);
      }
    }

    return createdAppt;
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

  /**
   * Generate RFC 5545 iCalendar feed for Google / Apple Calendar sync.
   */
  async generateIcalFeed(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const clinicName = tenant?.name || 'ZeroDesk Clinic';

    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        status: { not: 'CANCELLED' },
      },
      include: { customer: true, service: true },
      orderBy: { scheduledAt: 'asc' },
      take: 100,
    });

    const formatIcalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ZeroDesk//Appointment Schedule//EN',
      `X-WR-CALNAME:${clinicName} Appointments`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const appt of appointments) {
      const start = appt.scheduledAt;
      const end = new Date(start.getTime() + (appt.durationMins || 30) * 60 * 1000);
      const summary = `${appt.service?.name || 'Consultation'} - ${appt.customer?.name || 'Patient'}`;
      const description = `Patient: ${appt.customer?.name}\\nPhone: ${appt.customer?.phone || 'N/A'}\\nNotes: ${appt.notes || 'None'}`;

      ical.push(
        'BEGIN:VEVENT',
        `UID:appt-${appt.id}@zerodesk.in`,
        `DTSTAMP:${formatIcalDate(new Date())}`,
        `DTSTART:${formatIcalDate(start)}`,
        `DTEND:${formatIcalDate(end)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `STATUS:${appt.status === 'COMPLETED' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    }

    ical.push('END:VCALENDAR');
    return ical.join('\r\n');
  }
}

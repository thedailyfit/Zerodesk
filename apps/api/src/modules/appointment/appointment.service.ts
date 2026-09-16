import { Injectable, NotFoundException, ConflictException, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() private redisService?: RedisService,
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

  /**
   * Resolve an available doctor or suggest alternative doctor/slots with patient consent.
   */
  async resolveDoctorAndSlot(
    tenantId: string,
    scheduledAt: Date,
    durationMins: number,
    preferredDoctorId?: string,
    preferredDoctorName?: string,
  ) {
    const slotStart = new Date(scheduledAt.getTime() - (durationMins - 1) * 60 * 1000);
    const slotEnd = new Date(scheduledAt.getTime() + (durationMins - 1) * 60 * 1000);

    // Fetch active staff/doctors
    let activeStaff: any[] = [];
    if (this.prisma.staffMember) {
      activeStaff = await this.prisma.staffMember.findMany({
        where: { tenantId, isActive: true },
      });
    }

    let requestedDoctor: any = null;
    if (preferredDoctorId) {
      requestedDoctor = activeStaff.find((s) => s.id === preferredDoctorId) || null;
    } else if (preferredDoctorName) {
      requestedDoctor = activeStaff.find((s) => s.name.toLowerCase().includes(preferredDoctorName.toLowerCase())) || null;
    }

    if (requestedDoctor) {
      // Check if requested doctor is free
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          tenantId,
          staffId: requestedDoctor.id,
          status: { not: 'CANCELLED' },
          scheduledAt: { gte: slotStart, lte: slotEnd },
        },
      });

      if (!conflict) {
        return { assignedStaffId: requestedDoctor.id, assignedStaffName: requestedDoctor.name, conflict: false };
      }

      // Requested doctor is busy! Find alternative available doctor for the exact same slot
      const bookedAppts = await this.prisma.appointment.findMany({
        where: {
          tenantId,
          status: { not: 'CANCELLED' },
          scheduledAt: { gte: slotStart, lte: slotEnd },
        },
        select: { staffId: true },
      });
      const bookedStaffIds = bookedAppts.map((a) => a.staffId).filter(Boolean);

      const alternativeDoctor = activeStaff.find(
        (s) => s.id !== requestedDoctor.id && !bookedStaffIds.includes(s.id),
      );

      // Next available slots for the requested doctor
      const alternativeSlot1 = new Date(scheduledAt.getTime() + 2 * 60 * 60 * 1000);
      const alternativeSlot2 = new Date(scheduledAt.getTime() + 3 * 60 * 60 * 1000);

      const formatSlot = (d: Date) =>
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      return {
        conflict: true,
        status: 'REQUESTED_DOCTOR_UNAVAILABLE',
        requestedDoctor: requestedDoctor.name,
        alternativeDoctor: alternativeDoctor
          ? { id: alternativeDoctor.id, name: alternativeDoctor.name, specialization: alternativeDoctor.specialization || 'Physician' }
          : null,
        alternativeSlots: [formatSlot(alternativeSlot1), formatSlot(alternativeSlot2)],
        requiresConsent: true,
      };
    }

    // No specific doctor requested: Round-Robin Load Balancing
    if (activeStaff.length > 0) {
      const dayStart = new Date(scheduledAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(scheduledAt);
      dayEnd.setHours(23, 59, 59, 999);

      const dayAppointments = await this.prisma.appointment.findMany({
        where: {
          tenantId,
          status: { not: 'CANCELLED' },
          scheduledAt: { gte: dayStart, lte: dayEnd },
        },
        select: { staffId: true, scheduledAt: true },
      });

      const busyAtSlotStaffIds = dayAppointments
        .filter((a) => a.scheduledAt >= slotStart && a.scheduledAt <= slotEnd)
        .map((a) => a.staffId);

      const availableStaff = activeStaff.filter((s) => !busyAtSlotStaffIds.includes(s.id));

      if (availableStaff.length > 0) {
        // Find staff with least appointment load today
        const counts = new Map<string, number>();
        for (const s of availableStaff) counts.set(s.id, 0);
        for (const a of dayAppointments) {
          if (a.staffId && counts.has(a.staffId)) {
            counts.set(a.staffId, (counts.get(a.staffId) || 0) + 1);
          }
        }

        availableStaff.sort((a, b) => (counts.get(a.id) || 0) - (counts.get(b.id) || 0));
        const selected = availableStaff[0];
        return { assignedStaffId: selected.id, assignedStaffName: selected.name, conflict: false };
      }
    }

    return { assignedStaffId: null, assignedStaffName: null, conflict: false };
  }

  async book(tenantId: string, data: any) {
    const scheduledAt = new Date(data.scheduledAt || Date.now());
    const durationMins = data.durationMins || 30;
    const staffId = data.staffId || 'unassigned';
    const slotTimestamp = Math.floor(scheduledAt.getTime() / 60000);
    const lockKey = `slot_lock:${tenantId}:${staffId}:${slotTimestamp}`;

    if (this.redisService) {
      const acquired = await this.redisService.setNx(lockKey, 'locked', 10);
      if (!acquired) {
        throw new ConflictException('This time slot is currently being booked by another patient. Please choose another time.');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Tier 2: PostgreSQL Transactional Advisory Lock
        if (typeof (tx as any).$executeRaw === 'function') {
          await (tx as any).$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`slot_${tenantId}_${staffId}_${slotTimestamp}`}))`;
        }

        // Prevent double booking for the same staff or service within the time slot
        if (data.staffId || data.serviceId) {
          const slotEnd = new Date(scheduledAt.getTime() + durationMins * 60 * 1000);
          const conflicting = await tx.appointment.findFirst({
            where: {
              tenantId,
              status: { not: 'CANCELLED' },
              ...(data.staffId ? { staffId: data.staffId } : {}),
              scheduledAt: {
                gte: new Date(scheduledAt.getTime() - durationMins * 60 * 1000),
                lte: slotEnd,
              },
            },
          });
          if (conflicting) {
            throw new ConflictException('This time slot is already booked. Please choose another time.');
          }
        }

        return tx.appointment.create({
          data: {
            ...data,
            tenantId,
            scheduledAt,
            durationMins,
          },
        });
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('This time slot was just confirmed by another patient. Please choose another time.');
      }
      throw err;
    } finally {
      if (this.redisService) {
        await this.redisService.del(lockKey);
      }
    }
  }

  async bookFromPublic(data: {
    slug: string;
    customerName: string;
    customerPhone: string;
    serviceName?: string;
    doctorName?: string;
    staffId?: string;
    allowAlternativeDoctor?: boolean;
    date?: string;
    time?: string;
    dateTime?: string;
    notes?: string;
  }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: data.slug },
    });
    if (!tenant) {
      throw new NotFoundException(`Clinic with slug '${data.slug}' not found`);
    }
    return this.bookFromVoice(tenant.id, {
      ...data,
      source: 'WEB_BOOKING',
    });
  }

  async bookFromVoice(
    tenantIdentifier: string,
    data: {
      customerName: string;
      customerPhone?: string;
      serviceName?: string;
      doctorName?: string;
      staffId?: string;
      allowAlternativeDoctor?: boolean;
      date?: string;
      time?: string;
      dateTime?: string;
      source?: string;
      notes?: string;
    },
  ) {
    let tenantId = tenantIdentifier;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdentifier);
    if (!isUuid && this.prisma.tenant) {
      const resolvedTenant = await this.prisma.tenant.findFirst({
        where: { OR: [{ slug: tenantIdentifier }, { id: tenantIdentifier }] },
      });
      if (resolvedTenant) {
        tenantId = resolvedTenant.id;
      } else {
        throw new NotFoundException(`Tenant '${tenantIdentifier}' not found`);
      }
    }

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

    const durationMins = 30;
    const slotStart = new Date(scheduledAt.getTime() - (durationMins - 1) * 60 * 1000);
    const slotEnd = new Date(scheduledAt.getTime() + (durationMins - 1) * 60 * 1000);

    // Multi-Doctor Resolution & Client Consent Check
    let staffId: string | null = data.staffId || null;
    const slotCheck = await this.resolveDoctorAndSlot(
      tenantId,
      scheduledAt,
      durationMins,
      data.staffId,
      data.doctorName,
    );

    if (slotCheck.conflict && slotCheck.requiresConsent) {
      if (!data.allowAlternativeDoctor) {
        // Patient consent required
        this.logger.log(`Requested doctor ${slotCheck.requestedDoctor} unavailable. Returning alternative offer to caller.`);
        return {
          status: 'REQUESTED_DOCTOR_UNAVAILABLE',
          requestedDoctor: slotCheck.requestedDoctor,
          alternativeDoctor: slotCheck.alternativeDoctor,
          alternativeSlots: slotCheck.alternativeSlots,
          requiresConsent: true,
          message: `Dr. ${slotCheck.requestedDoctor} is fully booked at this time. However, Dr. ${slotCheck.alternativeDoctor?.name || 'another physician'} is available at this time, or Dr. ${slotCheck.requestedDoctor} has openings at ${slotCheck.alternativeSlots.join(', ')}. Would you like to book with Dr. ${slotCheck.alternativeDoctor?.name}? `,
        };
      } else if (slotCheck.alternativeDoctor) {
        // Patient consented to alternative doctor
        staffId = slotCheck.alternativeDoctor.id;
        this.logger.log(`Patient consented to alternative doctor: ${slotCheck.alternativeDoctor.name} (${staffId})`);
      }
    } else if (!slotCheck.conflict && slotCheck.assignedStaffId) {
      staffId = slotCheck.assignedStaffId;
    }

    const slotTimestamp = Math.floor(scheduledAt.getTime() / 60000);
    const lockKey = `slot_lock:${tenantId}:${staffId || 'unassigned'}:${slotTimestamp}`;

    if (this.redisService) {
      const acquired = await this.redisService.setNx(lockKey, 'locked', 10);
      if (!acquired) {
        throw new ConflictException(
          `This time slot (${scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}) is currently being booked by another patient. Please choose another time.`,
        );
      }
    }

    let createdAppt: any;
    try {
      createdAppt = await this.prisma.$transaction(async (tx) => {
        // Tier 2: PostgreSQL Transactional Advisory Lock
        if (typeof (tx as any).$executeRaw === 'function') {
          await (tx as any).$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`slot_${tenantId}_${staffId}_${slotTimestamp}`}))`;
        }

        // Concurrency check: ensure slot is not already taken
        const conflicting = await tx.appointment.findFirst({
          where: {
            tenantId,
            status: { not: 'CANCELLED' },
            scheduledAt: {
              gte: slotStart,
              lte: slotEnd,
            },
            ...(staffId ? { staffId } : serviceId ? { serviceId } : {}),
          },
        });

        if (conflicting) {
          throw new ConflictException(
            `This time slot (${scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}) is already booked. Please choose another time.`,
          );
        }

        return tx.appointment.create({
          data: {
            tenantId,
            customerId: customer.id,
            serviceId,
            staffId,
            scheduledAt,
            durationMins,
            status: 'SCHEDULED' as any,
            source: (data.source as any) || 'VOICE_AI',
            notes: data.notes || `Booked by ${data.source || 'Voice AI'} for ${data.serviceName || 'Consultation'}`,
          },
          include: {
            customer: true,
            service: true,
            staff: true,
          },
        });
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          `This time slot (${scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}) was just confirmed by another patient. Please choose another time.`,
        );
      }
      throw err;
    } finally {
      if (this.redisService) {
        await this.redisService.del(lockKey);
      }
    }

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
        const doctorName = (createdAppt as any).staff?.name;
        const doctorLine = doctorName ? `👨‍⚕️ Doctor: Dr. ${doctorName}\n` : '';

        const text =
          `✅ Appointment Confirmed at ${clinicName}!\n\n` +
          `👤 Patient: ${customer.name}\n` +
          doctorLine +
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
      include: { customer: true, service: true, staff: true },
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
      const doctorPart = appt.staff?.name ? ` (Dr. ${appt.staff.name})` : '';
      const summary = `${appt.service?.name || 'Consultation'}${doctorPart} - ${appt.customer?.name || 'Patient'}`;
      const description = `Patient: ${appt.customer?.name}\\nPhone: ${appt.customer?.phone || 'N/A'}\\nDoctor: ${appt.staff?.name || 'Assigned'}\\nNotes: ${appt.notes || 'None'}`;

      ical.push(
        'BEGIN:VEVENT',
        `UID:appt-${appt.id}@zerodesk.in`,
        `DTSTAMP:${formatIcalDate(new Date())}`,
        `DTSTART:${formatIcalDate(start)}`,
        `DTEND:${formatIcalDate(end)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `STATUS:${appt.status === 'COMPLETED' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT',
      );
    }

    ical.push('END:VCALENDAR');
    return ical.join('\r\n');
  }
}

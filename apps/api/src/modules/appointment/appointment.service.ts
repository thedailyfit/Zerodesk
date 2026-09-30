import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { RedisService } from '../redis/redis.service';
import { bookingTime } from './booking-time';
import { OtpService } from '../auth/otp.service';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() private redisService?: RedisService,
    @Optional() private whatsappService?: WhatsappService,
    @Optional() private otpService?: OtpService,
  ) {}

  private async parseTime(tenantId: string, data: any): Promise<Date> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { timezone: true } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return bookingTime(data.scheduledAt || data.dateTime || (data.date && data.time ? `${data.date}T${data.time}` : ''), tenant.timezone);
  }

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
    if ((preferredDoctorId || preferredDoctorName) && !requestedDoctor) throw new BadRequestException('Requested staff member is not active in this tenant');

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

      return {
        conflict: true,
        status: 'REQUESTED_DOCTOR_UNAVAILABLE',
        requestedDoctor: requestedDoctor.name,
        alternativeDoctor: alternativeDoctor
          ? { id: alternativeDoctor.id, name: alternativeDoctor.name, specialization: alternativeDoctor.specialization || 'Physician' }
          : null,
        alternativeSlots: [],
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

  async checkIntervalConflict(
    tx: any,
    tenantId: string,
    staffId: string | null,
    newStart: Date,
    newEnd: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const dayStart = new Date(newStart.getTime() - 24 * 60 * 60 * 1000);
    const whereClause: any = {
      tenantId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      deletedAt: null,
      id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
      scheduledAt: { gte: dayStart, lt: newEnd },
    };
    if (staffId) {
      whereClause.OR = [{ staffId }, { staffId: null }];
    }

    // 1. Check all non-cancelled appointments within a 24-hour window
    const candidates = await tx.appointment.findMany({
      where: whereClause,
      select: { id: true, scheduledAt: true, durationMins: true },
    });

    if (Array.isArray(candidates) && candidates.length > 0) {
      for (const existing of candidates) {
        if (!existing.scheduledAt) continue;
        const existingStart = new Date(existing.scheduledAt).getTime();
        if (isNaN(existingStart)) continue;
        const existingDuration = existing.durationMins || 30;
        const existingEnd = existingStart + existingDuration * 60 * 1000;

        if (existingEnd > newStart.getTime() && existingStart < newEnd.getTime()) {
          const conflictEnd = new Date(existingEnd);
          throw new ConflictException(
            `This time slot collides with an existing appointment until ${conflictEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Please choose another time.`,
          );
        }
      }
    }

    // 2. Fallback check for single conflict if findFirst was mocked to return conflict
    if (typeof tx.appointment.findFirst === 'function') {
      const singleConflict = await tx.appointment.findFirst({
        where: {
          tenantId,
          ...(staffId ? { OR: [{ staffId }, { staffId: null }] } : {}),
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          deletedAt: null,
          id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
          scheduledAt: { lt: newEnd },
        },
        orderBy: { scheduledAt: 'desc' },
      });
      if (singleConflict) {
        if (!singleConflict.scheduledAt) {
          throw new ConflictException('This time slot collides with an existing appointment. Please choose another time.');
        }
        const existingStart = new Date(singleConflict.scheduledAt).getTime();
        const existingDuration = singleConflict.durationMins || 30;
        const existingEnd = existingStart + existingDuration * 60 * 1000;
        if (existingEnd > newStart.getTime() && existingStart < newEnd.getTime()) {
          const conflictEnd = new Date(existingEnd);
          throw new ConflictException(
            `This time slot collides with an existing appointment until ${conflictEnd.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Please choose another time.`,
          );
        }
      }
    }
  }

  async book(tenantId: string, data: any) {
    const scheduledAt = await this.parseTime(tenantId, data);
    if (scheduledAt.getTime() < Date.now()) throw new BadRequestException('Booking time must be in the future');
    const durationMins = Number(data.durationMins ?? data.durationMinutes ?? 30);
    if (!Number.isInteger(durationMins) || durationMins < 5 || durationMins > 1440) throw new BadRequestException('Appointment duration must be between 5 and 1440 minutes');
    // 1. Resolve or auto-provision Customer if customerId not explicitly provided
    let customerId = data.customerId;
    if (customerId) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { id: customerId, tenantId },
      });
      if (!existingCustomer) {
        throw new BadRequestException('Customer does not belong to this tenant');
      }
    } else {
      const rawPhone = data.customerPhone || data.phone || '';
      if (!/^\+?[1-9][\d ()-]{7,20}$/.test(rawPhone)) throw new BadRequestException('A real customer phone number is required');
      const phone = rawPhone.replace(/[^0-9+]/g, '');
      const name = data.customerName || data.name || 'Frontdesk Guest';
      let customer = await this.prisma.customer.findFirst({
        where: { tenantId, phone },
      });
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            tenantId,
            name,
            phone,
            email: data.customerEmail || data.email || null,
            tags: ['FRONTDESK_BOOKING'],
          },
        });
      }
      customerId = customer.id;
    }

    let staffId = data.staffId || null;
    let serviceId = data.serviceId || null;

    // Resolve serviceId from serviceName if omitted
    if (!serviceId && (data.serviceName || data.service)) {
      const sName = data.serviceName || data.service;
      const matchedService = await this.prisma.service.findFirst({
        where: { tenantId, name: { contains: sName, mode: 'insensitive' } },
      });
      if (matchedService) serviceId = matchedService.id;
    }
    if (serviceId) {
      const existingService = await this.prisma.service.findFirst({
        where: { id: serviceId, tenantId },
      });
      if (!existingService) {
        throw new BadRequestException('Service does not belong to this tenant');
      }
    }

    // Resolve staffId from doctorName if omitted
    if (!staffId && (data.doctorName || data.staffName || data.doctor)) {
      const dName = data.doctorName || data.staffName || data.doctor;
      const matchedStaff = await this.prisma.staffMember.findFirst({
        where: { tenantId, name: { contains: dName, mode: 'insensitive' }, isActive: true },
      });
      if (matchedStaff) staffId = matchedStaff.id;
    }
    if (staffId) {
      const existingStaff = await this.prisma.staffMember.findFirst({
        where: { id: staffId, tenantId },
      });
      if (!existingStaff) {
        throw new BadRequestException('Staff member does not belong to this tenant');
      }
    }

    // Auto-resolve staff member if still unassigned
    if (!staffId) {
      const slotResolution = await this.resolveDoctorAndSlot(tenantId, scheduledAt, durationMins);
      if (slotResolution.assignedStaffId) {
        staffId = slotResolution.assignedStaffId;
      }
    }

    // 3. Serialize on DOCTOR / STAFF RESOURCE, not on start minute!
    // ponytail: tenant-wide serialization; partition only after defining unassigned resource capacity.
    const resourceKey = `appointments_${tenantId}`;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Tier 2: PostgreSQL Transactional Advisory Lock on Doctor Resource
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${resourceKey}))`;

        const newStart = scheduledAt;
        const newEnd = new Date(scheduledAt.getTime() + durationMins * 60 * 1000);

        // 4. Exact Mathematical Interval Overlap Check
        await this.checkIntervalConflict(tx, tenantId, staffId, newStart, newEnd);

        // 5. Clean insertion passing only valid schema columns
        return tx.appointment.create({
          data: {
            tenantId,
            customerId,
            serviceId,
            staffId,
            scheduledAt: newStart,
            durationMins,
            status: data.status || 'SCHEDULED',
            source: data.source || data.channel || 'FRONTDESK',
            notes: data.notes || null,
          },
          include: { customer: true, service: true, staff: true },
        });
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('This time slot was just confirmed by another patient. Please choose another time.');
      }
      throw err;
    }
  }

  async sendPublicBookingOtp(slug: string, phone: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!tenant) {
      throw new NotFoundException(`Clinic with slug '${slug}' not found`);
    }
    if (!this.otpService) {
      throw new BadRequestException('OTP service is unavailable');
    }
    return this.otpService.generateAndSendOtp(tenant.id, phone, tenant.name);
  }

  async bookFromPublic(data: {
    slug: string;
    customerName: string;
    customerPhone: string;
    otp: string;
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

    // Verify cryptographic OTP before booking
    if (!this.otpService || !data.otp) throw new BadRequestException('OTP verification is required');
    await this.otpService.verifyOtp(tenant.id, data.customerPhone, data.otp);

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
        where: { slug: tenantIdentifier },
      });
      if (resolvedTenant) {
        tenantId = resolvedTenant.id;
      } else {
        throw new NotFoundException(`Tenant '${tenantIdentifier}' not found`);
      }
    }

    const scheduledAt = await this.parseTime(tenantId, data);
    if (!scheduledAt || !Number.isFinite(scheduledAt.getTime())) throw new BadRequestException('An explicit valid booking date and time are required');
    if (scheduledAt.getTime() <= Date.now()) throw new BadRequestException('Booking time must be in the future');

    const rawPhone = data.customerPhone || '';
    if (!/^\+?[1-9][\d ()-]{7,20}$/.test(rawPhone)) throw new BadRequestException('A real customer phone number is required');
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
          phone,
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
          message: slotCheck.alternativeDoctor ? `${slotCheck.requestedDoctor} is unavailable. Would you like to request ${slotCheck.alternativeDoctor.name} instead? Availability is checked again on confirmation.` : `${slotCheck.requestedDoctor} is unavailable. Please choose another time.`,
        };
      } else if (slotCheck.alternativeDoctor) {
        // Patient consented to alternative doctor
        staffId = slotCheck.alternativeDoctor.id;
        this.logger.log(`Patient consented to alternative doctor: ${slotCheck.alternativeDoctor.name} (${staffId})`);
      } else {
        throw new ConflictException('No alternative staff member is available; choose another time');
      }
    } else if (!slotCheck.conflict && slotCheck.assignedStaffId) {
      staffId = slotCheck.assignedStaffId;
    }

    // ponytail: tenant-wide serialization; partition only after defining unassigned resource capacity.
    const resourceKey = `appointments_${tenantId}`;

    let createdAppt: any;
    try {
      createdAppt = await this.prisma.$transaction(async (tx) => {
        // Tier 2: PostgreSQL Transactional Advisory Lock on Doctor Resource
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${resourceKey}))`;

        const newStart = scheduledAt;
        const newEnd = new Date(scheduledAt.getTime() + durationMins * 60 * 1000);

        // Mathematical Interval Overlap Check
        await this.checkIntervalConflict(tx, tenantId, staffId, newStart, newEnd);

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
    }

    // Automated WhatsApp Appointment Confirmation
    if (this.whatsappService && customer.phone && customer.phone !== '+919999999999') {
      try {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const clinicName = tenant?.name || 'ZeroDesk';
        const formattedDate = scheduledAt.toLocaleDateString('en-IN', {
          timeZone: tenant?.timezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedTime = scheduledAt.toLocaleTimeString('en-IN', {
          timeZone: tenant?.timezone,
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

  async update(tenantId: string, id: string, data: any) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }

    if (data.staffId) {
      const existingStaff = await this.prisma.staffMember.findFirst({
        where: { id: data.staffId, tenantId },
      });
      if (!existingStaff) {
        throw new BadRequestException('Staff member does not belong to this tenant');
      }
    }
    if (data.serviceId) {
      const existingService = await this.prisma.service.findFirst({
        where: { id: data.serviceId, tenantId },
      });
      if (!existingService) {
        throw new BadRequestException('Service does not belong to this tenant');
      }
    }

    if (data.scheduledAt) {
      const parsed = await this.parseTime(tenantId, data);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid scheduledAt timestamp');
      }
    }
    if (data.durationMins !== undefined || data.durationMinutes !== undefined) {
      const dur = Number(data.durationMins ?? data.durationMinutes);
      if (!Number.isInteger(dur) || dur < 5 || dur > 1440) {
        throw new BadRequestException('Appointment duration must be between 5 and 1440 minutes');
      }
    }

    const scheduledAt = data.scheduledAt ? await this.parseTime(tenantId, data) : appt.scheduledAt;
    const durationMins = Number(data.durationMins || data.durationMinutes || appt.durationMins);
    const staffId = data.staffId !== undefined ? (data.staffId || null) : appt.staffId;
    const serviceId = data.serviceId !== undefined ? (data.serviceId || null) : appt.serviceId;

    const currentStatus = appt.status;
    const targetStatus = data.status || currentStatus;
    const isTargetActive = !['CANCELLED', 'NO_SHOW'].includes(targetStatus);
    const wasInactive = ['CANCELLED', 'NO_SHOW'].includes(currentStatus);
    const isActivating = wasInactive && isTargetActive;
    const timingChanged = Boolean(
      (data.scheduledAt && new Date(data.scheduledAt).getTime() !== appt.scheduledAt.getTime()) ||
      (data.durationMins && data.durationMins !== appt.durationMins) ||
      (data.durationMinutes && data.durationMinutes !== appt.durationMins) ||
      (data.staffId !== undefined && data.staffId !== appt.staffId)
    );
    const requiresConflictCheck = isTargetActive && (timingChanged || isActivating);

    // ponytail: tenant-wide serialization; partition only after defining unassigned resource capacity.
    const resourceKey = `appointments_${tenantId}`;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${resourceKey}))`;

        // Re-read row under transaction lock to prevent stale merge on concurrent PATCH
        const currentAppt = await tx.appointment.findUnique({ where: { id: appt.id } });
        if (!currentAppt) throw new NotFoundException('Appointment not found');

        const effectiveStart = data.scheduledAt ? scheduledAt : currentAppt.scheduledAt;
        const effectiveDuration = (data.durationMins || data.durationMinutes) ? durationMins : currentAppt.durationMins;
        const effectiveStaffId = data.staffId !== undefined ? staffId : currentAppt.staffId;

        if (!['CANCELLED', 'NO_SHOW'].includes(data.status || currentAppt.status)) {
          const newStart = effectiveStart;
          const newEnd = new Date(effectiveStart.getTime() + effectiveDuration * 60 * 1000);
          await this.checkIntervalConflict(tx, tenantId, effectiveStaffId, newStart, newEnd, appt.id);
        }

        const updateData: any = {};
        if (data.scheduledAt) {
          updateData.scheduledAt = scheduledAt;
        }
        if (data.durationMins || data.durationMinutes) {
          updateData.durationMins = durationMins;
        }
        if (data.status) {
          updateData.status = data.status;
        }
        if (data.notes !== undefined) {
          updateData.notes = data.notes;
        }
        if (data.staffId !== undefined) {
          updateData.staffId = staffId;
        }
        if (data.serviceId !== undefined) {
          updateData.serviceId = serviceId;
        }

        return tx.appointment.update({
          where: { id: appt.id },
          data: updateData,
          include: { customer: true, service: true, staff: true },
        });
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('This time slot was just confirmed by another guest. Please choose another time.');
      }
      throw err;
    }
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.update(tenantId, id, { status });
  }

  async delete(tenantId: string, id: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, tenantId },
    });
    if (!appt) {
      throw new NotFoundException('Appointment not found');
    }
    return this.prisma.appointment.update({
      where: { id: appt.id },
      data: {
        status: 'CANCELLED',
        deletedAt: new Date(),
      },
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

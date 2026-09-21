import { AppointmentService } from '../src/modules/appointment/appointment.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Concurrency Booking E2E Simulation Suite (Advisory Lock & Double-Booking Prevention)', () => {
  let appointmentService: AppointmentService;
  let mockPrisma: any;
  let activeBookings: any[];

  beforeEach(() => {
    activeBookings = [];

    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        // Execute transactional callback with mockPrisma client
        return await callback(mockPrisma);
      }),
      $queryRaw: jest.fn().mockResolvedValue([{ pg_advisory_xact_lock: 1 }]),
      appointment: {
        findFirst: jest.fn().mockImplementation((args) => {
          const match = activeBookings.find((b) => {
            const tenantMatch = !args.where?.tenantId || b.tenantId === args.where.tenantId;
            const staffMatch = !args.where?.staffId || b.staffId === args.where.staffId;
            const notCancelled = b.status !== 'CANCELLED';
            let timeMatch = false;
            if (args.where?.scheduledAt instanceof Date) {
              timeMatch = b.scheduledAt.getTime() === args.where.scheduledAt.getTime();
            } else if (args.where?.scheduledAt?.gte && args.where?.scheduledAt?.lte) {
              timeMatch = b.scheduledAt >= args.where.scheduledAt.gte && b.scheduledAt <= args.where.scheduledAt.lte;
            } else {
              timeMatch = true;
            }
            return tenantMatch && staffMatch && notCancelled && timeMatch;
          });
          return Promise.resolve(match || null);
        }),
        findMany: jest.fn().mockImplementation((args) => {
          const matches = activeBookings.filter((b) => {
            const tenantMatch = !args.where?.tenantId || b.tenantId === args.where.tenantId;
            const notCancelled = b.status !== 'CANCELLED';
            let timeMatch = false;
            if (args.where?.scheduledAt instanceof Date) {
              timeMatch = b.scheduledAt.getTime() === args.where.scheduledAt.getTime();
            } else if (args.where?.scheduledAt?.gte && args.where?.scheduledAt?.lte) {
              timeMatch = b.scheduledAt >= args.where.scheduledAt.gte && b.scheduledAt <= args.where.scheduledAt.lte;
            } else {
              timeMatch = true;
            }
            return tenantMatch && notCancelled && timeMatch;
          });
          return Promise.resolve(matches);
        }),
        create: jest.fn().mockImplementation((args) => {
          const newAppt = {
            id: `appt-${Date.now()}-${Math.random()}`,
            ...args.data,
            status: 'CONFIRMED',
            staff: { name: 'Dr. Sharma' },
            service: { name: 'General Consultation', price: 500 },
            customer: { name: 'Valued Patient', phone: '+919876543210' },
          };
          activeBookings.push(newAppt);
          return Promise.resolve(newAppt);
        }),
      },
      tenant: {
        findUnique: jest.fn().mockResolvedValue({ id: 'tenant-clinic-1', name: 'ZeroDesk Clinic' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'tenant-clinic-1', name: 'ZeroDesk Clinic' }),
      },
      staffMember: {
        findFirst: jest.fn().mockResolvedValue({ id: 'staff-1', name: 'Dr. Sharma', isAvailable: true }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'staff-1', name: 'Dr. Sharma', isAvailable: true },
          { id: 'staff-2', name: 'Dr. Ananya', isAvailable: true },
        ]),
      },
      service: {
        findFirst: jest.fn().mockResolvedValue({ id: 'srv-1', name: 'General Consultation', price: 500 }),
      },
      customer: {
        findFirst: jest.fn().mockResolvedValue({ id: 'cust-1', name: 'Valued Patient', phone: '+919876543210' }),
        upsert: jest.fn().mockResolvedValue({ id: 'cust-1', name: 'Valued Patient', phone: '+919876543210' }),
      },
      invoice: {
        create: jest.fn().mockResolvedValue({ id: 'inv-1' }),
      },
      activity: {
        create: jest.fn().mockResolvedValue({ id: 'act-1' }),
      },
      conversation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'conv-1' }),
      },
      message: {
        create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
      },
    };

    const mockRedis = {
      setNx: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(1),
    };
    const mockWhatsapp = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
      sendTemplateMessage: jest.fn().mockResolvedValue({ success: true }),
    };
    const mockOtpService = {
      verifyOtp: jest.fn().mockResolvedValue(true),
    };

    appointmentService = new AppointmentService(
      mockPrisma as unknown as PrismaService,
      mockRedis as any,
      mockWhatsapp as any,
      mockOtpService as any,
    );
  });

  it('should successfully book first caller and prevent double booking when slot is taken', async () => {
    const tenantId = 'tenant-clinic-1';
    const bookingTime = new Date('2026-10-15T10:00:00.000Z');

    // Caller 1 books slot
    const firstBooking = await appointmentService.bookFromVoice(tenantId, {
      customerPhone: '+919876543210',
      customerName: 'Patient Alpha',
      serviceName: 'General Consultation',
      date: '2026-10-15',
      time: '10:00',
      doctorName: 'Dr. Sharma',
    });

    expect(firstBooking.id).toBeDefined();
    expect(activeBookings.length).toBe(1);

    // Caller 2 attempts to book the exact same slot with Dr. Sharma (allowAlternativeDoctor = false)
    const secondBooking = await appointmentService.bookFromVoice(tenantId, {
      customerPhone: '+919876543211',
      customerName: 'Patient Beta',
      serviceName: 'General Consultation',
      date: '2026-10-15',
      time: '10:00',
      doctorName: 'Dr. Sharma',
      allowAlternativeDoctor: false,
    });

    expect(secondBooking.status).toBe('REQUESTED_DOCTOR_UNAVAILABLE');
    expect(secondBooking.requestedDoctor).toBe('Dr. Sharma');
    // Verify slot was not double booked
    expect(activeBookings.length).toBe(1);
  });

  it('should offer alternative doctor if caller consents to alternative physician', async () => {
    const tenantId = 'tenant-clinic-1';
    // Existing booking with Dr. Sharma at 10:00
    activeBookings.push({
      tenantId,
      staffId: 'staff-1',
      scheduledAt: new Date('2026-10-15T10:00:00'),
      status: 'CONFIRMED',
    });

    // Caller agrees to alternative doctor
    const altBooking = await appointmentService.bookFromVoice(tenantId, {
      customerPhone: '+919876543212',
      customerName: 'Patient Gamma',
      serviceName: 'General Consultation',
      date: '2026-10-15',
      time: '10:00',
      doctorName: 'Dr. Sharma',
      allowAlternativeDoctor: true,
    });

    expect(altBooking.id).toBeDefined();
    expect(altBooking.staffId).toBe('staff-2'); // Assigned to Dr. Ananya
    expect(activeBookings.length).toBe(2);
  });
});

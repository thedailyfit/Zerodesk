import { CalendarSyncService } from '../src/modules/appointment/calendar-sync.service';
import { AppointmentService } from '../src/modules/appointment/appointment.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Calendar Synchronization & Double-Booking Prevention E2E Suite', () => {
  let calendarSyncService: CalendarSyncService;
  let appointmentService: AppointmentService;
  let mockPrisma: any;

  const mockTenantId = 'tenant-clinic-sync-test';

  beforeAll(() => {
    mockPrisma = {
      appointment: {
        findMany: jest.fn().mockImplementation((args) => {
          return Promise.resolve([
            {
              id: 'appt-1',
              tenantId: mockTenantId,
              scheduledAt: new Date('2026-09-10T10:00:00.000Z'),
              durationMins: 45,
              status: 'CONFIRMED',
              customer: { name: 'Pooja Verma', phone: '+919876501234' },
              service: { name: 'Laser Hair Reduction' },
            },
            {
              id: 'appt-2',
              tenantId: mockTenantId,
              scheduledAt: new Date('2026-09-10T14:30:00.000Z'),
              durationMins: 30,
              status: 'CONFIRMED',
              customer: { name: 'Karan Mehra', phone: '+919876505678' },
              service: { name: 'Dermatologist Consultation' },
            },
          ]);
        }),
      },
      tenant: {
        findUnique: jest.fn().mockResolvedValue({ id: mockTenantId, name: 'Aesthetic Care Clinic' }),
      },
    };

    calendarSyncService = new CalendarSyncService(mockPrisma as unknown as PrismaService);
    appointmentService = new AppointmentService(
      mockPrisma as unknown as PrismaService,
      {} as any, // whatsappService
    );
  });

  describe('1. External Calendar Push Dispatch', () => {
    it('should format appointment and dispatch to Google Calendar event schema', async () => {
      const result = await calendarSyncService.pushToGoogleCalendar(mockTenantId, {
        id: 'appt-1',
        scheduledAt: new Date('2026-09-10T10:00:00.000Z'),
        durationMins: 45,
        customerName: 'Pooja Verma',
        customerPhone: '+919876501234',
        serviceName: 'Laser Hair Reduction',
      });

      expect(result.synced).toBe(true);
      expect(result.provider).toBe('GOOGLE_CALENDAR');
      expect(result.eventId).toBe('gcal-appt-1');
      expect(result.syncedAt).toBeDefined();
    });
  });

  describe('2. Double-Booking Prevention & Busy Slots Aggregation', () => {
    it('should retrieve busy time intervals for doctor to block overlapping booking slots', async () => {
      const busySlots = await calendarSyncService.getExternalBusySlots(
        mockTenantId,
        'doc-1',
        '2026-09-10',
      );

      expect(busySlots.length).toBe(2);
      expect(busySlots[0].start).toEqual(new Date('2026-09-10T10:00:00.000Z'));
      expect(busySlots[0].end).toEqual(new Date('2026-09-10T10:45:00.000Z'));
      expect(busySlots[0].summary).toContain('Laser Hair Reduction');
    });
  });

  describe('3. RFC 5545 iCalendar Universal Sync Feed', () => {
    it('should generate valid RFC 5545 VCALENDAR feed with VEVENT records', async () => {
      const ical = await appointmentService.generateIcalFeed(mockTenantId);

      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('VERSION:2.0');
      expect(ical).toContain('BEGIN:VEVENT');
      expect(ical).toContain('SUMMARY:Laser Hair Reduction - Pooja Verma');
      expect(ical).toContain('SUMMARY:Dermatologist Consultation - Karan Mehra');
      expect(ical).toContain('END:VCALENDAR');
    });
  });
});

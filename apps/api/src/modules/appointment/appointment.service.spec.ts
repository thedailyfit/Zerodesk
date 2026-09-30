import { ConflictException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-01T00:00:00Z').getTime());
    mockPrisma = {
      tenant: {
        findUnique: jest.fn().mockResolvedValue({ id: 'tenant-1', timezone: 'Asia/Kolkata' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'tenant-1', timezone: 'Asia/Kolkata' }),
      },
      $executeRaw: jest.fn().mockResolvedValue(1),
      appointment: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
      customer: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      service: {
        findFirst: jest.fn(),
      },
      staffMember: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((cb: (tx: any) => any) => cb(mockPrisma)),
    };
    service = new AppointmentService(mockPrisma);
  });
  afterEach(() => jest.restoreAllMocks());

  it('rejects missing or invalid booking times without creating a customer', async () => {
    for (const dateTime of [undefined, 'not-a-date', '2026-01-01T00:00:00Z']) {
      await expect(service.bookFromVoice('tenant-1', { customerName: 'Test Customer', customerPhone: '+919876543210', dateTime })).rejects.toThrow();
    }
    expect(mockPrisma.customer.create).not.toHaveBeenCalled();
  });

  it('should book an appointment from voice agent successfully with transaction', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', name: 'John Doe', phone: '+919876543210' });
    mockPrisma.service.findFirst.mockResolvedValue({ id: 'serv-1', name: 'Dental Cleaning', durationMins: 30 });
    mockPrisma.appointment.findFirst.mockResolvedValue(null); // No conflicting appointment
    mockPrisma.appointment.create.mockResolvedValue({
      id: 'apt-1',
      tenantId: 'tenant-1',
      customerId: 'cust-1',
      serviceId: 'serv-1',
      status: 'SCHEDULED',
      source: 'VOICE_AI',
      customer: { id: 'cust-1', name: 'John Doe' },
      service: { id: 'serv-1', name: 'Dental Cleaning' },
    });

    const result: any = await service.bookFromVoice('tenant-1', {
      customerName: 'John Doe',
      customerPhone: '+919876543210',
      date: '2026-09-10',
      time: '10:00',
      serviceName: 'Dental Cleaning',
    });

    expect(result.id).toBe('apt-1');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          source: 'VOICE_AI',
          scheduledAt: new Date('2026-09-10T04:30:00Z'),
        }),
      }),
    );
  });

  it('should reject booking with ConflictException if slot is already occupied', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', name: 'John Doe', phone: '+919876543210' });
    mockPrisma.service.findFirst.mockResolvedValue({ id: 'serv-1', name: 'Dental Cleaning', durationMins: 30 });
    // Simulate conflict found
    mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'apt-existing-conflict' });

    await expect(
      service.bookFromVoice('tenant-1', {
        customerName: 'John Doe',
        customerPhone: '+919876543210',
        date: '2026-09-10',
        time: '10:00',
        serviceName: 'Dental Cleaning',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should offer alternative doctor and alternative slots when requested physician is busy', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', name: 'Priya Patel', phone: '+919876543210' });
    mockPrisma.service.findFirst.mockResolvedValue({ id: 'serv-1', name: 'Chemical Peel', durationMins: 30 });
    mockPrisma.staffMember.findMany.mockResolvedValue([
      { id: 'doc-1', name: 'Dr. Sharma', isActive: true, specialization: 'Dermatologist' },
      { id: 'doc-2', name: 'Dr. Ananya', isActive: true, specialization: 'Cosmetologist' },
    ]);

    // Dr. Sharma has a conflict
    mockPrisma.appointment.findFirst.mockResolvedValueOnce({ id: 'conflict-sharma', staffId: 'doc-1' });
    // Dr. Ananya is free (appointment.findMany returns only doc-1 booked)
    mockPrisma.appointment.findMany.mockResolvedValue([{ staffId: 'doc-1' }]);

    const result: any = await service.bookFromVoice('tenant-1', {
      customerName: 'Priya Patel',
      customerPhone: '+919876543210',
      date: '2026-09-15',
      time: '10:00',
      serviceName: 'Chemical Peel',
      doctorName: 'Sharma',
      allowAlternativeDoctor: false,
    });

    expect(result.status).toBe('REQUESTED_DOCTOR_UNAVAILABLE');
    expect(result.requestedDoctor).toBe('Dr. Sharma');
    expect(result.alternativeDoctor).toBeDefined();
    expect(result.alternativeDoctor.name).toBe('Dr. Ananya');
    expect(result.alternativeSlots).toEqual([]);
    expect(result.requiresConsent).toBe(true);
  });

  it('should book alternative doctor when client provides consent', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', name: 'Priya Patel', phone: '+919876543210' });
    mockPrisma.service.findFirst.mockResolvedValue({ id: 'serv-1', name: 'Chemical Peel', durationMins: 30 });
    mockPrisma.staffMember.findMany.mockResolvedValue([
      { id: 'doc-1', name: 'Dr. Sharma', isActive: true },
      { id: 'doc-2', name: 'Dr. Ananya', isActive: true },
    ]);

    // Dr. Sharma is busy
    mockPrisma.appointment.findFirst
      .mockResolvedValueOnce({ id: 'conflict-sharma', staffId: 'doc-1' }) // during slot resolution
      .mockResolvedValueOnce(null); // during final transaction check for Dr. Ananya

    mockPrisma.appointment.findMany.mockResolvedValue([{ staffId: 'doc-1' }]);
    mockPrisma.appointment.create.mockResolvedValue({
      id: 'apt-consented',
      tenantId: 'tenant-1',
      customerId: 'cust-1',
      staffId: 'doc-2',
      status: 'SCHEDULED',
      source: 'VOICE_AI',
      staff: { name: 'Dr. Ananya' },
    });

    const result: any = await service.bookFromVoice('tenant-1', {
      customerName: 'Priya Patel',
      customerPhone: '+919876543210',
      date: '2026-09-15',
      time: '10:00',
      serviceName: 'Chemical Peel',
      doctorName: 'Sharma',
      allowAlternativeDoctor: true,
    });

    expect(result.id).toBe('apt-consented');
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          staffId: 'doc-2',
        }),
      }),
    );
  });

  it('should cancel an appointment with tenant isolation', async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'apt-1', tenantId: 'tenant-1' });
    mockPrisma.appointment.update.mockResolvedValue({ id: 'apt-1', status: 'CANCELLED' });

    const result = await service.cancel('tenant-1', 'apt-1');
    expect(result.status).toBe('CANCELLED');
    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: 'apt-1' },
      data: { status: 'CANCELLED' },
    });
  });

  it('fails closed when the authoritative database lock fails', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1' });
    mockPrisma.$executeRaw.mockRejectedValue(new Error('database lock unavailable'));
    await expect(service.book('tenant-1', { customerId: 'cust-1', scheduledAt: '2026-10-10T10:00' })).rejects.toThrow('database lock unavailable');
    expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
  });

  it('requires OTP service and verification for public booking', async () => {
    await expect(service.bookFromPublic({ slug: 'test', customerName: 'Test', customerPhone: '+919876543210', otp: '123456' })).rejects.toThrow('OTP verification is required');
    await expect(service.sendPublicBookingOtp('test', '+919876543210')).rejects.toThrow('OTP service is unavailable');
    expect(mockPrisma.customer.create).not.toHaveBeenCalled();
  });

  it('treats an unassigned appointment as occupying a named staff resource', async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([{ scheduledAt: new Date('2026-10-10T04:30Z'), durationMins: 60 }]);
    await expect(service.checkIntervalConflict(mockPrisma, 'tenant-1', 'staff-1', new Date('2026-10-10T05:00Z'), new Date('2026-10-10T05:30Z'))).rejects.toThrow(ConflictException);
    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ OR: [{ staffId: 'staff-1' }, { staffId: null }] }) }));
  });
});

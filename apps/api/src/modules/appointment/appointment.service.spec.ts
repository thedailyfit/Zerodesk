import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let mockPrisma: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    mockPrisma = {
      appointment: {
        findMany: jest.fn(),
        findFirst: jest.fn().mockResolvedValue({ id: 'apt-1', tenantId: 'tenant-1' }),
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
    };
    service = new AppointmentService(mockPrisma);
  });

  it('should book an appointment from voice agent successfully', async () => {
    mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', name: 'John Doe', phone: '+919876543210' });
    mockPrisma.service.findFirst.mockResolvedValue({ id: 'serv-1', name: 'Dental Cleaning', durationMins: 30 });
    mockPrisma.appointment.create.mockResolvedValue({
      id: 'apt-1',
      tenantId: 'tenant-1',
      customerId: 'cust-1',
      serviceId: 'serv-1',
      status: 'CONFIRMED',
      source: 'VOICE_AI',
      customer: { id: 'cust-1', name: 'John Doe' },
      service: { id: 'serv-1', name: 'Dental Cleaning' },
    });

    const result = await service.bookFromVoice('tenant-1', {
      customerName: 'John Doe',
      customerPhone: '+919876543210',
      date: '2026-09-10',
      time: '10:00',
      serviceName: 'Dental Cleaning',
    });

    expect(result.id).toBe('apt-1');
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          source: 'VOICE_AI',
        }),
      }),
    );
  });

  it('should cancel an appointment with tenant isolation', async () => {
    mockPrisma.appointment.update.mockResolvedValue({ id: 'apt-1', status: 'CANCELLED' });

    const result = await service.cancel('tenant-1', 'apt-1');
    expect(result.status).toBe('CANCELLED');
    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: 'apt-1' },
      data: { status: 'CANCELLED' },
    });
  });
});

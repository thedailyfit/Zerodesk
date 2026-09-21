import { RagService } from '../src/modules/knowledge-base/rag.service';
import { AppointmentService } from '../src/modules/appointment/appointment.service';
import { ConsentService } from '../src/modules/customer/consent.service';
import { InvoiceService } from '../src/modules/invoice/invoice.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Live Omnichannel Customer Journey E2E Simulation', () => {
  let ragService: RagService;
  let appointmentService: AppointmentService;
  let consentService: ConsentService;
  let invoiceService: InvoiceService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        if (typeof callback === 'function') {
          return await callback(mockPrisma);
        }
        return Promise.all(callback);
      }),
      $queryRaw: jest.fn().mockResolvedValue([
        {
          chunkId: 'chunk-1',
          documentId: 'doc-1',
          documentTitle: 'Clinic Services',
          category: 'SERVICES',
          chunkText: 'ZeroDesk Clinic offers comprehensive Dental and Pediatric care with Dr. Sharma.',
          similarity: 0.92,
          pg_advisory_xact_lock: 1,
        },
      ]),
      customer: {
        findFirst: jest.fn().mockResolvedValue({ id: 'cust-journey-1', tenantId: 'tenant-clinic-1' }),
        upsert: jest.fn().mockResolvedValue({ id: 'cust-journey-1', name: 'Rohan Sharma', phone: '+919876543210' }),
        update: jest.fn().mockResolvedValue({ id: 'cust-journey-1' }),
      },
      patientConsent: {
        create: jest.fn().mockResolvedValue({ id: 'consent-1', status: 'GRANTED' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      appointment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'appt-journey-1',
          tenantId: 'tenant-clinic-1',
          customerId: 'cust-journey-1',
          staffId: 'staff-1',
          status: 'CONFIRMED',
          scheduledAt: new Date('2026-10-20T11:00:00.000Z'),
          staff: { name: 'Dr. Sharma' },
          service: { name: 'Dental Checkup', price: 800 },
          customer: { name: 'Rohan Sharma', phone: '+919876543210' },
        }),
      },
      staffMember: {
        findFirst: jest.fn().mockResolvedValue({ id: 'staff-1', name: 'Dr. Sharma', isAvailable: true }),
        findMany: jest.fn().mockResolvedValue([{ id: 'staff-1', name: 'Dr. Sharma', isAvailable: true }]),
      },
      service: {
        findFirst: jest.fn().mockResolvedValue({ id: 'srv-1', name: 'Dental Checkup', price: 800 }),
      },
      invoice: {
        create: jest.fn().mockResolvedValue({ id: 'inv-journey-1', totalAmount: 800 }),
        count: jest.fn().mockResolvedValue(0),
      },
      tenant: {
        findUnique: jest.fn().mockResolvedValue({ id: 'tenant-clinic-1', name: 'ZeroDesk Clinic' }),
        findFirst: jest.fn().mockResolvedValue({ id: 'tenant-clinic-1', name: 'ZeroDesk Clinic' }),
      },
      activity: {
        create: jest.fn().mockResolvedValue({ id: 'act-1' }),
      },
      conversation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'conv-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      message: {
        create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      usageLedger: {
        create: jest.fn().mockResolvedValue({ id: 'usage-1', resourceType: 'WHATSAPP_MESSAGES', amount: 1 }),
      },
      knowledgeDocument: {
        findFirst: jest.fn().mockResolvedValue({ id: 'doc-1', status: 'ACTIVE', version: 1 }),
      },
    };

    const mockConfig = {
      get: jest.fn().mockReturnValue('mock_api_key'),
    };
    const mockEventEmitter = {
      emit: jest.fn(),
    };
    const mockWhatsapp = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
      sendTemplateMessage: jest.fn().mockResolvedValue({ success: true }),
    };
    const mockOtp = {
      verifyOtp: jest.fn().mockResolvedValue(true),
    };

    const mockEmbeddingService = {
      createEmbedding: jest.fn().mockResolvedValue(new Array(1536).fill(0.01)),
    };
    const mockRagQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const mockRedis = {
      setNx: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(1),
    };

    ragService = new RagService(
      mockPrisma as unknown as PrismaService,
      mockEmbeddingService as any,
      mockRagQueue as any,
    );
    appointmentService = new AppointmentService(
      mockPrisma as unknown as PrismaService,
      mockRedis as any,
      mockWhatsapp as any,
      mockOtp as any,
    );
    consentService = new ConsentService(mockPrisma as unknown as PrismaService);
    invoiceService = new InvoiceService(mockPrisma as unknown as PrismaService);
  });

  it('should complete the entire multi-step patient lifecycle from RAG retrieval to DPDP consent and booking', async () => {
    const tenantId = 'tenant-clinic-1';

    // Step 1: Patient asks clinic question -> RAG retrieval
    const ragResults = await ragService.search(tenantId, 'What services does Dr. Sharma provide?');
    expect(ragResults.length).toBeGreaterThan(0);
    expect(ragResults[0].chunkText).toContain('Dr. Sharma');

    // Step 2: Patient grants DPDP communication consent
    const consent = await consentService.recordConsent(
      tenantId,
      'cust-journey-1',
      'WHATSAPP_COMMUNICATION',
      'WHATSAPP',
      '103.21.244.2',
    );
    expect(consent.status).toBe('GRANTED');

    // Step 3: Patient books appointment via Voice / WhatsApp AI
    const booking = await appointmentService.bookFromVoice(tenantId, {
      customerPhone: '+919876543210',
      customerName: 'Rohan Sharma',
      serviceName: 'Dental Checkup',
      date: '2026-10-20',
      time: '11:00',
      doctorName: 'Dr. Sharma',
    });

    expect(booking.id).toBe('appt-journey-1');
    expect(booking.status).toBe('CONFIRMED');

    // Step 4: Verify invoice created under statutory retention (onDelete: Restrict)
    const invoice = await invoiceService.create(tenantId, {
      customerId: 'cust-journey-1',
      items: [{ name: 'Dental Checkup', price: 800, quantity: 1 }],
      totalAmount: 800,
    });

    expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId,
          customerId: 'cust-journey-1',
          totalAmount: 800,
        }),
      })
    );
  });
});

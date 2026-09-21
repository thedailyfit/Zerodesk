import { NotFoundException } from '@nestjs/common';
import { ConsentService } from './consent.service';

describe('ConsentService', () => {
  let service: ConsentService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      customer: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      patientConsent: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
      message: {
        updateMany: jest.fn(),
      },
      conversation: {
        findMany: jest.fn().mockResolvedValue([{ id: 'conv-1' }]),
        updateMany: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    service = new ConsentService(mockPrisma);
  });

  describe('recordConsent', () => {
    it('should throw NotFoundException if customer does not exist', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);

      await expect(
        service.recordConsent('tenant-1', 'cust-1', 'VOICE_RECORDING', 'VOICE')
      ).rejects.toThrow(NotFoundException);
    });

    it('should create consent record with GRANTED status', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', tenantId: 'tenant-1' });
      mockPrisma.patientConsent.create.mockResolvedValue({
        id: 'consent-1',
        status: 'GRANTED',
        consentType: 'VOICE_RECORDING',
      });

      const result = await service.recordConsent('tenant-1', 'cust-1', 'VOICE_RECORDING', 'VOICE', '1.2.3.4');
      expect(result.status).toBe('GRANTED');
      expect(mockPrisma.patientConsent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            customerId: 'cust-1',
            consentType: 'VOICE_RECORDING',
            status: 'GRANTED',
            ipAddress: '1.2.3.4',
          }),
        })
      );
    });
  });

  describe('revokeConsent', () => {
    it('should update consent to REVOKED and set customer dndStatus to true for WHATSAPP_COMMUNICATION', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 'cust-1', tenantId: 'tenant-1' });

      const res = await service.revokeConsent('tenant-1', 'cust-1', 'WHATSAPP_COMMUNICATION');
      expect(res.success).toBe(true);
      expect(mockPrisma.patientConsent.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1', customerId: 'cust-1', consentType: 'WHATSAPP_COMMUNICATION', status: 'GRANTED' },
        })
      );
      expect(mockPrisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cust-1' },
          data: expect.objectContaining({ dndStatus: true }),
        })
      );
    });
  });

  describe('executeDpdpDataErasure', () => {
    it('should anonymize customer details while preserving statutory accounting records', async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000abcdef', tenantId: 'tenant-1' });
      mockPrisma.customer.update.mockResolvedValue({
        id: '00000000-0000-0000-0000-000000abcdef',
        name: 'Anonymized Patient #abcdef',
      });

      const res = await service.executeDpdpDataErasure('tenant-1', '00000000-0000-0000-0000-000000abcdef', 'Patient request');
      expect(res.success).toBe(true);
      expect(res.customerId).toBe('00000000-0000-0000-0000-000000abcdef');
      expect(mockPrisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Anonymized Patient #abcdef',
            phone: '+91000000abcdef',
            email: null,
            aiSummary: null,
            dndStatus: true,
          }),
        })
      );
      expect(mockPrisma.conversation.updateMany).toHaveBeenCalled();
    });
  });
});

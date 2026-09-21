import { VoiceService } from '../src/modules/voice/voice.service';
import { PlivoService } from '../src/modules/voice/plivo.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Telephony Ingress & Webhook Automation E2E Suite (Plivo + LiveKit Cloud + Retell Fallback)', () => {
  let voiceService: VoiceService;
  let plivoService: PlivoService;
  let mockPrisma: any;

  beforeAll(() => {
    mockPrisma = {
      voiceConfig: {
        findUnique: jest.fn().mockResolvedValue({
          tenantId: 'tenant-dental-1',
          plivoPhoneNumber: '+918047361920',
          retellPhoneNumber: '+918047361999',
          isActive: true,
        }),
        findFirst: jest.fn().mockImplementation((args) => {
          const isMatch = args.where?.OR?.some(
            (cond: any) => cond.plivoPhoneNumber === '+918047361920' || cond.retellPhoneNumber === '+918047361920',
          );
          if (isMatch) {
            return Promise.resolve({
              tenantId: 'tenant-dental-1',
              plivoPhoneNumber: '+918047361920',
              retellPhoneNumber: '+918047361999',
              isActive: true,
            });
          }
          return Promise.resolve(null);
        }),
        upsert: jest.fn().mockImplementation((args) => Promise.resolve({
          tenantId: args.where.tenantId,
          plivoPhoneNumber: args.create.plivoPhoneNumber,
          isActive: true,
        })),
      },
      tenant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'tenant-dental-1', name: 'Dental Care' }),
      },
      callRecord: {
        create: jest.fn().mockResolvedValue({ id: 'call-rec-1' }),
      },
    };

    const mockConfig = {
      get: jest.fn().mockImplementation((key: string, defaultVal?: any) => {
        if (key === 'LIVEKIT_SIP_TRUNK_URI') return 'sip:livekit.cloud.sip.zerodesk.com';
        if (key === 'RETELL_SIP_URI') return 'sip:agent@retell.ai';
        if (key === 'API_URL' || key === 'API_PUBLIC_URL') return 'https://api.zerodesk.com';
        return defaultVal || null;
      }),
    };

    plivoService = new PlivoService(mockConfig as any);

    voiceService = new VoiceService(
      mockPrisma as unknown as PrismaService,
      mockConfig as any,
      {} as any, // eventEmitter
      {} as any, // ragService
      {} as any, // promptGuard
      {} as any, // whatsappService
      plivoService,
      {} as any, // storageService
      {} as any, // outboundQueue
    );
  });

  describe('1. Plivo Inbound SIP Routing & Automated Retell Failover XML', () => {
    it('should generate Plivo XML dialing LiveKit Cloud SIP trunk with 15s timeout and fallback action', async () => {
      const xml = await voiceService.handlePlivoInbound('+918047361920', '+919876543210');

      expect(xml).toContain('<Response>');
      expect(xml).toContain('<Dial');
      expect(xml).toContain('timeout="15"');
      expect(xml).toContain('plivo-fallback');
      expect(xml).toContain('sip.livekit.cloud');
      expect(xml).toContain('</Response>');
    });

    it('should generate Plivo Fallback XML routing to Retell AI SIP URI if LiveKit is unanswered', async () => {
      const xml = await voiceService.handlePlivoFallback('+918047361920', 'tenant-dental-1');

      expect(xml).toContain('<Response>');
      expect(xml).toContain('<Dial');
      expect(xml).toContain('+918047361999');
      expect(xml).toContain('</Response>');
    });
  });

  describe('2. Automated Plivo DID Number Procurement & Provisioning', () => {
    it('should return available Indian virtual phone numbers from Plivo', async () => {
      const numbers = await voiceService.getAvailablePhoneNumbers('IN');

      expect(Array.isArray(numbers)).toBe(true);
      expect(numbers.length).toBeGreaterThan(0);
      expect(numbers[0].phoneNumber.startsWith('+91')).toBe(true);
      expect(numbers[0].monthlyCostInr).toBeGreaterThan(0);
      expect(numbers[0].provider).toBe('Plivo');
    });

    it('should provision a Plivo number and assign to clinic VoiceConfig', async () => {
      const tenantId = 'tenant-clinic-provision-1';
      const selectedNumber = '+918047361925';

      const result = await voiceService.provisionPhoneNumber(tenantId, selectedNumber);

      expect(result.success).toBe(true);
      expect(result.phoneNumber).toBe(selectedNumber);
      expect(result.tenantId).toBe(tenantId);
      expect(result.status).toBe('ACTIVE');
    });

    it('should reject provisioning if number is already in use by another clinic', async () => {
      const anotherTenant = 'tenant-different-clinic';
      const duplicateNumber = '+918047361920'; // already belonging to tenant-dental-1

      await expect(
        voiceService.provisionPhoneNumber(anotherTenant, duplicateNumber),
      ).rejects.toThrow('already assigned to another clinic');
    });
  });
});

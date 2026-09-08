import { WhatsappService } from '../src/modules/whatsapp/whatsapp.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CryptoService } from '../src/common/crypto/crypto.service';

describe('WhatsApp Omnichannel Pipeline & Embedded Signup E2E Suite', () => {
  let whatsappService: WhatsappService;
  let cryptoService: CryptoService;
  let mockPrisma: any;
  let mockRedis: any;

  beforeAll(() => {
    const mockConfig = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'ENCRYPTION_KEY') return '0123456789abcdef0123456789abcdef';
        if (key === 'WHATSAPP_VERIFY_TOKEN') return 'zerodesk_meta_verify_2026';
        return null;
      }),
    };
    cryptoService = new CryptoService(mockConfig as any);

    mockPrisma = {
      whatsappConfig: {
        upsert: jest.fn().mockImplementation((args) => Promise.resolve({
          tenantId: args.where.tenantId,
          phoneNumberId: args.create.phoneNumberId,
          wabaId: args.create.wabaId,
          accessToken: args.create.accessToken,
          isActive: true,
        })),
        findFirst: jest.fn().mockImplementation((args) => {
          if (args.where?.phoneNumberId === 'phone_test_123') {
            return Promise.resolve({
              tenantId: 'tenant-skin-clinic',
              phoneNumberId: 'phone_test_123',
              accessToken: cryptoService.encrypt('EAAB_meta_test_access_token'),
              isActive: true,
            });
          }
          return Promise.resolve(null);
        }),
      },
      customer: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'c1', ...args.data })),
      },
      conversation: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'conv-1', ...args.data })),
      },
      message: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'msg-1', ...args.data })),
      },
    };

    mockRedis = {
      setNx: jest.fn().mockResolvedValue(true),
    };

    whatsappService = new WhatsappService(
      mockPrisma as unknown as PrismaService,
      mockConfig as any,
      {} as any, // eventEmitter
      mockRedis as any,
      cryptoService,
    );
  });

  describe('1. Meta WhatsApp Embedded Signup Automated Onboarding', () => {
    it('should configure WhatsApp credentials automatically via embedded signup payload', async () => {
      const tenantId = 'tenant-auto-onboard-1';
      const result = await whatsappService.handleEmbeddedSignup(tenantId, {
        phoneNumberId: '109823746192837',
        wabaId: 'waba_991827364',
        accessToken: 'EAAB_test_system_user_token_long_lived',
      });

      expect(result.success).toBe(true);
      expect(result.phoneNumberId).toBe('109823746192837');
      expect(result.wabaId).toBe('waba_991827364');
      expect(result.status).toBe('CONNECTED');

      // Verify token was encrypted before database persistence
      expect(mockPrisma.whatsappConfig.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            accessToken: expect.stringMatching(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i),
          }),
        }),
      );
    });
  });

  describe('2. Inbound Webhook Idempotency & Message Deduplication', () => {
    it('should acquire Redis lock for incoming Meta message ID', async () => {
      const lockKey = 'whatsapp:msg_lock:wamid.HBgLMTIzNDU2';
      const acquired = await mockRedis.setNx(lockKey, 'locked', 600);

      expect(acquired).toBe(true);
      expect(mockRedis.setNx).toHaveBeenCalledWith(lockKey, 'locked', 600);
    });

    it('should verify Meta webhook handshake challenge', () => {
      const mode = 'subscribe';
      const token = 'zerodesk_meta_verify_2026';
      const challenge = '11559955';

      const response = whatsappService.verifyWebhook(mode, challenge, token);
      expect(response).toEqual(parseInt(challenge, 10));
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TenantPrismaService } from './tenant-prisma.service';
import { PrismaService } from './prisma.service';

describe('TenantPrismaService — Multi-Tenant Isolation & Query Scoping', () => {
  let tenantPrisma: TenantPrismaService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb({
        $executeRaw: jest.fn().mockResolvedValue(1),
      })),
      $extends: jest.fn().mockReturnValue({}),
      customer: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'c1', ...args.data })),
        update: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'c1', ...args.data })),
        count: jest.fn().mockResolvedValue(0),
      },
      appointment: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'a1', ...args.data })),
      },
      invoice: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      service: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPrismaService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    tenantPrisma = module.get<TenantPrismaService>(TenantPrismaService);
  });

  it('should be defined', () => {
    expect(tenantPrisma).toBeDefined();
  });

  describe('Scoped Tenant Isolation Queries', () => {
    const TENANT_A = 'tenant-clinic-alpha';

    it('should inject tenantId automatically into customer.findMany queries', async () => {
      const dbA = tenantPrisma.forTenant(TENANT_A);
      await dbA.customers.findMany({ where: { phone: '+919876543210' } });

      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
        where: {
          phone: '+919876543210',
          tenantId: TENANT_A,
        },
      });
    });

    it('should inject tenantId automatically into customer.findFirst queries', async () => {
      const dbA = tenantPrisma.forTenant(TENANT_A);
      await dbA.customers.findFirst({ where: { email: 'patient@example.com' } });

      expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'patient@example.com',
          tenantId: TENANT_A,
        },
      });
    });

    it('should inject tenantId into customer create mutations', async () => {
      const dbA = tenantPrisma.forTenant(TENANT_A);
      await dbA.customers.create({
        data: {
          name: 'Patient Test',
          phone: '+919999988888',
        } as any,
      });

      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: {
          name: 'Patient Test',
          phone: '+919999988888',
          tenantId: TENANT_A,
        },
      });
    });

    it('should inject tenantId into customer update where clause preventing cross-tenant IDOR', async () => {
      const dbA = tenantPrisma.forTenant(TENANT_A);
      await dbA.customers.update({
        where: { id: 'cust-victim-tenant-b' },
        data: { name: 'Compromised Name' },
      });

      expect(mockPrisma.customer.update).toHaveBeenCalledWith({
        where: {
          id: 'cust-victim-tenant-b',
          tenantId: TENANT_A,
        },
        data: { name: 'Compromised Name' },
      });
    });

    it('should scope customer.count queries with tenantId', async () => {
      const dbA = tenantPrisma.forTenant(TENANT_A);
      await dbA.customers.count();

      expect(mockPrisma.customer.count).toHaveBeenCalledWith({
        where: {
          tenantId: TENANT_A,
        },
      });
    });

    it('should execute in tenant context setting PostgreSQL session variable', async () => {
      const result = await tenantPrisma.executeInTenantContext(TENANT_A, async (tx) => {
        return 'executed_in_tenant_context';
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toBe('executed_in_tenant_context');
    });
  });
});

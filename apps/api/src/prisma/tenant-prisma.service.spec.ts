import { Test, TestingModule } from '@nestjs/testing';
import { TenantPrismaService } from './tenant-prisma.service';
import { PrismaService } from './prisma.service';

describe('TenantPrismaService — Multi-Tenant Isolation & Query Scoping', () => {
  let tenantPrisma: TenantPrismaService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn().mockImplementation((cb) => cb({
        ...mockPrisma,
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

  it('awaits transaction-local tenant configuration before invoking the callback', async () => {
    const events: string[] = [];
    const executeRaw = jest.fn(async (strings: TemplateStringsArray, value: string) => {
      expect(strings.join('?')).toBe("SELECT set_config('app.current_tenant_id', ?, true)");
      expect(value).toBe('tenant-a');
      await Promise.resolve();
      events.push('configured');
    });
    const tx = { $executeRaw: executeRaw };
    mockPrisma.$transaction.mockImplementation((callback: (client: typeof tx) => Promise<unknown>) => callback(tx));
    await tenantPrisma.executeInTenantContext('tenant-a', async client => {
      expect(client).toBe(tx);
      expect(events).toEqual(['configured']);
      events.push('queried');
    });
    expect(events).toEqual(['configured', 'queried']);
  });

  it('does not run tenant queries if session configuration fails or tenant is empty', async () => {
    const query = jest.fn();
    mockPrisma.$transaction.mockImplementation((callback: (client: unknown) => Promise<unknown>) =>
      callback({ $executeRaw: jest.fn().mockRejectedValue(new Error('connection unavailable')) }));
    await expect(tenantPrisma.executeInTenantContext('tenant-a', query)).rejects.toThrow('connection unavailable');
    await expect(tenantPrisma.executeInTenantContext(' ', query)).rejects.toThrow('Tenant context is required');
    expect(query).not.toHaveBeenCalled();
  });

  it('overrides tenant reassignment in scoped customer updates', async () => {
    await tenantPrisma.forTenant('tenant-a').customers.update({
      where: { id: 'customer-a', tenantId: 'tenant-b' },
      data: { tenantId: { set: 'tenant-b' }, name: 'Updated' },
    });
    expect(mockPrisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'customer-a', tenantId: 'tenant-a' },
      data: { tenantId: 'tenant-a', name: 'Updated' },
    });
  });

  it('keeps extended update and upsert tenant identity immutable', async () => {
    tenantPrisma.getExtendedClient('tenant-a');
    const operation = mockPrisma.$extends.mock.calls[0][0].query.$allModels.$allOperations;
    mockPrisma.customer.upsert = jest.fn().mockResolvedValue({});
    const query = jest.fn();
    for (const kind of ['update', 'upsert']) {
      const args = kind === 'update'
        ? { where: { id: 'a', tenantId: 'tenant-b' }, data: { tenantId: { set: 'tenant-b' } } }
        : { where: { id: 'a', tenantId: 'tenant-b' }, create: { tenantId: 'tenant-b' }, update: { tenantId: { set: 'tenant-b' } } };
      await operation({ model: 'Customer', operation: kind, args, query });
      const call = mockPrisma.customer[kind].mock.calls[0][0];
      expect(call.where.tenantId).toBe('tenant-a');
      if (kind === 'update') expect(call.data.tenantId).toBe('tenant-a');
      else {
        expect(call.create.tenantId).toBe('tenant-a');
        expect(call.update.tenantId).toBe('tenant-a');
      }
    }
    expect(query).not.toHaveBeenCalled();
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
          deletedAt: null,
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
          deletedAt: null,
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
        data: { name: 'Compromised Name', tenantId: TENANT_A },
      });
    });

    it('should scope customer.count queries with tenantId', async () => {
      const dbA = tenantPrisma.forTenant(TENANT_A);
      await dbA.customers.count();

      expect(mockPrisma.customer.count).toHaveBeenCalledWith({
        where: {
          tenantId: TENANT_A,
          deletedAt: null,
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

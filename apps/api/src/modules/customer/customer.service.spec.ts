import { CustomerService } from './customer.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockTenantPrisma: any;
  let mockCustomerDb: any;

  beforeEach(() => {
    mockCustomerDb = {
      findMany: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Alice' }]),
      count: jest.fn().mockResolvedValue(1),
      findFirst: jest.fn().mockResolvedValue({ id: 'c1', name: 'Alice' }),
      create: jest.fn().mockResolvedValue({ id: 'c2', name: 'Bob' }),
      update: jest.fn().mockResolvedValue({ id: 'c1', name: 'Alice Updated' }),
    };
    mockTenantPrisma = {
      forTenant: jest.fn().mockReturnValue({
        customers: mockCustomerDb,
        prisma: {
          conversation: { findMany: jest.fn().mockResolvedValue([]) },
          activity: { findMany: jest.fn().mockResolvedValue([]) },
        },
      }),
    };
    service = new CustomerService(mockTenantPrisma);
  });

  it('should find all customers scoped to tenant with pagination', async () => {
    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(mockCustomerDb.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('should find customer by id within tenant scope', async () => {
    const customer = await service.findById('tenant-1', 'c1');
    expect(customer.id).toBe('c1');
    expect(mockCustomerDb.findFirst).toHaveBeenCalledWith({
      where: { id: 'c1' },
    });
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../../prisma/tenant-prisma.service';

@Injectable()
export class CustomerService {
  constructor(private tenantPrisma: TenantPrismaService) {}

  async findAll(tenantId: string, page: number, limit: number) {
    const db = this.tenantPrisma.forTenant(tenantId);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      db.customers.findMany({ skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      db.customers.count(),
    ]);
    return { data, total, page, limit };
  }

  async findById(tenantId: string, id: string) {
    const db = this.tenantPrisma.forTenant(tenantId);
    const customer = await db.customers.findUnique({ where: { id, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, data: any) {
    const db = this.tenantPrisma.forTenant(tenantId);
    return db.customers.create({ data });
  }

  async update(tenantId: string, id: string, data: any) {
    const db = this.tenantPrisma.forTenant(tenantId);
    return db.customers.update({ where: { id, tenantId }, data });
  }

  async findOrCreateByPhone(tenantId: string, phone: string, name?: string) {
    const db = this.tenantPrisma.forTenant(tenantId);
    let customer = await db.customers.findFirst({ where: { phone } });
    if (!customer) {
      customer = await db.customers.create({ data: { phone, name } });
    }
    return customer;
  }

  async getConversations(tenantId: string, id: string) {
    return this.tenantPrisma.forTenant(tenantId).prisma.conversation.findMany({
      where: { customerId: id, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTimeline(tenantId: string, id: string) {
    return this.tenantPrisma.forTenant(tenantId).prisma.activity.findMany({
      where: { customerId: id, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

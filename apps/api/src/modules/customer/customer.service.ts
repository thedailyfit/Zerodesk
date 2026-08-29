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
    // FIX P1-01: Switched to findFirst to properly apply tenantId where clause safely.
    const customer = await db.customers.findFirst({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, data: any) {
    const db = this.tenantPrisma.forTenant(tenantId);
    return db.customers.create({ data });
  }

  async update(tenantId: string, id: string, data: any) {
    const db = this.tenantPrisma.forTenant(tenantId);
    // Note: update requires id to be unique.
    return db.customers.update({ where: { id, tenantId }, data });
  }

  async findOrCreateByPhone(tenantId: string, phone: string, name?: string) {
    const db = this.tenantPrisma.forTenant(tenantId);
    let customer = await db.customers.findFirst({ where: { phone } });
    if (!customer) {
      try {
          customer = await db.customers.create({ data: { phone, name } });
      } catch (error: any) {
          // Handle P0-01 race condition explicitly if unique constraint fails
          if (error.code === 'P2002') {
              customer = await db.customers.findFirst({ where: { phone } });
              if (!customer) {
                  throw new Error(`Failed to find or create customer with phone ${phone} due to P2002 race condition.`);
              }
          } else {
              throw error;
          }
      }
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
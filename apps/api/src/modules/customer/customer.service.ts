import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantPrismaService } from '../../prisma/tenant-prisma.service';
import { normalizePhoneNumber } from '../../common/utils/phone.util';

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
    const phone = data.phone ? normalizePhoneNumber(data.phone) : undefined;
    return db.customers.create({
      data: {
        ...data,
        ...(phone ? { phone } : {}),
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    const db = this.tenantPrisma.forTenant(tenantId);
    const phone = data.phone ? normalizePhoneNumber(data.phone) : undefined;
    try {
      return await db.customers.update({
        where: { id, tenantId },
        data: {
          ...data,
          ...(phone ? { phone } : {}),
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2025' || error?.message?.includes('Record to update not found')) {
        throw new NotFoundException('Customer not found');
      }
      throw error;
    }
  }

  async findOrCreateByPhone(tenantId: string, rawPhone: string, name?: string) {
    const phone = normalizePhoneNumber(rawPhone);
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
    const db = this.tenantPrisma.forTenant(tenantId);
    return db.client.conversation.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTimeline(tenantId: string, id: string) {
    const db = this.tenantPrisma.forTenant(tenantId);
    return db.client.activity.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Look up patient by phone number with recent appointments for pre-call recognition.
   */
  async findByPhone(tenantId: string, phone: string) {
    const db = this.tenantPrisma.forTenant(tenantId);
    const clean = phone.replace(/[^0-9+]/g, '');
    const customer = await db.customers.findFirst({
      where: {
        OR: [
          { phone: clean },
          { phone: clean.slice(-10) },
        ],
      },
      include: {
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 3,
        },
      },
    });
    return customer || null;
  }
}
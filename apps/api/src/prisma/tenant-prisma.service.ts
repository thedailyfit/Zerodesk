import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns an extended Prisma Client instance scoped to a specific tenant.
   * Uses Prisma Client Extensions ($extends) to automatically inject `tenantId`
   * into all query operations without requiring $transaction overhead.
   */
  getExtendedClient(tenantId: string) {
    return this.prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            const tenantModels = [
              'Customer',
              'Conversation',
              'Message',
              'Appointment',
              'Service',
              'StaffMember',
              'Lead',
              'KnowledgeDocument',
              'KnowledgeChunk',
              'AutomationWorkflow',
            ];

            if (tenantModels.includes(model)) {
              if (
                operation === 'findMany' ||
                operation === 'findFirst' ||
                operation === 'count' ||
                operation === 'deleteMany' ||
                operation === 'updateMany'
              ) {
                args.where = { ...args.where, tenantId };
              } else if (operation === 'create') {
                args.data = { ...args.data, tenantId };
              }
            }

            return query(args);
          },
        },
      },
    });
  }

  /**
   * Execute a callback within a strict PostgreSQL RLS session transaction.
   */
  async executeInTenantContext<T>(
    tenantId: string,
    callback: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant', ${tenantId}, true)`;
      return callback(tx as unknown as PrismaService);
    });
  }

  /**
   * Lightweight tenant-scoped wrapper for direct operations.
   */
  forTenant(tenantId: string) {
    return {
      tenantId,
      client: this.getExtendedClient(tenantId),
      prisma: this.prisma,
      customers: {
        findMany: (args: any = {}) =>
          this.prisma.customer.findMany({ ...args, where: { ...args.where, tenantId } }),
        findFirst: (args: any = {}) =>
          this.prisma.customer.findFirst({ ...args, where: { ...args.where, tenantId } }),
        findUnique: (args: any) =>
          this.prisma.customer.findUnique(args),
        create: (args: any) =>
          this.prisma.customer.create({ ...args, data: { ...args.data, tenantId } }),
        update: (args: any) =>
          this.prisma.customer.update(args),
        count: (args: any = {}) =>
          this.prisma.customer.count({ ...args, where: { ...args.where, tenantId } }),
      },
    };
  }
}

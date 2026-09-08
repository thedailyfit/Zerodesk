import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class TenantPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  getExtendedClient(tenantId: string) {
    return this.prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            const tenantModels = [
              'Customer', 'Conversation', 'Message', 'Appointment', 'Service', 'StaffMember',
              'Lead', 'KnowledgeDocument', 'KnowledgeChunk', 'AutomationWorkflow', 'Task', 'Activity', 'Invoice'
            ];
            if (tenantModels.includes(model)) {
              if (
                operation === 'findMany' || operation === 'findFirst' ||
                operation === 'count' || operation === 'deleteMany' || operation === 'updateMany'
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

  async executeInTenantContext<T>(
    tenantId: string,
    callback: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return callback(tx as unknown as PrismaService);
    });
  }

  forTenant(tenantId: string) {
    return {
      tenantId,
      client: this.getExtendedClient(tenantId),
      customers: {
        findMany: (args: any = {}) =>
          this.prisma.customer.findMany({ ...args, where: { ...args.where, tenantId } }),
        findFirst: (args: any = {}) =>
          this.prisma.customer.findFirst({ ...args, where: { ...args.where, tenantId } }),
        create: (args: any) =>
          this.prisma.customer.create({ ...args, data: { ...args.data, tenantId } }),
        update: (args: any) =>
          this.prisma.customer.update({
            ...args,
            where: { ...args.where, tenantId },
          }),
        count: (args: any = {}) =>
          this.prisma.customer.count({ ...args, where: { ...args.where, tenantId } }),
      },
    };
  }
}
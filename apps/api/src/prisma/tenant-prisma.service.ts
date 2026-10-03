import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  getExtendedClient(tenantId: string) {
    const execute = this.executeInTenantContext.bind(this);
    const tenantModels = new Set(Prisma.dmmf.datamodel.models.filter(model => model.fields.some(field => field.name === 'tenantId')).map(model => model.name));
    return this.prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            if (tenantModels.has(model)) {
              if (operation === 'create') {
                args.data = { ...args.data, tenantId };
              } else if (operation === 'createMany' || operation === 'createManyAndReturn') {
                args.data = (Array.isArray(args.data) ? args.data : [args.data]).map((data: object) => ({ ...data, tenantId }));
              } else {
                args.where = { ...args.where, tenantId };
                if (args.data) args.data = { ...args.data, tenantId };
                if (operation === 'upsert') {
                  args.create = { ...args.create, tenantId };
                  args.update = { ...args.update, tenantId };
                }
              }
              const delegate = model.charAt(0).toLowerCase() + model.slice(1);
              return execute(tenantId, tx => (tx as any)[delegate][operation](args));
            }
            return query(args);
          },
        },
      },
    });
  }

  async executeInTenantContext<T>(
    tenantId: string,
    callback: (prisma: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    if (!tenantId?.trim()) throw new Error('Tenant context is required');
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
      return callback(tx);
    });
  }

  forTenant(tenantId: string) {
    return {
      tenantId,
      client: this.getExtendedClient(tenantId),
      customers: {
        findMany: (args: any = {}) =>
          this.executeInTenantContext(tenantId, tx => tx.customer.findMany({ ...args, where: { ...args.where, tenantId, deletedAt: null } })),
        findFirst: (args: any = {}) =>
          this.executeInTenantContext(tenantId, tx => tx.customer.findFirst({ ...args, where: { ...args.where, tenantId, deletedAt: null } })),
        create: (args: any) =>
          this.executeInTenantContext(tenantId, tx => tx.customer.create({ ...args, data: { ...args.data, tenantId } })),
        update: (args: any) =>
          this.executeInTenantContext(tenantId, tx => tx.customer.update({
            ...args,
            where: { ...args.where, tenantId },
            data: { ...args.data, tenantId },
          })),
        count: (args: any = {}) =>
          this.executeInTenantContext(tenantId, tx => tx.customer.count({ ...args, where: { ...args.where, tenantId, deletedAt: null } })),
      },
    };
  }
}

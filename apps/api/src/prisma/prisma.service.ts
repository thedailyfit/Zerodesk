import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { tenantAsyncLocalStorage } from '../common/context/tenant-context';

const TENANT_MODELS = new Set<string>(
  (Prisma.dmmf?.datamodel?.models || [])
    .filter(model => model.fields.some(field => field.name === 'tenantId'))
    .map(model => model.name.charAt(0).toLowerCase() + model.name.slice(1))
);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [],
    });

    const self = this;
    return new Proxy(this, {
      get(target: any, prop: string | symbol, receiver: any) {
        if (typeof prop === 'string' && TENANT_MODELS.has(prop)) {
          const delegate = target[prop];
          if (!delegate) return delegate;

          const ctx = tenantAsyncLocalStorage.getStore();
          if (ctx?.tenantId) {
            return new Proxy(delegate, {
              get(modelTarget: any, action: string | symbol) {
                const origMethod = modelTarget[action];
                if (typeof origMethod !== 'function') return origMethod;

                return async function (...methodArgs: any[]) {
                  return self.$transaction(async (tx: any) => {
                    if (ctx.isSuperAdmin) {
                      await tx.$executeRaw`SELECT set_config('app.is_super_admin', 'true', true)`;
                    } else {
                      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`;
                    }
                    return tx[prop][action](...methodArgs);
                  });
                };
              },
            });
          }
        }

        if (prop === '$transaction') {
          const origTx = target.$transaction.bind(target);
          return async function (arg: any, ...rest: any[]) {
            const ctx = tenantAsyncLocalStorage.getStore();
            if (ctx?.tenantId && typeof arg === 'function') {
              return origTx(async (tx: any) => {
                if (ctx.isSuperAdmin) {
                  await tx.$executeRaw`SELECT set_config('app.is_super_admin', 'true', true)`;
                } else {
                  await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${ctx.tenantId}, true)`;
                }
                return arg(tx);
              }, ...rest);
            }
            return origTx(arg, ...rest);
          };
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('PostgreSQL database connected successfully.');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') throw error;
      this.logger.warn('PostgreSQL connection unavailable; database operations and readiness will fail.');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}


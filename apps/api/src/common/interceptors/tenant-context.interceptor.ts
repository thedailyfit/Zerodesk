import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantAsyncLocalStorage } from '../context/tenant-context';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (!request) {
      return next.handle();
    }

    const tenantId = request.tenantId || request.user?.tenantId || (request.headers?.['x-tenant-id'] ? String(request.headers['x-tenant-id']) : undefined);
    const isSuperAdmin = request.user?.role === 'SUPER_ADMIN' || request.user?.publicMetadata?.role === 'super_admin';

    return new Observable((subscriber) => {
      tenantAsyncLocalStorage.run({ tenantId, isSuperAdmin }, () => {
        next.handle().subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}

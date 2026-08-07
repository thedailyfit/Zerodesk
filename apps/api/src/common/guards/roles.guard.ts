import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleType } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ORG_ADMIN: 80,
  ADMIN: 80,
  MANAGER: 60,
  STAFF: 40,
  MEMBER: 40,
  VIEWER: 20,
};

function hasMinRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let userRole = (request.user?.role || request.user?.orgRole) as string;

    if (!userRole) {
      throw new ForbiddenException('No role assigned');
    }

    if (typeof userRole === 'string' && userRole.startsWith('org:')) {
      userRole = userRole.replace(/^org:/i, '').toUpperCase();
      if (userRole === 'ADMIN') userRole = 'ORG_ADMIN';
      if (userRole === 'MEMBER') userRole = 'STAFF';
    }

    const hasRole = requiredRoles.some((role) => hasMinRole(userRole, role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

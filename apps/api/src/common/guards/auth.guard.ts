import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private clerk;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get('CLERK_SECRET_KEY'),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await verifyToken(token, { secretKey: this.configService.get('CLERK_SECRET_KEY') });

      const dbUser = payload.sub
        ? await this.prisma.user.findUnique({
            where: { clerkUserId: payload.sub },
          })
        : null;

      const superAdminEmails = (this.configService.get<string>('SUPER_ADMIN_EMAILS') || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const isSuperAdminEmail = dbUser?.email && superAdminEmails.includes(dbUser.email.toLowerCase());
      const isSuperAdmin = dbUser?.role === 'SUPER_ADMIN' || isSuperAdminEmail;

      let computedRole = isSuperAdmin ? 'SUPER_ADMIN' : dbUser?.role;
      if (!computedRole) {
        const orgRole = payload.org_role as string;
        if (orgRole) {
          computedRole = orgRole.replace(/^org:/i, '').toUpperCase();
          if (computedRole === 'ADMIN') computedRole = 'ORG_ADMIN';
          if (computedRole === 'MEMBER') computedRole = 'STAFF';
        } else {
          computedRole = 'STAFF';
        }
      }

      request.user = {
        clerkUserId: payload.sub,
        orgId: payload.org_id,
        orgRole: payload.org_role,
        role: computedRole,
        email: dbUser?.email,
        tenantId: dbUser?.tenantId,
        id: dbUser?.id,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

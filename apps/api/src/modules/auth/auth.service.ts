import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async processWebhook(payload: any) {
    const { type, data } = payload;
    this.logger.log(`Processing Clerk webhook event: ${type}`);

    try {
      switch (type) {
        case 'organization.created':
        case 'organization.updated':
          await this.syncOrganization(data);
          break;
        case 'user.created':
        case 'user.updated':
          await this.syncUser(data);
          break;
        case 'organizationMembership.created':
        case 'organizationMembership.updated':
          await this.syncOrgMembership(data);
          break;
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing webhook event ${type}:`, error);
      throw error;
    }
  }

  private async syncOrganization(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await this.prisma.tenant.upsert({
      where: { clerkOrgId: data.id },
      update: {
        name: data.name,
        slug: slug,
        logoUrl: data.image_url || data.logo_url,
      },
      create: {
        clerkOrgId: data.id,
        name: data.name,
        slug: slug,
        industry: 'general',
        logoUrl: data.image_url || data.logo_url,
      },
    });
    this.logger.log(`Synced tenant organization: ${data.name} (${data.id})`);
  }

  private async syncUser(data: any) {
    const primaryEmail = data.email_addresses?.[0]?.email_address || '';
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User';

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { clerkUserId: data.id },
    });

    if (existingUser) {
      await this.prisma.user.update({
        where: { clerkUserId: data.id },
        data: {
          email: primaryEmail,
          name: name,
          avatarUrl: data.image_url,
        },
      });
      this.logger.log(`Updated user: ${primaryEmail} (${data.id})`);
      return;
    }

    // Check if user has an active organization in Clerk payload
    const orgId = data.organization_id || data.org_id;
    let targetTenant = orgId
      ? await this.prisma.tenant.findUnique({ where: { clerkOrgId: orgId } })
      : null;

    // If no organization yet, create an isolated personal sandbox tenant for the new user
    if (!targetTenant) {
      const personalSlug = `workspace-${data.id.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-10)}-${Date.now().toString().slice(-4)}`;
      targetTenant = await this.prisma.tenant.create({
        data: {
          clerkOrgId: `pending_${data.id}`,
          name: `${name}'s Workspace`,
          slug: personalSlug,
          industry: 'general',
        },
      });
      this.logger.log(`Created isolated personal tenant for new user ${primaryEmail}: ${targetTenant.slug}`);
    }

    const superAdminEmails = (this.configService.get<string>('SUPER_ADMIN_EMAILS') || '')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean);

    const isSuperAdmin = superAdminEmails.includes(primaryEmail.toLowerCase());

    await this.prisma.user.create({
      data: {
        clerkUserId: data.id,
        email: primaryEmail,
        name: name,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'STAFF',
        tenantId: targetTenant.id,
        avatarUrl: data.image_url,
      },
    });
    this.logger.log(`Synced user: ${primaryEmail} (${data.id}) to tenant ${targetTenant.id}`);
  }

  private async syncOrgMembership(data: any) {
    const clerkOrgId = data.organization?.id;
    const clerkUserId = data.public_user_data?.user_id || data.user_id;
    const memberRole = data.role as string;

    if (!clerkOrgId || !clerkUserId) return;

    const tenant = await this.prisma.tenant.findUnique({ where: { clerkOrgId } });
    if (tenant) {
      const assignedRole = memberRole === 'org:admin' || memberRole === 'admin' ? 'ADMIN' : 'STAFF';

      await this.prisma.user.updateMany({
        where: { clerkUserId },
        data: {
          tenantId: tenant.id,
          role: assignedRole,
        },
      });
      this.logger.log(`Assigned user ${clerkUserId} to tenant ${tenant.name} with role ${assignedRole}`);
    }
  }
}

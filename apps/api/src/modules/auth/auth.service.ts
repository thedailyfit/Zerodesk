import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  async processWebhook(payload: any) {
    const { type, data } = payload;
    this.logger.log(`Processing Clerk webhook: ${type}`);

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
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing webhook ${type}:`, error);
      throw error;
    }
  }

  private async syncOrganization(data: any) {
    await this.prisma.tenant.upsert({
      where: { clerkOrgId: data.id },
      update: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.image_url,
      },
      create: {
        clerkOrgId: data.id,
        name: data.name,
        slug: data.slug,
        industry: 'other',
        logoUrl: data.image_url,
      },
    });
  }

  private async syncUser(data: any) {
    // Basic sync, assumes single tenant or primary tenant assignment elsewhere
    // This will need tenant association logic based on clerk org membership
    this.logger.debug('Syncing user', data.id);
  }
}

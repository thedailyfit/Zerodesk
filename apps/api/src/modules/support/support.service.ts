import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.supportTicket.create({
      data: {
        tenantId,
        subject: data.subject || 'Support Request',
        description: data.description || data.message || '',
        priority: data.priority || 'MEDIUM',
        category: data.category || 'GENERAL',
        contactEmail: data.contactEmail || data.email,
        contactPhone: data.contactPhone || data.phone,
        metadata: data.metadata || {},
      },
      include: {
        tenant: {
          select: { id: true, name: true, industry: true },
        },
      },
    });
  }

  async findAllForTenant(tenantId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.supportTicket.findMany({
      include: {
        tenant: {
          select: { id: true, name: true, industry: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status },
      include: {
        tenant: {
          select: { id: true, name: true, industry: true },
        },
      },
    });
  }
}

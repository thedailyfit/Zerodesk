import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.service.findMany({
      where: { tenantId, isActive: true },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.service.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async search(tenantId: string, query: string) {
    if (!tenantId) return [];
    return this.prisma.service.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        } : {}),
      },
      select: {
        id: true,
        name: true,
        category: true,
        durationMins: true,
        price: true,
        description: true,
      },
    });
  }
}

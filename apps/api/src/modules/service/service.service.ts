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
}

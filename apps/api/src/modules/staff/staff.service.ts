import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.staffMember.findMany({
      where: { tenantId },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.staffMember.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateAvailability(tenantId: string, id: string, availability: any) {
    return this.prisma.staffMember.update({
      where: { id, tenantId },
      data: { availability },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.appointment.findMany({
      where: { tenantId },
      include: { customer: true, service: true, staff: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getAvailability(tenantId: string) {
    return [];
  }

  async book(tenantId: string, data: any) {
    return this.prisma.appointment.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    return this.prisma.appointment.update({
      where: { id, tenantId },
      data: { status: 'CANCELLED' },
    });
  }
}

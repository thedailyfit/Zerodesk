import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { customer: true, items: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async create(tenantId: string, data: any) {
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const invoiceNumber =
      data.invoiceNumber || `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const items = data.items || [];
    const subtotal = Number(
      data.subtotal ||
        items.reduce(
          (sum: number, it: any) => sum + Number(it.unitPrice || it.price || 0) * Number(it.quantity || 1),
          0
        )
    );
    const taxAmount = Number(data.taxAmount || 0);
    const totalAmount = Number(data.totalAmount || subtotal + taxAmount);

    return this.prisma.invoice.create({
      data: {
        tenantId,
        customerId: data.customerId || null,
        invoiceNumber,
        subtotal,
        taxAmount,
        totalAmount,
        status: data.status || 'PAID',
        paymentMethod: data.paymentMethod || 'UPI',
        notes: data.notes,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        items: {
          create: items.map((it: any) => ({
            description: it.description || it.name || 'Service',
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || it.price || 0),
            totalPrice: Number(
              it.totalPrice || Number(it.unitPrice || it.price || 0) * Number(it.quantity || 1)
            ),
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findById(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: data.status,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
      include: { customer: true, items: true },
    });
  }
}

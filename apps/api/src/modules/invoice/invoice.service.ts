import * as crypto from 'node:crypto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { customer: true, items: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async create(tenantId: string, data: any, verifiedBy?: string) {
    if (data.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: data.customerId, tenantId, deletedAt: null },
      });
      if (!customer) {
        throw new NotFoundException('Customer does not belong to this tenant');
      }
    }

    const accounting = this.calculate(data);
    const paymentEvidence = this.paymentEvidence(data, accounting.paidAmount, verifiedBy);
    const invoiceNumber = data.invoiceNumber || `INV-${crypto.randomUUID()}`;
    return this.prisma.invoice.create({
      data: {
        tenantId, customerId: data.customerId || null, invoiceNumber,
        customerName: data.customerName, customerPhone: data.phone, customerEmail: data.email,
        ...accounting, ...paymentEvidence, paymentMethod: data.paymentMethod || null, notes: data.notes,
        dueDate: data.dueDate ? this.date(data.dueDate) : undefined,
        items: { create: accounting.items.map((item: any) => ({ ...item, tenantId })) },
      }, include: { customer: true, items: true },
    });
  }

  private date(value: string) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) throw new BadRequestException('Invalid invoice date');
    return date;
  }

  private number(value: unknown, name: string, max = 1e9) {
    const n = Number(value);
    if (value === null || value === '' || !Number.isFinite(n) || n < 0 || n > max) throw new BadRequestException(`Invalid ${name}`);
    return n;
  }

  calculate(data: any) {
    if (!Array.isArray(data?.items) || !data.items.length || data.items.length > 500) throw new BadRequestException('Invoice requires 1-500 items');
    const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    const items = data.items.map((item: any) => {
      const quantity = this.number(item.quantity ?? 1, 'quantity', 100000);
      if (!quantity || !Number.isInteger(quantity)) throw new BadRequestException('Quantity must be a positive integer');
      const unitPrice = round(this.number(item.unitPrice ?? item.price ?? 0, 'unit price'));
      const gstRate = this.number(item.gstRate ?? 0, 'tax rate', 100);
      const description = item.description || item.serviceName || item.name;
      if (typeof description !== 'string' || !description.trim() || description.length > 2000) throw new BadRequestException('Item description required');
      return { description, quantity, unitPrice, gstRate, gstAmount: 0, totalPrice: round(quantity * unitPrice) };
    });
    const subtotal = round(items.reduce((sum: number, item: any) => sum + item.totalPrice, 0));
    if (subtotal > 1e9) throw new BadRequestException('Invoice amount exceeds limit');
    const discountType = data.discountType ?? 'amount';
    if (!['amount', 'percent'].includes(discountType)) throw new BadRequestException('Invalid discount type');
    const discountValue = this.number(data.discountValue ?? 0, 'discount', discountType === 'percent' ? 100 : subtotal);
    const discountAmount = round(discountType === 'percent' ? subtotal * discountValue / 100 : discountValue);
    for (const item of items) {
      const discounted = item.totalPrice * (subtotal ? 1 - discountAmount / subtotal : 1);
      item.gstAmount = round(discounted * item.gstRate / 100);
      item.totalPrice = round(discounted + item.gstAmount);
    }
    const taxAmount = round(items.reduce((sum: number, item: any) => sum + item.gstAmount, 0));
    const totalAmount = round(subtotal - discountAmount + taxAmount);
    const paidAmount = round(this.number(data.paidAmount ?? 0, 'paid amount', totalAmount));
    const status = paidAmount > 0 && paidAmount >= totalAmount ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING';
    return { subtotal, taxAmount, totalAmount, discountType, discountValue, discountAmount, paidAmount, status, items };
  }

  private paymentEvidence(data: any, paidAmount: number, verifiedBy?: string) {
    if (!paidAmount) return {};
    if (data.paymentMethod !== 'CASH' || typeof data.manualCashReceiptId !== 'string' ||
        !/^[A-Za-z0-9][A-Za-z0-9._/-]{2,99}$/.test(data.manualCashReceiptId) || !verifiedBy) {
      throw new BadRequestException('A manager-verified cash receipt is required; online payment references must be verified by the payment provider');
    }
    return { manualCashReceiptId: data.manualCashReceiptId, paymentVerifiedBy: verifiedBy, paymentVerifiedAt: new Date() };
  }

  async update(tenantId: string, id: string, data: any, verifiedBy?: string) {
    const invoice = await this.findById(tenantId, id);
    const paidAmount = data.paidAmount === undefined ? Number(invoice.paidAmount) : this.number(data.paidAmount, 'paid amount', Number(invoice.totalAmount));
    const status = paidAmount > 0 && paidAmount >= Number(invoice.totalAmount) ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : (data.status === 'OVERDUE' ? 'OVERDUE' : 'PENDING');
    if (data.status === 'PAID' && status !== 'PAID') throw new BadRequestException('Record the paid amount before marking paid');
    const paymentEvidence = this.paymentEvidence({ ...invoice, ...data }, paidAmount, verifiedBy);
    return this.prisma.invoice.update({
      where: { id, tenantId, deletedAt: null },
      data: { status, paidAmount, ...paymentEvidence, paymentMethod: data.paymentMethod, notes: data.notes },
      include: { customer: true, items: true },
    });
  }

  async softDelete(tenantId: string, id: string) {
    const invoice = await this.findById(tenantId, id);
    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { deletedAt: new Date() },
    });
  }
}

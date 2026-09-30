import { InvoiceService } from './invoice.service';

describe('invoice authoritative arithmetic', () => {
  const service = new InvoiceService({} as any);
  it('calculates discounted tax and partial balances without trusting client totals', () => {
    expect(service.calculate({ items: [{ description: 'Service', unitPrice: 100, quantity: 2, gstRate: 18 }], discountType: 'percent', discountValue: 10, paidAmount: 100, totalAmount: 1, status: 'PAID' })).toMatchObject({ subtotal: 200, discountAmount: 20, taxAmount: 32.4, totalAmount: 212.4, paidAmount: 100, status: 'PARTIAL' });
  });
  it('rejects negative, nonfinite, overpaid and empty invoices', () => {
    for (const items of [[], [{ description: 'Service', unitPrice: -1 }], [{ description: 'Service', unitPrice: Infinity }], [{ description: 'Service', unitPrice: 5, quantity: 0 }]]) {
      expect(() => service.calculate({ items })).toThrow();
    }
    expect(() => service.calculate({ items: [{ description: 'Service', unitPrice: 10 }], paidAmount: 11 })).toThrow();
  });
  it('does not infer payment from a status label', () => {
    expect(service.calculate({ items: [{ description: 'Service', unitPrice: 10 }], status: 'PAID' })).toMatchObject({ paidAmount: 0, status: 'PENDING' });
  });
});

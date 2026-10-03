'use client';

import { tenantStorage } from '@/lib/tenant-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';
import { api } from '@/lib/api-client';

export interface InvoiceLineItem {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  nicheId: NicheId;
  patientId?: string;
  customerName: string;
  phone: string;
  email?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalGst: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance' | 'partial';
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  paidAmount: number;
  manualCashReceiptId?: string;
  remainingBalance: number;
  dueDate: string;
  createdDate: string;
  sentViaAi: boolean;
  isPackagePayment: boolean;
  packageSessionNumber?: number;
  notes?: string;
}

export const getInvoicesStorageKey = (tenantId?: string | null) => {
  const tid = tenantId || (typeof window !== 'undefined' ? tenantStorage.getItem('zerodesk_tenant_id') : null) || 'default';
  return `zerodesk_invoices_${tid}`;
};

export const INVOICES_STORAGE_KEY = 'zerodesk_invoices_cache';

export function useInvoices() {
  const { currentNiche } = useNiche();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTenantId = typeof window !== 'undefined' ? tenantStorage.getItem('zerodesk_tenant_id') : null;
  const storageKey = getInvoicesStorageKey(activeTenantId);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);

    // 1. Immediately read cached invoices from localStorage
    setInvoices([]);
    try {
      const data = await api.get<any[]>('/invoices');
      if (Array.isArray(data)) {
        const mapped: InvoiceRecord[] = data.map((inv) => {
          const grandTotal = Number(inv.grandTotal || inv.totalAmount || 0);
          const isPaid = inv.paymentStatus === 'PAID' || inv.status === 'PAID';
          const paid = inv.paidAmount !== undefined && inv.paidAmount !== null 
            ? Number(inv.paidAmount) 
            : (isPaid ? grandTotal : 0);
          const remaining = Math.max(0, grandTotal - paid);

          const items: InvoiceLineItem[] = Array.isArray(inv.lineItems || inv.items)
            ? (inv.lineItems || inv.items).map((li: any) => {
                const rate = li.gstRate !== undefined && li.gstRate !== null ? Number(li.gstRate) : 0;
                const price = Number(li.unitPrice || li.price || 0);
                const qty = Number(li.quantity || 1);
                const tax = li.gstAmount !== undefined && li.gstAmount !== null 
                  ? Number(li.gstAmount) 
                  : Math.round(price * qty * (rate / 100));
                return {
                  serviceId: li.serviceId,
                  serviceName: li.serviceName || li.description || 'Service',
                  quantity: qty,
                  unitPrice: price,
                  gstRate: rate,
                  gstAmount: tax,
                  totalPrice: Number(li.totalPrice || price * qty + tax),
                };
              })
            : [];

          return {
            id: inv.id,
            invoiceNo: inv.invoiceNumber || `INV-${inv.id.slice(0, 8).toUpperCase()}`,
            nicheId: currentNiche,
            patientId: inv.customerId || undefined,
            customerName: inv.customerName || inv.customer?.name || 'Customer',
            phone: inv.customerPhone || inv.phone || inv.customer?.phone || '',
            email: inv.customerEmail || inv.email || inv.customer?.email || undefined,
            lineItems: items,
            subtotal: inv.subtotal !== undefined && inv.subtotal !== null ? Number(inv.subtotal) : grandTotal,
            totalGst: inv.taxAmount !== undefined && inv.taxAmount !== null ? Number(inv.taxAmount) : 0,
            discountType: inv.discountType || 'amount',
            discountValue: Number(inv.discountValue || 0),
            discountAmount: Number(inv.discountAmount || 0),
            grandTotal,
            paymentMethod: (inv.paymentMethod?.toLowerCase() as any) || 'upi',
            paymentStatus: (inv.paymentStatus || inv.status || 'PENDING').toUpperCase() as any,
            paidAmount: paid,
            manualCashReceiptId: inv.manualCashReceiptId || undefined,
            remainingBalance: remaining,
            dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            createdDate: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            sentViaAi: false,
            isPackagePayment: false,
            notes: inv.notes,
          };
        });

        setInvoices(mapped);
      } else { setInvoices([]); }
    } catch (e) {
      console.error('Invoices could not be loaded:', e);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentNiche, storageKey]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Synchronize across components and tabs
  useEffect(() => {
    const handleSync = () => { void loadInvoices(); };

    window.addEventListener('zerodesk:invoices-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zerodesk:invoices-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadInvoices]);

  const addInvoice = useCallback(async (data: Omit<InvoiceRecord, 'id' | 'invoiceNo'>) => {
    const created = await api.post<any>('/invoices', {
      customerId: data.patientId, customerName: data.customerName, phone: data.phone, email: data.email,
      subtotal: data.subtotal, taxAmount: data.totalGst, totalAmount: data.grandTotal,
      paidAmount: data.paidAmount, discountType: data.discountType,
      manualCashReceiptId: data.manualCashReceiptId?.trim(),
      discountValue: data.discountValue, discountAmount: data.discountAmount,
      status: data.paymentStatus, paymentMethod: data.paymentMethod.toUpperCase(),
      notes: data.notes, dueDate: data.dueDate.split('T')[0],
      items: data.lineItems.map(li => ({ ...li, description: li.serviceName })),
    });
    if (!created?.id) throw new Error('Invoice was not saved. Please retry.');
    await loadInvoices();
    window.dispatchEvent(new Event('zerodesk:invoices-updated'));
    return created;
  }, [loadInvoices]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<InvoiceRecord>) => {
    await api.put(`/invoices/${id}`, {
      status: updates.paymentStatus, paidAmount: updates.paidAmount,
      manualCashReceiptId: updates.manualCashReceiptId?.trim(),
      paymentMethod: updates.paymentMethod?.toUpperCase(), notes: updates.notes,
    });
    await loadInvoices();
    window.dispatchEvent(new Event('zerodesk:invoices-updated'));
  }, [loadInvoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    await api.delete(`/invoices/${id}`);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    window.dispatchEvent(new Event('zerodesk:invoices-updated'));
  }, []);

  const getInvoicesByPatientId = useCallback(
    (patientId: string) => {
      return invoices.filter((inv) => inv.patientId === patientId);
    },
    [invoices]
  );

  const getInvoicesByStatus = useCallback(
    (status: InvoiceRecord['paymentStatus']) => {
      return invoices.filter((inv) => inv.paymentStatus === status);
    },
    [invoices]
  );

  const getInvoicesByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      return invoices.filter((inv) => inv.createdDate >= startDate && inv.createdDate <= endDate);
    },
    [invoices]
  );

  const resetToDefaults = useCallback(() => {
    loadInvoices();
  }, [loadInvoices]);

  const totalInvoiced = useMemo(() => invoices.reduce((sum, inv) => sum + inv.grandTotal, 0), [invoices]);
  const totalCollected = useMemo(
    () => invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    [invoices]
  );
  const totalPending = useMemo(
    () =>
      invoices
        .filter((inv) => inv.paymentStatus === 'PENDING' || inv.paymentStatus === 'PARTIAL')
        .reduce((sum, inv) => sum + inv.remainingBalance, 0),
    [invoices]
  );
  const totalOverdue = useMemo(
    () => invoices.filter((inv) => inv.paymentStatus === 'OVERDUE').reduce((sum, inv) => sum + inv.remainingBalance, 0),
    [invoices]
  );

  return {
    invoices,
    isLoading,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByPatientId,
    getInvoicesByStatus,
    getInvoicesByDateRange,
    totalInvoiced,
    totalCollected,
    totalPending,
    totalOverdue,
    resetToDefaults,
  };
}

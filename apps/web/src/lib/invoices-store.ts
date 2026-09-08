'use client';

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
  remainingBalance: number;
  dueDate: string;
  createdDate: string;
  sentViaAi: boolean;
  isPackagePayment: boolean;
  packageSessionNumber?: number;
  notes?: string;
}

export function useInvoices() {
  const { currentNiche } = useNiche();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any[]>('/invoices');
      if (Array.isArray(data) && data.length > 0) {
        const mapped: InvoiceRecord[] = data.map((inv) => {
          const grandTotal = inv.grandTotal || inv.totalAmount || 0;
          const paid = inv.paidAmount || (inv.paymentStatus === 'PAID' ? grandTotal : 0);
          const remaining = Math.max(0, grandTotal - paid);

          const items: InvoiceLineItem[] = Array.isArray(inv.lineItems || inv.items)
            ? (inv.lineItems || inv.items).map((li: any) => ({
                serviceId: li.serviceId,
                serviceName: li.serviceName || li.description || 'Clinical Service',
                quantity: li.quantity || 1,
                unitPrice: li.unitPrice || 0,
                gstRate: li.gstRate || 18,
                gstAmount: li.gstAmount || Math.round((li.unitPrice || 0) * 0.18),
                totalPrice: li.totalPrice || (li.unitPrice || 0) * (li.quantity || 1),
              }))
            : [];

          return {
            id: inv.id,
            invoiceNo: inv.invoiceNumber || `INV-${inv.id.slice(0, 8).toUpperCase()}`,
            nicheId: currentNiche,
            customerName: inv.customerName || inv.customer?.name || 'Customer',
            phone: inv.customer?.phone || '',
            email: inv.customer?.email || undefined,
            lineItems: items,
            subtotal: inv.subtotal || grandTotal,
            totalGst: inv.taxAmount || Math.round(grandTotal * 0.18),
            discountType: 'amount',
            discountValue: 0,
            discountAmount: 0,
            grandTotal,
            paymentMethod: (inv.paymentMethod?.toLowerCase() as any) || 'upi',
            paymentStatus: (inv.paymentStatus || inv.status || 'PENDING').toUpperCase() as any,
            paidAmount: paid,
            remainingBalance: remaining,
            dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            createdDate: inv.createdAt ? new Date(inv.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            sentViaAi: false,
            isPackagePayment: false,
            notes: inv.notes,
          };
        });
        setInvoices(mapped);
      } else {
        setInvoices([]);
      }
    } catch (e) {
      console.warn('Could not fetch real invoices, using empty state:', e);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentNiche]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const addInvoice = useCallback(
    async (invoiceData: Omit<InvoiceRecord, 'id' | 'invoiceNo'>) => {
      const currentYear = new Date().getFullYear().toString();
      const invoiceNo = `INV-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newInvoice: InvoiceRecord = {
        ...invoiceData,
        id: crypto.randomUUID(),
        invoiceNo,
      };

      setInvoices((prev) => [newInvoice, ...prev]);

      try {
        await api.post('/invoices', {
          invoiceNumber: newInvoice.invoiceNo,
          customerName: newInvoice.customerName,
          subtotal: newInvoice.subtotal,
          taxAmount: newInvoice.totalGst,
          totalAmount: newInvoice.grandTotal,
          paidAmount: newInvoice.paidAmount,
          status: newInvoice.paymentStatus,
          paymentMethod: newInvoice.paymentMethod.toUpperCase(),
          notes: newInvoice.notes,
          dueDate: newInvoice.dueDate,
          items: newInvoice.lineItems.map((li) => ({
            description: li.serviceName,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            totalPrice: li.totalPrice,
          })),
        });
      } catch (err) {
        console.error('Failed to create invoice on backend:', err);
      }
    },
    []
  );

  const updateInvoice = useCallback((id: string, updates: Partial<InvoiceRecord>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
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
    () => invoices.filter((inv) => inv.paymentStatus === 'PAID').reduce((sum, inv) => sum + inv.paidAmount, 0),
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

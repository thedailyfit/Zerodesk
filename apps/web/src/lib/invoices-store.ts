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

export const INVOICES_STORAGE_KEY = 'zerodesk_invoices_cache';

export function useInvoices() {
  const { currentNiche } = useNiche();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);

    // 1. Immediately read cached invoices from localStorage
    let cached: InvoiceRecord[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cached = parsed;
            setInvoices(cached);
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached invoices:', e);
      }
    }

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

        // Merge: keep locally cached invoices not yet returned by backend
        const backendKeys = new Set(mapped.map((b) => b.id));
        const backendNumbers = new Set(mapped.map((b) => b.invoiceNo));
        const localOnly = cached.filter((c) => !backendKeys.has(c.id) && !backendNumbers.has(c.invoiceNo));
        const merged = [...localOnly, ...mapped];

        setInvoices(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(merged));
        }
      } else if (cached.length > 0) {
        setInvoices(cached);
      } else {
        setInvoices([]);
      }
    } catch (e) {
      console.warn('Could not fetch real invoices, using cache or empty state:', e);
      if (cached.length > 0) {
        setInvoices(cached);
      } else {
        setInvoices([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentNiche]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Synchronize across components and tabs
  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setInvoices(parsed);
            }
          }
        } catch (e) {
          console.warn('Failed to parse invoices on sync event:', e);
        }
      }
    };

    window.addEventListener('zerodesk:invoices-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zerodesk:invoices-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const addInvoice = useCallback(
    async (invoiceData: Omit<InvoiceRecord, 'id' | 'invoiceNo'>) => {
      const currentYear = new Date().getFullYear().toString();
      const invoiceNo = `INV-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

      const createdDate = invoiceData.createdDate
        ? (invoiceData.createdDate.includes('T') ? invoiceData.createdDate.split('T')[0] : invoiceData.createdDate)
        : new Date().toISOString().split('T')[0];

      const dueDate = invoiceData.dueDate
        ? (invoiceData.dueDate.includes('T') ? invoiceData.dueDate.split('T')[0] : invoiceData.dueDate)
        : new Date().toISOString().split('T')[0];

      const newInvoice: InvoiceRecord = {
        ...invoiceData,
        createdDate,
        dueDate,
        id: crypto.randomUUID(),
        invoiceNo,
      };

      // 1. Immediately prepend to localStorage cache
      let updated: InvoiceRecord[] = [newInvoice];
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
          const existing = raw ? JSON.parse(raw) : [];
          if (Array.isArray(existing)) {
            updated = [newInvoice, ...existing.filter((i: any) => i.id !== newInvoice.id)];
          }
          localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('zerodesk:invoices-updated'));
        } catch (err) {
          console.error('Failed to update invoices cache in addInvoice:', err);
        }
      }

      setInvoices((prev) => [newInvoice, ...prev.filter((i) => i.id !== newInvoice.id)]);

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
    setInvoices((prev) => {
      const updated = prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('zerodesk:invoices-updated'));
        } catch (e) {
          console.warn('Failed to update invoices cache on update:', e);
        }
      }
      return updated;
    });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new Event('zerodesk:invoices-updated'));
        } catch (e) {
          console.warn('Failed to update invoices cache on delete:', e);
        }
      }
      return updated;
    });
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

'use client';

import { useState, useEffect } from 'react';

export interface InvoiceTemplate {
  logoDataUrl: string | null;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicGST: string;
  brandColor: string;
  templateStyle: 'classic' | 'modern' | 'minimal' | 'branded' | 'executive' | 'compact';
  footerNote: string;
}

const DEFAULT_TEMPLATE: InvoiceTemplate = {
  logoDataUrl: null,
  clinicName: 'ZeroDesk Clinic',
  clinicAddress: '',
  clinicPhone: '',
  clinicGST: '',
  brandColor: '#2563eb',
  templateStyle: 'modern',
  footerNote: 'Thank you for choosing ZeroDesk.',
};

export function useInvoiceTemplate() {
  const [template, setTemplate] = useState<InvoiceTemplate>(DEFAULT_TEMPLATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_invoice_template');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clinicPhone === '+91 98765 43210' || parsed.clinicGST === '29ABCDE1234F1Z5') {
          localStorage.removeItem('zerodesk_invoice_template');
          setTemplate(DEFAULT_TEMPLATE);
        } else if (parsed && typeof parsed === 'object') {
          setTemplate({ ...DEFAULT_TEMPLATE, ...parsed });
        }
      }
    } catch (e) {
      console.error('Failed to load invoice template', e);
    }
    setIsLoaded(true);
  }, []);

  const updateTemplate = (updates: Partial<InvoiceTemplate>) => {
    setTemplate((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('zerodesk_invoice_template', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save invoice template', e);
      }
      return next;
    });
  };

  const resetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    try {
      localStorage.removeItem('zerodesk_invoice_template');
    } catch (e) {
      console.error('Failed to reset template', e);
    }
  };

  return {
    template,
    isLoaded,
    updateTemplate,
    resetTemplate,
  };
}

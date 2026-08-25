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
  clinicName: 'ZeroDesk Clinic & Aesthetics',
  clinicAddress: '402, Elite Medical Hub, Indiranagar, Bengaluru, KA 560038',
  clinicPhone: '+91 98765 43210',
  clinicGST: '29ABCDE1234F1Z5',
  brandColor: '#2563eb',
  templateStyle: 'modern',
  footerNote: 'Thank you for choosing ZeroDesk. Please retain this invoice for your medical insurance and follow-up consultation.',
};

export function useInvoiceTemplate() {
  const [template, setTemplate] = useState<InvoiceTemplate>(DEFAULT_TEMPLATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_invoice_template');
      if (saved) {
        setTemplate(JSON.parse(saved));
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

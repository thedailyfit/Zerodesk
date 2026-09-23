'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ParkedBill {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  items: string;
  totalAmount: number;
  time: string;
  tag: string;
  quantities: Record<string, number>;
}

const DEFAULT_PARKED_BILLS: ParkedBill[] = [];

export function useParkedBills() {
  const [parkedBills, setParkedBillsState] = useState<ParkedBill[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_parked_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = Array.isArray(parsed) 
          ? parsed.filter((b: ParkedBill) => b.id !== 'park-1' && b.id !== 'park-2')
          : [];
        setParkedBillsState(filtered);
      } else {
        localStorage.setItem('zerodesk_parked_bills', JSON.stringify([]));
      }
    } catch (e) {
      console.error('Failed to load parked bills', e);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zerodesk_parked_bills' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setParkedBillsState(Array.isArray(parsed) ? parsed : []);
        } catch {}
      }
    };
    
    const handleCustomEvent = () => {
      try {
        const saved = localStorage.getItem('zerodesk_parked_bills');
        if (saved) {
            const parsed = JSON.parse(saved);
            setParkedBillsState(Array.isArray(parsed) ? parsed : []);
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('zerodesk_parked_bills_changed', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('zerodesk_parked_bills_changed', handleCustomEvent);
    };
  }, []);

  const saveBills = useCallback((newBills: ParkedBill[]) => {
    try {
      localStorage.setItem('zerodesk_parked_bills', JSON.stringify(newBills));
      setParkedBillsState(newBills);
      window.dispatchEvent(new Event('zerodesk_parked_bills_changed'));
    } catch (e) {
      console.error('Failed to save parked bills', e);
    }
  }, []);

  const addParkedBill = useCallback((bill: Omit<ParkedBill, 'id' | 'time'>) => {
    const newBill: ParkedBill = {
      ...bill,
      id: 'park-' + Date.now(),
      time: 'Just now'
    };
    setParkedBillsState(prev => {
      const updated = [newBill, ...prev];
      try {
        localStorage.setItem('zerodesk_parked_bills', JSON.stringify(updated));
        window.dispatchEvent(new Event('zerodesk_parked_bills_changed'));
      } catch {}
      return updated;
    });
    return newBill;
  }, []);

  const removeParkedBill = useCallback((id: string) => {
    setParkedBillsState(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('zerodesk_parked_bills', JSON.stringify(updated));
        window.dispatchEvent(new Event('zerodesk_parked_bills_changed'));
      } catch {}
      return updated;
    });
  }, []);

  return {
    parkedBills,
    addParkedBill,
    removeParkedBill,
    setParkedBills: saveBills
  };
}

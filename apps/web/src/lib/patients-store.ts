'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';
import { api } from '@/lib/api-client';

export interface PrescriptionRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  medications: string;
  notes?: string;
  fileDataUrl?: string;
  fileName?: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  category: 'Prescription' | 'Lab Result' | 'X-Ray/Scan' | 'Pre-op Photo' | 'Before/After Photo' | 'Consent Form' | 'Invoice/Receipt' | 'Insurance Document' | 'Treatment Plan';
  uploadDate: string;
  uploadedBy: string;
  fileDataUrl?: string;
  fileSize?: string;
}

export interface TreatmentPlan {
  id: string;
  packageName: string;
  serviceId: string;
  totalSessions: number;
  completedSessions: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  startDate: string;
  nextSessionDate?: string;
  status: 'Active' | 'Completed' | 'Paused' | 'Cancelled';
  payments: { date: string; amount: number; method: string; sessionNumber: number }[];
}

export interface PatientRecord {
  id: string;
  nicheId: NicheId;
  name: string;
  phone: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
  priority: 'VIP' | 'High' | 'Medium' | 'Standard';
  tags: string[];
  registrationDate: string;
  totalVisits: number;
  ltv: number;
  lastVisit?: string;
  prescriptions: PrescriptionRecord[];
  uploadedFiles: UploadedFile[];
  treatmentPlans: TreatmentPlan[];
}

export const getPatientsStorageKey = (niche?: string, tenantId?: string | null) => {
  const tid = tenantId || (typeof window !== 'undefined' ? localStorage.getItem('zerodesk_tenant_id') : null) || 'default';
  return `zerodesk_patients_${tid}_${niche || 'default'}`;
};

export function usePatients() {
  const { currentNiche } = useNiche();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTenantId = typeof window !== 'undefined' ? localStorage.getItem('zerodesk_tenant_id') : null;
  const storageKey = getPatientsStorageKey(currentNiche, activeTenantId);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);

    let cached: PatientRecord[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cached = parsed;
            setPatients(cached);
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached patients:', e);
      }
    }

    try {
      const data = await api.get<any[]>('/customers');
      if (Array.isArray(data) && data.length > 0) {
        const mapped: PatientRecord[] = data.map((c) => ({
          id: c.id,
          nicheId: currentNiche,
          name: c.name || 'Anonymous Guest',
          phone: c.phone || '',
          email: c.email || undefined,
          gender: c.metadata?.gender || 'Other',
          age: c.metadata?.age || undefined,
          priority: (c.lifetimeValue || 0) > 20000 ? 'VIP' : (c.lifetimeValue || 0) > 10000 ? 'High' : 'Standard',
          tags: Array.isArray(c.tags) ? c.tags : [],
          registrationDate: c.firstSeenAt ? new Date(c.firstSeenAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalVisits: Array.isArray(c.appointments) ? c.appointments.length : 1,
          ltv: c.lifetimeValue || 0,
          lastVisit: c.lastSeenAt ? new Date(c.lastSeenAt).toISOString().split('T')[0] : undefined,
          prescriptions: [],
          uploadedFiles: [],
          treatmentPlans: [],
          _backendId: c.id,
        } as any));

        const backendIds = new Set(mapped.map((m) => m.id));
        const localOnly = cached.filter((c) => !backendIds.has(c.id));
        const merged = [...localOnly, ...mapped];

        setPatients(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        }
      } else if (cached.length > 0) {
        setPatients(cached);
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.warn('Could not fetch real customers, using cache or empty list:', e);
      if (cached.length > 0) {
        setPatients(cached);
      } else {
        setPatients([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentNiche, storageKey]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Synchronize across components and tabs
  useEffect(() => {
    const handleSync = () => {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setPatients(parsed);
            }
          }
        } catch (e) {
          console.warn('Failed to parse patients on sync event:', e);
        }
      }
    };

    window.addEventListener('zerodesk:patients-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zerodesk:patients-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [storageKey]);

  const addPatient = useCallback((data: Omit<PatientRecord, 'id' | 'nicheId' | 'registrationDate' | 'totalVisits' | 'ltv' | 'prescriptions' | 'uploadedFiles' | 'treatmentPlans'>): PatientRecord => {
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'CUST-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();

    const newPatient: PatientRecord = {
      ...data,
      id: generatedId,
      nicheId: currentNiche,
      registrationDate: new Date().toISOString().split('T')[0],
      totalVisits: 0,
      ltv: 0,
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: [],
    };

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        const existing = raw ? JSON.parse(raw) : [];
        const updated = [newPatient, ...(Array.isArray(existing) ? existing.filter((p: any) => p.id !== newPatient.id) : [])];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        window.dispatchEvent(new Event('zerodesk:patients-updated'));
      } catch (err) {
        console.error('Failed to update patients cache in addPatient:', err);
      }
    }

    setPatients((prev) => [newPatient, ...prev.filter((p) => p.id !== newPatient.id)]);

    api.post<any>('/customers', {
      name: data.name,
      phone: data.phone,
      email: data.email,
      tags: data.tags || [],
      metadata: {
        gender: data.gender,
        age: data.age,
        priority: data.priority,
        nicheId: currentNiche,
      },
    }).then((created) => {
      if (created?.id) {
        newPatient.id = created.id;
        (newPatient as any)._backendId = created.id;
        setPatients((prev) => {
          const updated = prev.map((p) => (p.id === generatedId ? { ...p, id: created.id, _backendId: created.id } : p));
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(storageKey, JSON.stringify(updated));
              window.dispatchEvent(new Event('zerodesk:patients-updated'));
            } catch (err) {}
          }
          return updated;
        });
      }
    }).catch(() => {});

    return newPatient;
  }, [currentNiche, storageKey]);

  const updatePatient = useCallback((id: string, updates: Partial<PatientRecord>) => {
    setPatients((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
          window.dispatchEvent(new Event('zerodesk:patients-updated'));
        } catch (e) {
          console.warn('Failed to update patients cache on update:', e);
        }
      }
      return updated;
    });
    const target = patients.find((p) => p.id === id);
    if (target) {
      const backendId = (target as any)._backendId || target.id;
      api.put(`/customers/${backendId}`, {
        name: updates.name || target.name,
        phone: updates.phone || target.phone,
        email: updates.email || target.email,
        tags: updates.tags || target.tags,
      }).catch(() => {});
    }
  }, [patients, storageKey]);

  const deletePatient = useCallback((id: string) => {
    const target = patients.find((p) => p.id === id);
    setPatients((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
          window.dispatchEvent(new Event('zerodesk:patients-updated'));
        } catch (e) {
          console.warn('Failed to update patients cache on delete:', e);
        }
      }
      return updated;
    });
    if (target) {
      const backendId = (target as any)._backendId || target.id;
      api.delete(`/customers/${backendId}`).catch(() => {});
    }
  }, [patients, storageKey]);

  const getPatientById = useCallback((id: string) => {
    return patients.find((p) => p.id === id);
  }, [patients]);

  const resetToDefaults = useCallback(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    isLoading,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    resetToDefaults,
  };
}

export function searchPatients(query: string, patientsList: PatientRecord[]): PatientRecord[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return patientsList.filter(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
  );
}

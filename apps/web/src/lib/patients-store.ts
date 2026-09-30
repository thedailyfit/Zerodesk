'use client';

import { tenantStorage } from '@/lib/tenant-storage';
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
  const tid = tenantId || (typeof window !== 'undefined' ? tenantStorage.getItem('zerodesk_tenant_id') : null) || 'default';
  return `zerodesk_patients_${tid}_${niche || 'default'}`;
};

export function usePatients() {
  const { currentNiche } = useNiche();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTenantId = typeof window !== 'undefined' ? tenantStorage.getItem('zerodesk_tenant_id') : null;
  const storageKey = getPatientsStorageKey(currentNiche, activeTenantId);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);

    setPatients([]);
    try {
      const data = await api.get<any[]>('/customers');
      if (Array.isArray(data)) {
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
          totalVisits: Array.isArray(c.appointments) ? c.appointments.length : 0,
          ltv: c.lifetimeValue || 0,
          lastVisit: c.lastSeenAt ? new Date(c.lastSeenAt).toISOString().split('T')[0] : undefined,
          prescriptions: c.metadata?.prescriptions || [],
          uploadedFiles: c.metadata?.uploadedFiles || [],
          treatmentPlans: c.metadata?.treatmentPlans || [],
          _backendId: c.id,
        } as any));

        setPatients(mapped);
      } else { setPatients([]); }
    } catch (e) {
      console.error('Customers could not be loaded:', e);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentNiche, storageKey]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Synchronize across components and tabs
  useEffect(() => {
    const handleSync = () => { void loadPatients(); };

    window.addEventListener('zerodesk:patients-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('zerodesk:patients-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadPatients]);

  const addPatient = useCallback(async (data: Omit<PatientRecord, 'id' | 'nicheId' | 'registrationDate' | 'totalVisits' | 'ltv' | 'prescriptions' | 'uploadedFiles' | 'treatmentPlans'>): Promise<PatientRecord> => {
    const created = await api.post<any>('/customers', {
      name: data.name, phone: data.phone, email: data.email, tags: data.tags,
      metadata: { gender: data.gender, age: data.age, priority: data.priority, nicheId: currentNiche },
    });
    if (!created?.id) throw new Error('Customer was not saved. Please retry.');
    const patient: PatientRecord = {
      ...data, id: created.id, nicheId: currentNiche,
      registrationDate: created.firstSeenAt?.split('T')[0] || '',
      totalVisits: 0, ltv: Number(created.lifetimeValue || 0),
      prescriptions: [], uploadedFiles: [], treatmentPlans: [],
    };
    setPatients(prev => [patient, ...prev.filter(p => p.id !== patient.id)]);
    window.dispatchEvent(new Event('zerodesk:patients-updated'));
    return patient;
  }, [currentNiche]);

  const updatePatient = useCallback(async (id: string, updates: Partial<PatientRecord>) => {
    const target = patients.find(p => p.id === id);
    if (!target) throw new Error('Customer is unavailable. Refresh and retry.');
    const { name, phone, email, tags, gender, age, priority, prescriptions, uploadedFiles, treatmentPlans } = updates;
    await api.put(`/customers/${id}`, {
      name, phone, email, tags,
      metadata: { gender, age, priority, prescriptions, uploadedFiles, treatmentPlans },
    });
    await loadPatients();
    window.dispatchEvent(new Event('zerodesk:patients-updated'));
  }, [patients, loadPatients]);

  const deletePatient = useCallback(async (id: string) => {
    await api.delete(`/customers/${id}`);
    setPatients(prev => prev.filter(p => p.id !== id));
    window.dispatchEvent(new Event('zerodesk:patients-updated'));
  }, []);

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

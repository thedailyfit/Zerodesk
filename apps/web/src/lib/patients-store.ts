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

export function usePatients() {
  const { currentNiche } = useNiche();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any[]>('/customers');
      if (Array.isArray(data) && data.length > 0) {
        const mapped: PatientRecord[] = data.map((c) => ({
          id: c.id.slice(0, 8).toUpperCase(),
          nicheId: currentNiche,
          name: c.name || 'Anonymous Patient',
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
        setPatients(mapped);
      } else {
        setPatients([]);
      }
    } catch (e) {
      console.warn('Could not fetch real customers, using empty list:', e);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentNiche]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const addPatient = useCallback((data: Omit<PatientRecord, 'id' | 'nicheId' | 'registrationDate' | 'totalVisits' | 'ltv' | 'prescriptions' | 'uploadedFiles' | 'treatmentPlans'>): PatientRecord => {
    const newPatient: PatientRecord = {
      ...data,
      id: Date.now().toString().slice(0, 8).toUpperCase(),
      nicheId: currentNiche,
      registrationDate: new Date().toISOString().split('T')[0],
      totalVisits: 0,
      ltv: 0,
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: [],
    };

    setPatients((prev) => [newPatient, ...prev]);

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
        (newPatient as any)._backendId = created.id;
      }
    }).catch(() => {});

    return newPatient;
  }, [currentNiche]);

  const updatePatient = useCallback((id: string, updates: Partial<PatientRecord>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
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
  }, [patients]);

  const deletePatient = useCallback((id: string) => {
    const target = patients.find((p) => p.id === id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      const backendId = (target as any)._backendId || target.id;
      api.delete(`/customers/${backendId}`).catch(() => {});
    }
  }, [patients]);

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

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

export interface PrescriptionRecord {
  id: string;
  date: string;
  doctorName: string;
  diagnosis: string;
  medications: string;
  notes?: string;
  fileDataUrl?: string; // base64 scanned copy
  fileName?: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  category: 'Prescription' | 'Lab Result' | 'X-Ray/Scan' | 'Pre-op Photo' | 'Before/After Photo' | 'Consent Form' | 'Invoice/Receipt' | 'Insurance Document' | 'Treatment Plan';
  uploadDate: string;
  uploadedBy: string;
  fileDataUrl?: string; // base64 for demo
  fileSize?: string;
}

export interface TreatmentPlan {
  id: string;
  packageName: string;
  serviceId: string; // references ServiceOffering.id
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
  id: string; // Format: PID-XXXX
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

const DEFAULT_PATIENTS_BY_NICHE: Record<NicheId, PatientRecord[]> = {
  skin: [
    {
      id: 'PID-1001',
      nicheId: 'skin',
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'priya.s@example.com',
      gender: 'Female',
      age: 28,
      priority: 'VIP',
      tags: ['Acne', 'Regular'],
      registrationDate: '2023-01-15',
      totalVisits: 5,
      ltv: 12500,
      lastVisit: '2023-10-12',
      prescriptions: [{ id: 'PR-001', date: '2023-10-12', doctorName: 'Dr. Mehta', diagnosis: 'Mild Acne', medications: 'Isotretinoin 10mg, Adapalene gel' }],
      uploadedFiles: [],
      treatmentPlans: [{ id: 'TP-001', packageName: 'Acne Scar Treatment', serviceId: 'SRV-001', totalSessions: 6, completedSessions: 2, totalAmount: 18000, paidAmount: 6000, remainingBalance: 12000, startDate: '2023-10-12', status: 'Active', payments: [] }]
    },
    {
      id: 'PID-1002',
      nicheId: 'skin',
      name: 'Vikram Singh',
      phone: '9876543211',
      email: 'vikram.s@example.com',
      gender: 'Male',
      age: 35,
      priority: 'High',
      tags: ['Hair Loss'],
      registrationDate: '2023-03-20',
      totalVisits: 2,
      ltv: 8000,
      lastVisit: '2023-09-05',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-1003',
      nicheId: 'skin',
      name: 'Sneha Patel',
      phone: '9876543212',
      gender: 'Female',
      age: 42,
      priority: 'Medium',
      tags: ['Pigmentation'],
      registrationDate: '2023-05-10',
      totalVisits: 1,
      ltv: 3500,
      lastVisit: '2023-05-10',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-1004',
      nicheId: 'skin',
      name: 'Rahul Desai',
      phone: '9876543213',
      email: 'rahul.d@example.com',
      gender: 'Male',
      age: 29,
      priority: 'Standard',
      tags: ['Laser'],
      registrationDate: '2023-06-25',
      totalVisits: 3,
      ltv: 15000,
      lastVisit: '2023-09-20',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-1005',
      nicheId: 'skin',
      name: 'Anjali Verma',
      phone: '9876543214',
      gender: 'Female',
      age: 31,
      priority: 'VIP',
      tags: ['Anti-aging'],
      registrationDate: '2023-02-14',
      totalVisits: 8,
      ltv: 45000,
      lastVisit: '2023-10-01',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    }
  ],
  dental: [
    {
      id: 'PID-2001',
      nicheId: 'dental',
      name: 'Ananya Reddy',
      phone: '9123456780',
      email: 'ananya.r@example.com',
      gender: 'Female',
      age: 34,
      priority: 'VIP',
      tags: ['Orthodontics', 'Invisalign'],
      registrationDate: '2023-02-10',
      totalVisits: 4,
      ltv: 45000,
      lastVisit: '2023-09-15',
      prescriptions: [{ id: 'PR-201', date: '2023-09-15', doctorName: 'Dr. Sharma', diagnosis: 'Malocclusion', medications: 'Paracetamol as needed for pain' }],
      uploadedFiles: [],
      treatmentPlans: [{ id: 'TP-201', packageName: 'Invisalign Full', serviceId: 'SRV-010', totalSessions: 12, completedSessions: 3, totalAmount: 150000, paidAmount: 50000, remainingBalance: 100000, startDate: '2023-03-01', status: 'Active', payments: [] }]
    },
    {
      id: 'PID-2002',
      nicheId: 'dental',
      name: 'Karthik Menon',
      phone: '9123456781',
      gender: 'Male',
      age: 45,
      priority: 'High',
      tags: ['Implants'],
      registrationDate: '2023-04-12',
      totalVisits: 3,
      ltv: 30000,
      lastVisit: '2023-08-20',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-2003',
      nicheId: 'dental',
      name: 'Neha Gupta',
      phone: '9123456782',
      gender: 'Female',
      age: 26,
      priority: 'Medium',
      tags: ['Whitening'],
      registrationDate: '2023-07-05',
      totalVisits: 2,
      ltv: 12000,
      lastVisit: '2023-08-10',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-2004',
      nicheId: 'dental',
      name: 'Rohit Sharma',
      phone: '9123456783',
      gender: 'Male',
      age: 52,
      priority: 'Standard',
      tags: ['Root Canal'],
      registrationDate: '2023-01-20',
      totalVisits: 6,
      ltv: 25000,
      lastVisit: '2023-06-15',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-2005',
      nicheId: 'dental',
      name: 'Pooja Iyer',
      phone: '9123456784',
      gender: 'Female',
      age: 38,
      priority: 'High',
      tags: ['Pediatric', 'Family'],
      registrationDate: '2023-03-15',
      totalVisits: 5,
      ltv: 18000,
      lastVisit: '2023-10-05',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    }
  ],
  spa: [
    {
      id: 'PID-3001',
      nicheId: 'spa',
      name: 'Meera Kapoor',
      phone: '9988776655',
      gender: 'Female',
      age: 30,
      priority: 'VIP',
      tags: ['Massage', 'Regular'],
      registrationDate: '2023-01-05',
      totalVisits: 12,
      ltv: 35000,
      lastVisit: '2023-10-10',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-3002',
      nicheId: 'spa',
      name: 'Aman Verma',
      phone: '9988776656',
      gender: 'Male',
      age: 35,
      priority: 'High',
      tags: ['Deep Tissue'],
      registrationDate: '2023-04-20',
      totalVisits: 4,
      ltv: 15000,
      lastVisit: '2023-09-25',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-3003',
      nicheId: 'spa',
      name: 'Simran Kaur',
      phone: '9988776657',
      gender: 'Female',
      age: 28,
      priority: 'Medium',
      tags: ['Facial'],
      registrationDate: '2023-06-15',
      totalVisits: 3,
      ltv: 8000,
      lastVisit: '2023-08-30',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-3004',
      nicheId: 'spa',
      name: 'Karan Patel',
      phone: '9988776658',
      gender: 'Male',
      age: 40,
      priority: 'Standard',
      tags: ['Couple Massage'],
      registrationDate: '2023-02-14',
      totalVisits: 2,
      ltv: 12000,
      lastVisit: '2023-02-14',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-3005',
      nicheId: 'spa',
      name: 'Anita Desai',
      phone: '9988776659',
      gender: 'Female',
      age: 45,
      priority: 'VIP',
      tags: ['Ayurvedic'],
      registrationDate: '2023-03-10',
      totalVisits: 8,
      ltv: 28000,
      lastVisit: '2023-10-01',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    }
  ],
  salon: [
    {
      id: 'PID-4001',
      nicheId: 'salon',
      name: 'Divya Nair',
      phone: '9812345670',
      gender: 'Female',
      age: 25,
      priority: 'VIP',
      tags: ['Hair Color', 'Bridal'],
      registrationDate: '2023-05-12',
      totalVisits: 6,
      ltv: 22000,
      lastVisit: '2023-10-15',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-4002',
      nicheId: 'salon',
      name: 'Sameer Khan',
      phone: '9812345671',
      gender: 'Male',
      age: 28,
      priority: 'Medium',
      tags: ['Haircut', 'Beard'],
      registrationDate: '2023-01-20',
      totalVisits: 10,
      ltv: 8000,
      lastVisit: '2023-10-05',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-4003',
      nicheId: 'salon',
      name: 'Riya Sharma',
      phone: '9812345672',
      gender: 'Female',
      age: 32,
      priority: 'High',
      tags: ['Keratin'],
      registrationDate: '2023-03-15',
      totalVisits: 4,
      ltv: 15000,
      lastVisit: '2023-08-22',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-4004',
      nicheId: 'salon',
      name: 'Arjun Singh',
      phone: '9812345673',
      gender: 'Male',
      age: 24,
      priority: 'Standard',
      tags: ['Hair Styling'],
      registrationDate: '2023-07-10',
      totalVisits: 3,
      ltv: 2500,
      lastVisit: '2023-09-18',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-4005',
      nicheId: 'salon',
      name: 'Kavita Joshi',
      phone: '9812345674',
      gender: 'Female',
      age: 40,
      priority: 'VIP',
      tags: ['Anti-Frizz', 'Color'],
      registrationDate: '2023-02-05',
      totalVisits: 8,
      ltv: 30000,
      lastVisit: '2023-10-10',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    }
  ],
  realestate: [
    {
      id: 'PID-5001',
      nicheId: 'realestate',
      name: 'Rajesh Gupta',
      phone: '9001122334',
      gender: 'Male',
      age: 45,
      priority: 'VIP',
      tags: ['Investor', 'Commercial'],
      registrationDate: '2023-01-10',
      totalVisits: 5,
      ltv: 0,
      lastVisit: '2023-10-12',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-5002',
      nicheId: 'realestate',
      name: 'Sunita Reddy',
      phone: '9001122335',
      gender: 'Female',
      age: 38,
      priority: 'High',
      tags: ['Residential', '3BHK'],
      registrationDate: '2023-04-15',
      totalVisits: 3,
      ltv: 0,
      lastVisit: '2023-09-20',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-5003',
      nicheId: 'realestate',
      name: 'Ravi Kumar',
      phone: '9001122336',
      gender: 'Male',
      age: 32,
      priority: 'Medium',
      tags: ['First-time Buyer', 'Apartment'],
      registrationDate: '2023-06-20',
      totalVisits: 4,
      ltv: 0,
      lastVisit: '2023-08-15',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-5004',
      nicheId: 'realestate',
      name: 'Alok Mishra',
      phone: '9001122337',
      gender: 'Male',
      age: 50,
      priority: 'Standard',
      tags: ['Plot', 'Investment'],
      registrationDate: '2023-02-25',
      totalVisits: 2,
      ltv: 0,
      lastVisit: '2023-05-10',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-5005',
      nicheId: 'realestate',
      name: 'Nandini Das',
      phone: '9001122338',
      gender: 'Female',
      age: 41,
      priority: 'VIP',
      tags: ['Luxury Villa', 'NRI'],
      registrationDate: '2023-03-30',
      totalVisits: 6,
      ltv: 0,
      lastVisit: '2023-10-05',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    }
  ],
  hotel: [
    {
      id: 'PID-6001',
      nicheId: 'hotel',
      name: 'Amit Patel',
      phone: '9776655443',
      gender: 'Male',
      age: 42,
      priority: 'VIP',
      tags: ['Corporate', 'Frequent Flyer'],
      registrationDate: '2023-01-12',
      totalVisits: 15,
      ltv: 150000,
      lastVisit: '2023-10-15',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-6002',
      nicheId: 'hotel',
      name: 'Shruti Hasan',
      phone: '9776655444',
      gender: 'Female',
      age: 35,
      priority: 'High',
      tags: ['Leisure', 'Family'],
      registrationDate: '2023-05-20',
      totalVisits: 3,
      ltv: 45000,
      lastVisit: '2023-08-10',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-6003',
      nicheId: 'hotel',
      name: 'Vikas Khanna',
      phone: '9776655445',
      gender: 'Male',
      age: 38,
      priority: 'Medium',
      tags: ['Event', 'Conference'],
      registrationDate: '2023-03-15',
      totalVisits: 2,
      ltv: 25000,
      lastVisit: '2023-07-22',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-6004',
      nicheId: 'hotel',
      name: 'Neha Sharma',
      phone: '9776655446',
      gender: 'Female',
      age: 29,
      priority: 'Standard',
      tags: ['Solo Traveler'],
      registrationDate: '2023-06-10',
      totalVisits: 1,
      ltv: 8000,
      lastVisit: '2023-06-12',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    },
    {
      id: 'PID-6005',
      nicheId: 'hotel',
      name: 'Rahul Bajaj',
      phone: '9776655447',
      gender: 'Male',
      age: 48,
      priority: 'VIP',
      tags: ['Suite', 'Long Stay'],
      registrationDate: '2023-02-28',
      totalVisits: 8,
      ltv: 120000,
      lastVisit: '2023-09-30',
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: []
    }
  ]
};

export function usePatients() {
  const { currentNiche } = useNiche();
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  // Helper to save and dispatch event
  const savePatients = useCallback((updatedPatients: PatientRecord[]) => {
    setPatients(updatedPatients);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`zerodesk_patients_${currentNiche}`, JSON.stringify(updatedPatients));
      window.dispatchEvent(new CustomEvent('zerodesk_patients_changed'));
    }
  }, [currentNiche]);

  // Load initial data
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = () => {
      const stored = localStorage.getItem(`zerodesk_patients_${currentNiche}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPatients(Array.isArray(parsed) ? parsed : (DEFAULT_PATIENTS_BY_NICHE[currentNiche] || []));
        } catch (e) {
          console.error('Failed to parse patients from localStorage:', e);
          setPatients(DEFAULT_PATIENTS_BY_NICHE[currentNiche] || []);
        }
      } else {
        const defaults = DEFAULT_PATIENTS_BY_NICHE[currentNiche] || [];
        savePatients(defaults);
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `zerodesk_patients_${currentNiche}`) {
        loadData();
      }
    };

    const handleCustomEvent = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('zerodesk_patients_changed', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('zerodesk_patients_changed', handleCustomEvent);
    };
  }, [currentNiche, savePatients]);

  const addPatient = useCallback((patient: Omit<PatientRecord, 'id' | 'nicheId' | 'registrationDate' | 'totalVisits' | 'ltv' | 'prescriptions' | 'uploadedFiles' | 'treatmentPlans'>) => {
    // Find the highest existing PID number and increment
    const maxId = patients.reduce((max, p) => {
      const num = parseInt(p.id.replace('PID-', ''), 10);
      return num > max ? num : max;
    }, 0);
    
    const newPatient: PatientRecord = {
      ...patient,
      id: `PID-${String(maxId + 1).padStart(4, '0')}`,
      nicheId: currentNiche,
      registrationDate: new Date().toISOString().split('T')[0],
      totalVisits: 0,
      ltv: 0,
      prescriptions: [],
      uploadedFiles: [],
      treatmentPlans: [],
    };
    
    const updated = [newPatient, ...patients];
    savePatients(updated);
    return newPatient;
  }, [currentNiche, patients, savePatients]);

  const updatePatient = useCallback((id: string, updates: Partial<PatientRecord>) => {
    const updated = patients.map(p => p.id === id ? { ...p, ...updates } : p);
    savePatients(updated);
  }, [patients, savePatients]);

  const deletePatient = useCallback((id: string) => {
    const updated = patients.filter(p => p.id !== id);
    savePatients(updated);
  }, [patients, savePatients]);

  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const resetToDefaults = useCallback(() => {
    const defaults = DEFAULT_PATIENTS_BY_NICHE[currentNiche] || [];
    savePatients(defaults);
  }, [currentNiche, savePatients]);

  return {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientById,
    resetToDefaults
  };
}

export function searchPatients(query: string, patientsList: PatientRecord[]): PatientRecord[] {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return patientsList.filter(p => 
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    p.phone.toLowerCase().includes(q) ||
    (p.email && p.email.toLowerCase().includes(q))
  );
}


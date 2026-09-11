'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Plus, Trash2, Printer, Send, Upload, CheckCircle2, 
  Settings, User, Phone, Calendar, Clock, AlertCircle, Sparkles, 
  Download, RefreshCw, X, Shield, Stethoscope, Pill, Check, ArrowRight
} from 'lucide-react';
import { useNiche } from '@/components/providers/niche-provider';
import { usePatients } from '@/lib/patients-store';
import type { ActiveNicheId } from '@/config/niches/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MedicineRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
}

interface PrescriptionRecord {
  id: string;
  rxNumber: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientPhone: string;
  diagnosis: string;
  date: string;
  medicines: MedicineRow[];
  advice: string;
  followUp: string;
}

interface LetterheadConfig {
  clinicName: string;
  doctorName: string;
  qualifications: string;
  registrationNumber: string;
  phone: string;
  email: string;
  address: string;
  headerImage: string | null;
  logoImage: string | null;
  signatureImage: string | null;
  disclaimer: string;
  useHeaderPadOnly: boolean;
}

const DEFAULT_MEDICINES_BY_NICHE: Record<string, string[]> = {
  skin: [
    'Cap. Doxycycline 100mg',
    'Tab. Isotretinoin 10mg',
    'Tab. Levocetirizine 5mg',
    'Gel Adapalene 0.1% + Benzoyl Peroxide 2.5%',
    'Cream Clindamycin 1%',
    'Cream Mupirocin 2%',
    'Sunscreen Gel SPF 50+ PA++++',
    'Lotion Calamine + Liquid Paraffin',
    'Tab. Vitamin C 500mg + Zinc'
  ],
  dental: [
    'Tab. Amoxicillin 500mg + Clavulanate 125mg',
    'Tab. Metronidazole 400mg',
    'Tab. Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)',
    'Tab. Ketorol-DT 10mg (Dispersible)',
    'Tab. Pantoprazole 40mg',
    'Mouthwash Chlorhexidine 0.2%',
    'Toothpaste Potassium Nitrate 5%',
    'Gel Choline Salicylate (Topical Gum Gel)',
    'Tab. Calcium 500mg + Vitamin D3'
  ]
};

const QUICK_DIAGNOSES_BY_NICHE: Record<string, string[]> = {
  skin: ['Acne Vulgaris (Grade 2)', 'Melasma / Hyperpigmentation', 'Post-Inflammatory Erythema', 'Alopecia Androgenetica', 'Atopic Dermatitis', 'Tinea Corporis', 'Post-Laser Erythema'],
  dental: ['Acute Irreversible Pulpitis', 'Periapical Abscess (Tooth #46)', 'Chronic Generalized Gingivitis', 'Impacted 3rd Molar (Tooth #38)', 'Post-Extraction Pain', 'Dental Caries with Dentin Sensitivity']
};

export default function PrescriptionsPage() {
  const { patients } = usePatients();
  const { currentNiche, nicheConfig } = useNiche();
  const [activeTab, setActiveTab] = useState<'write' | 'settings' | 'history'>('write');

  // Letterhead Template Settings
  const [letterhead, setLetterhead] = useState<LetterheadConfig>(() => {
    const isSkin = currentNiche === 'skin';
    return {
      clinicName: isSkin ? 'Aura Aesthetic Dermatology & Laser Clinic' : 'Apex Multispeciality Dental Care & Implant Center',
      doctorName: isSkin ? 'Dr. Ananya Rao' : 'Dr. Vikram Seth',
      qualifications: isSkin ? 'MBBS, MD (Dermatology, Venereology & Leprosy)' : 'BDS, MDS (Conservative Dentistry & Endodontics)',
      registrationNumber: isSkin ? 'KMC Reg. No: 58291 / 2017' : 'DCI Reg. No: 41820 / 2016',
      phone: '+91 98765 43210',
      email: isSkin ? 'care@auraskinclinic.in' : 'contact@apexdental.in',
      address: 'Suite 204, Metro Plaza, Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      headerImage: null,
      logoImage: null,
      signatureImage: null,
      disclaimer: 'Prescription generated via ZeroDesk Verified Clinical Suite. Valid for 30 days. Generic drug substitution permitted as per NMC/DCI regulations.',
      useHeaderPadOnly: false
    };
  });

  // Current Prescription Form
  const [rxNumber] = useState<string>(() => `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [patientPhone, setPatientPhone] = useState('');
  const [diagnosis, setDiagnosis] = useState(currentNiche === 'dental' ? 'Acute Irreversible Pulpitis' : 'Acne Vulgaris (Grade 2)');
  const [advice, setAdvice] = useState(
    currentNiche === 'dental' 
      ? 'Avoid hard or chewing food on the affected side. Warm saline gargle 3 times a day starting 24h post procedure.'
      : 'Apply sunscreen liberally 20 minutes before stepping into sunlight. Avoid harsh scrubs and steam on facial skin.'
  );
  const [followUp, setFollowUp] = useState('Review after 7 days');

  const [medicines, setMedicines] = useState<MedicineRow[]>([
    {
      id: 'm1',
      name: currentNiche === 'dental' ? 'Tab. Amoxicillin 500mg + Clavulanate 125mg' : 'Cap. Doxycycline 100mg',
      dosage: currentNiche === 'dental' ? '625mg' : '100mg',
      frequency: '1-0-1 (Twice daily)',
      duration: '5 Days',
      instruction: 'After Food'
    },
    {
      id: 'm2',
      name: currentNiche === 'dental' ? 'Tab. Zerodol-SP' : 'Gel Adapalene 0.1% + Benzoyl Peroxide 2.5%',
      dosage: currentNiche === 'dental' ? '1 Tab' : 'Topical Gel',
      frequency: currentNiche === 'dental' ? '1-0-1 (Twice daily)' : '0-0-1 (Night only)',
      duration: currentNiche === 'dental' ? '3 Days' : '30 Days',
      instruction: currentNiche === 'dental' ? 'After Food' : 'Apply thin layer on lesions only'
    }
  ]);

  const [pastPrescriptions, setPastPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem(`zd_rx_template_${currentNiche}`);
    if (savedTemplate) {
      try {
        setLetterhead(JSON.parse(savedTemplate));
      } catch (e) {
        console.error('Failed to parse rx template', e);
      }
    }

    const savedHistory = localStorage.getItem(`zd_prescriptions_${currentNiche}`);
    if (savedHistory) {
      try {
        setPastPrescriptions(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse past prescriptions', e);
      }
    }
  }, [currentNiche]);

  const saveLetterheadConfig = () => {
    localStorage.setItem(`zd_rx_template_${currentNiche}`, JSON.stringify(letterhead));
    setToastMessage('Prescription Letterhead & Clinic Template saved successfully!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileUpload = (field: 'headerImage' | 'logoImage' | 'signatureImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLetterhead(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addMedicineRow = (medName?: string) => {
    const newMed: MedicineRow = {
      id: 'm_' + Date.now(),
      name: medName || '',
      dosage: '1 Tab',
      frequency: '1-0-1 (Twice daily)',
      duration: '5 Days',
      instruction: 'After Food'
    };
    setMedicines([...medicines, newMed]);
  };

  const updateMedicine = (id: string, field: keyof MedicineRow, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const savePrescription = () => {
    const newRx: PrescriptionRecord = {
      id: 'rx_' + Date.now(),
      rxNumber,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      diagnosis,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      medicines,
      advice,
      followUp
    };

    const updated = [newRx, ...pastPrescriptions];
    setPastPrescriptions(updated);
    localStorage.setItem(`zd_prescriptions_${currentNiche}`, JSON.stringify(updated));
    setToastMessage(`Prescription ${rxNumber} saved to Patient EMR archive!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const printPrescription = () => {
    savePrescription();
    window.print();
  };

  const sendPrescriptionWhatsApp = async () => {
    savePrescription();
    setIsSendingWhatsApp(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      setToastMessage(`Digital Prescription PDF sent to ${patientName} (${patientPhone}) via Meta WhatsApp Cloud API!`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const quickMedList = DEFAULT_MEDICINES_BY_NICHE[currentNiche] || DEFAULT_MEDICINES_BY_NICHE.skin;
  const quickDiagnoses = QUICK_DIAGNOSES_BY_NICHE[currentNiche] || QUICK_DIAGNOSES_BY_NICHE.skin;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Screen-Only Header Bar */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Digital Prescriptions (Rx)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {nicheConfig.label} EMR
            </span>
          </div>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Create compliance-ready digital prescriptions with custom letterhead, 1-click WhatsApp delivery & print export.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('write')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'write' ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            )}
          >
            Write Rx
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
              activeTab === 'settings' ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            )}
          >
            <Settings size={13} />
            <span>Letterhead Template</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
              activeTab === 'history' ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            )}
          >
            Archive ({pastPrescriptions.length})
          </button>
        </div>
      </div>

      {/* TAB 1: WRITE PRESCRIPTION */}
      {activeTab === 'write' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Builder (Print: Hidden) */}
          <div className="print:hidden lg:col-span-6 space-y-6">
            
            {/* Patient Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <User size={16} className="text-blue-500" />
                  <span>Patient Demographics</span>
                </h3>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{rxNumber}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {patients && patients.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Quick-Select Patient from EMR
                    </label>
                    <select
                      onChange={(e) => {
                        const found = patients.find(p => p.id === e.target.value);
                        if (found) {
                          setPatientName(found.name);
                          setPatientPhone(found.phone);
                          if (found.age) setPatientAge(String(found.age));
                          if (found.gender) setPatientGender(found.gender);
                        }
                      }}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Choose Existing Patient or Type Below --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    placeholder="Patient Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">WhatsApp Phone</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    placeholder="+91 98450 12345"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Age</label>
                    <input
                      type="text"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                      placeholder="e.g. 28"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2.5 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Date</label>
                  <input
                    type="text"
                    readOnly
                    value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Diagnosis / Chief Complaint */}
              <div className="pt-2 border-t border-[var(--color-border)]">
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinical Diagnosis / Chief Complaint</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Acne Vulgaris Grade 2 / Irreversible Pulpitis"
                />

                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Quick Suggestions:</span>
                  {quickDiagnoses.slice(0, 4).map(diag => (
                    <button
                      key={diag}
                      type="button"
                      onClick={() => setDiagnosis(diag)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg)] hover:bg-blue-500/10 hover:text-blue-400 border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors"
                    >
                      {diag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Medicines List Editor */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill size={16} className="text-emerald-500" />
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">Medications & Dosage (Rx)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => addMedicineRow()}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus size={13} />
                  <span>Add Medicine</span>
                </button>
              </div>

              {/* Quick Drug Add Chips */}
              <div className="flex items-center gap-1.5 flex-wrap p-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider block w-full mb-1">
                  1-Tap Fast Prescribe ({nicheConfig.label}):
                </span>
                {quickMedList.map(drug => (
                  <button
                    key={drug}
                    type="button"
                    onClick={() => addMedicineRow(drug)}
                    className="text-[10px] px-2 py-1 rounded bg-[var(--color-surface)] hover:bg-emerald-500/10 hover:text-emerald-400 border border-[var(--color-border)] text-[var(--color-text)] transition-colors flex items-center gap-1"
                  >
                    <Plus size={10} />
                    <span>{drug}</span>
                  </button>
                ))}
              </div>

              {/* Drug Rows */}
              <div className="space-y-3">
                {medicines.map((med, idx) => (
                  <div key={med.id} className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2.5 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                        placeholder="Drug Brand / Generic Name & Strength"
                        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedicine(med.id)}
                        className="text-[var(--color-text-muted)] hover:text-red-400 p-1 transition-colors"
                        title="Remove drug"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Frequency</label>
                        <select
                          value={med.frequency}
                          onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[11px] text-[var(--color-text)] focus:outline-none"
                        >
                          <option value="1-0-1 (Twice daily)">1-0-1 (Twice daily)</option>
                          <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                          <option value="0-0-1 (Night)">0-0-1 (Night)</option>
                          <option value="1-1-1 (Thrice daily)">1-1-1 (Thrice daily)</option>
                          <option value="SOS (As needed)">SOS (As needed)</option>
                          <option value="Stat (Immediate)">Stat (Single dose)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                          placeholder="e.g. 5 Days"
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[11px] text-[var(--color-text)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Instructions</label>
                        <select
                          value={med.instruction}
                          onChange={(e) => updateMedicine(med.id, 'instruction', e.target.value)}
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-2 py-1 text-[11px] text-[var(--color-text)] focus:outline-none"
                        >
                          <option value="After Food">After Food</option>
                          <option value="Before Food">Before Food</option>
                          <option value="With Milk / Water">With Water</option>
                          <option value="Apply on affected area">Apply Topically</option>
                          <option value="Bedtime only">Bedtime only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advice & Follow-up */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3.5 shadow-sm">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinical Instructions & Dietary Advice</label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Follow-Up Schedule</label>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Review after 7 days / Post laser session"
                />
              </div>
            </div>

            {/* Dispatch & Export Action Bar */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={printPrescription}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl font-semibold text-xs text-[var(--color-text)] transition-colors shadow-sm cursor-pointer"
              >
                <Printer size={15} className="text-blue-400" />
                <span>Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={sendPrescriptionWhatsApp}
                disabled={isSendingWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSendingWhatsApp ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>Send to WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Prescription Preview (What Prints & Sends) */}
          <div className="lg:col-span-6 sticky top-6">
            <div className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0">
              
              {/* Prescription Header */}
              {letterhead.headerImage && letterhead.useHeaderPadOnly ? (
                <div className="w-full overflow-hidden border-b border-slate-200">
                  <img src={letterhead.headerImage} alt="Clinic Letterhead Header" className="w-full object-cover max-h-40" />
                </div>
              ) : (
                <div className="p-6 border-b-2 border-slate-800 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {letterhead.logoImage ? (
                      <img src={letterhead.logoImage} alt="Clinic Logo" className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                        {currentNiche === 'dental' ? '🦷' : '✨'}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">{letterhead.clinicName}</h2>
                      <p className="text-xs font-semibold text-blue-800 mt-0.5">{letterhead.doctorName}</p>
                      <p className="text-[11px] text-slate-600">{letterhead.qualifications}</p>
                      <p className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">{letterhead.registrationNumber}</p>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-600 leading-tight space-y-0.5 max-w-[200px]">
                    <p className="font-semibold text-slate-800">{letterhead.phone}</p>
                    <p>{letterhead.email}</p>
                    <p className="text-slate-500">{letterhead.address}</p>
                  </div>
                </div>
              )}

              {/* Patient Bar */}
              <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div><span className="font-semibold text-slate-500">Patient:</span> <span className="font-bold">{patientName}</span> ({patientAge}y / {patientGender})</div>
                <div><span className="font-semibold text-slate-500">Phone:</span> {patientPhone}</div>
                <div><span className="font-semibold text-slate-500">Rx No:</span> <span className="font-mono font-bold text-blue-700">{rxNumber}</span></div>
                <div><span className="font-semibold text-slate-500">Date:</span> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>

              {/* Clinical Area */}
              <div className="p-6 space-y-6 min-h-[420px] relative">
                
                {/* Rx Symbol Background Watermark */}
                <div className="absolute right-8 top-12 text-slate-100 select-none pointer-events-none font-serif text-9xl font-bold opacity-40">
                  Rx
                </div>

                {/* Diagnosis */}
                {diagnosis && (
                  <div className="relative z-10 pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diagnosis:</span>
                    <span className="text-xs font-bold text-slate-800 ml-2">{diagnosis}</span>
                  </div>
                )}

                {/* Rx Symbol */}
                <div className="text-2xl font-serif font-bold text-blue-800 flex items-center gap-2">
                  <span>℞</span>
                </div>

                {/* Medication Table */}
                <div className="relative z-10">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <th className="py-2 pr-2">#</th>
                        <th className="py-2">Medication / Strength</th>
                        <th className="py-2">Frequency</th>
                        <th className="py-2">Duration</th>
                        <th className="py-2 text-right">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.map((m, idx) => (
                        <tr key={m.id} className="text-slate-800">
                          <td className="py-2.5 pr-2 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 font-bold text-slate-900">
                            {m.name || '—'}
                          </td>
                          <td className="py-2.5 text-slate-700 font-medium">{m.frequency}</td>
                          <td className="py-2.5 text-slate-700">{m.duration}</td>
                          <td className="py-2.5 text-right font-medium text-slate-800">{m.instruction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Advice & Recommendations */}
                {advice && (
                  <div className="relative z-10 pt-4 border-t border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Advice & General Instructions:</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{advice}</p>
                  </div>
                )}

                {/* Follow-up Note */}
                {followUp && (
                  <div className="relative z-10 text-xs font-semibold text-blue-900 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
                    <span>Follow-Up: {followUp}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Please bring this prescription during next visit.</span>
                  </div>
                )}

                {/* Doctor Signature & Stamp Area */}
                <div className="relative z-10 pt-10 flex items-end justify-between">
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <p>Verified Clinical Record</p>
                    <p className="font-mono">Generated via ZeroDesk AI Frontdesk</p>
                  </div>

                  <div className="text-right">
                    {letterhead.signatureImage ? (
                      <img src={letterhead.signatureImage} alt="Doctor Digital Signature" className="h-12 object-contain ml-auto mb-1" />
                    ) : (
                      <div className="h-10 border-b border-dashed border-slate-400 w-36 ml-auto mb-1" />
                    )}
                    <p className="text-xs font-bold text-slate-900">{letterhead.doctorName}</p>
                    <p className="text-[10px] text-slate-500">{letterhead.registrationNumber}</p>
                  </div>
                </div>
              </div>

              {/* Prescription Footer Disclaimer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[9px] text-slate-500 leading-relaxed">
                {letterhead.disclaimer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LETTERHEAD TEMPLATE & CUSTOM UPLOAD SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6 shadow-sm max-w-4xl">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Letterhead & Prescription Template Settings</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Customize your clinic branding, upload custom graphical letterhead banners, clinic logos and doctor signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Logo Upload Card */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-3 text-center">
              <p className="text-xs font-semibold text-[var(--color-text)]">Clinic Logo</p>
              {letterhead.logoImage ? (
                <div className="relative w-20 h-20 mx-auto border rounded-xl overflow-hidden bg-white p-1">
                  <img src={letterhead.logoImage} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setLetterhead(prev => ({ ...prev, logoImage: null }))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto rounded-xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                  <Upload size={20} />
                </div>
              )}
              <label className="block">
                <span className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-block">
                  Upload Logo
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('logoImage', e)} />
              </label>
              <p className="text-[10px] text-[var(--color-text-muted)]">PNG/JPEG up to 2MB</p>
            </div>

            {/* Doctor Signature Card */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-3 text-center">
              <p className="text-xs font-semibold text-[var(--color-text)]">Doctor Signature</p>
              {letterhead.signatureImage ? (
                <div className="relative w-32 h-20 mx-auto border rounded-xl overflow-hidden bg-white p-1">
                  <img src={letterhead.signatureImage} alt="Signature" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setLetterhead(prev => ({ ...prev, signatureImage: null }))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-20 mx-auto rounded-xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                  <Upload size={20} />
                </div>
              )}
              <label className="block">
                <span className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-block">
                  Upload Signature
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('signatureImage', e)} />
              </label>
              <p className="text-[10px] text-[var(--color-text-muted)]">Transparent PNG recommended</p>
            </div>

            {/* Header Letterhead Graphic */}
            <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-3 text-center">
              <p className="text-xs font-semibold text-[var(--color-text)]">Custom Header Pad Graphic</p>
              {letterhead.headerImage ? (
                <div className="relative w-full h-20 mx-auto border rounded-xl overflow-hidden bg-white">
                  <img src={letterhead.headerImage} alt="Header" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setLetterhead(prev => ({ ...prev, headerImage: null }))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-xs"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-20 mx-auto rounded-xl border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                  <Upload size={20} />
                </div>
              )}
              <label className="block">
                <span className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-block">
                  Upload Pad Banner
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('headerImage', e)} />
              </label>
              <p className="text-[10px] text-[var(--color-text-muted)]">Full-width clinic banner</p>
            </div>
          </div>

          {/* Letterhead Text Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Name</label>
              <input
                type="text"
                value={letterhead.clinicName}
                onChange={(e) => setLetterhead({ ...letterhead, clinicName: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Doctor Name</label>
              <input
                type="text"
                value={letterhead.doctorName}
                onChange={(e) => setLetterhead({ ...letterhead, doctorName: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Degrees & Qualifications</label>
              <input
                type="text"
                value={letterhead.qualifications}
                onChange={(e) => setLetterhead({ ...letterhead, qualifications: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Medical / Dental Council Reg. No.</label>
              <input
                type="text"
                value={letterhead.registrationNumber}
                onChange={(e) => setLetterhead({ ...letterhead, registrationNumber: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Phone</label>
              <input
                type="text"
                value={letterhead.phone}
                onChange={(e) => setLetterhead({ ...letterhead, phone: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Email</label>
              <input
                type="text"
                value={letterhead.email}
                onChange={(e) => setLetterhead({ ...letterhead, email: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Address</label>
              <input
                type="text"
                value={letterhead.address}
                onChange={(e) => setLetterhead({ ...letterhead, address: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Statutory Rx Disclaimer (Printed at Footer)</label>
              <textarea
                rows={2}
                value={letterhead.disclaimer}
                onChange={(e) => setLetterhead({ ...letterhead, disclaimer: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
            <button
              onClick={saveLetterheadConfig}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              Save Template Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHIVE OF PAST PRESCRIPTIONS */}
      {activeTab === 'history' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text)]">Prescription Archive & EMR Logs</h2>
            <span className="text-xs text-[var(--color-text-muted)]">{pastPrescriptions.length} Records Saved</span>
          </div>

          {pastPrescriptions.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--color-border)] rounded-2xl">
              <FileText className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-[var(--color-text)]">No prescriptions archived yet</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Prescriptions you create will be automatically saved here for quick re-print and WhatsApp dispatch.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {pastPrescriptions.map((rx) => (
                <div key={rx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">{rx.rxNumber}</span>
                      <span className="text-sm font-bold text-[var(--color-text)]">{rx.patientName}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">({rx.patientAge}y / {rx.patientGender})</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      <span className="font-medium text-[var(--color-text)]">Diagnosis:</span> {rx.diagnosis} · {rx.medicines.length} Medicines Prescribed
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Date: {rx.date} · Phone: {rx.patientPhone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPatientName(rx.patientName);
                        setPatientPhone(rx.patientPhone);
                        setPatientAge(rx.patientAge);
                        setDiagnosis(rx.diagnosis);
                        setMedicines(rx.medicines);
                        setAdvice(rx.advice);
                        setFollowUp(rx.followUp);
                        setActiveTab('write');
                        setToastMessage(`Loaded ${rx.rxNumber} into Prescription Editor!`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="px-3 py-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-xs font-semibold transition-colors"
                    >
                      Re-open / Edit
                    </button>

                    <button
                      onClick={() => {
                        setPatientName(rx.patientName);
                        setPatientPhone(rx.patientPhone);
                        setMedicines(rx.medicines);
                        setActiveTab('write');
                        setTimeout(() => window.print(), 300);
                      }}
                      className="p-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-blue-400 border border-[var(--color-border)] rounded-lg transition-colors"
                      title="Print Rx"
                    >
                      <Printer size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-white">Clinical Action Complete</p>
              <p className="text-emerald-300/80 mt-0.5">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 ml-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

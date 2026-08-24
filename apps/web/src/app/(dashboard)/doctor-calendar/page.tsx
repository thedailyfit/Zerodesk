'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, 
  Plus, 
  Stethoscope, 
  Phone, 
  X,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'Active' | 'On Break' | 'In Surgery' | 'Off Duty';
  hours: string;
  bookedHours: number;
  totalHours: number;
  todayAppointments: number;
}

const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-1',
    name: 'Dr. Meenakshi Rao',
    specialty: 'Senior Dermatologist & Aesthetician',
    avatar: 'MR',
    phone: '+91 98765 43210',
    email: 'meenakshi@glowclinic.com',
    status: 'Active',
    hours: '09:00 AM - 05:00 PM',
    bookedHours: 6.5,
    totalHours: 8,
    todayAppointments: 8
  },
  {
    id: 'doc-2',
    name: 'Dr. Arun Kumar',
    specialty: 'Hair Restoration & Cosmetologist',
    avatar: 'AK',
    phone: '+91 98123 45678',
    email: 'arun@glowclinic.com',
    status: 'In Surgery',
    hours: '10:00 AM - 06:00 PM',
    bookedHours: 7,
    totalHours: 8,
    todayAppointments: 5
  },
  {
    id: 'doc-3',
    name: 'Dr. Kavita Reddy',
    specialty: 'Clinical Dermatology Specialist',
    avatar: 'KR',
    phone: '+91 97654 32109',
    email: 'kavita@glowclinic.com',
    status: 'On Break',
    hours: '09:30 AM - 04:30 PM',
    bookedHours: 4.5,
    totalHours: 7,
    todayAppointments: 6
  }
];

export default function DoctorCalendarPage() {
  const { nicheConfig } = useNiche();
  const [doctors, setDoctors] = useState<DoctorProfile[]>(INITIAL_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(INITIAL_DOCTORS[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_doctors');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDoctors(parsed);
          setSelectedDoctor(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load doctors from localStorage', e);
    }
  }, []);

  const saveDoctors = (updated: DoctorProfile[]) => {
    setDoctors(updated);
    try {
      localStorage.setItem('zerodesk_doctors', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save doctors to localStorage', e);
    }
  };

  // New Doctor Form
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docHours, setDocHours] = useState('09:00 AM - 05:00 PM');

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docSpecialty) return;

    const initials = docName.replace('Dr.', '').trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'DR';

    const newDoc: DoctorProfile = {
      id: `doc-${Date.now()}`,
      name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
      specialty: docSpecialty,
      avatar: initials,
      phone: docPhone || '+91 98000 00000',
      email: docEmail || 'doctor@glowclinic.com',
      status: 'Active',
      hours: docHours,
      bookedHours: 0,
      totalHours: 8,
      todayAppointments: 0
    };

    const updated = [...doctors, newDoc];
    saveDoctors(updated);
    setIsAddModalOpen(false);
    setDocName('');
    setDocSpecialty('');
    setDocPhone('');
    setDocEmail('');
  };

  const handleToggleStatus = (id: string, newStatus: DoctorProfile['status']) => {
    const updated = doctors.map(d => d.id === id ? { ...d, status: newStatus } : d);
    saveDoctors(updated);
    if (selectedDoctor.id === id) {
      setSelectedDoctor(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Doctor & Specialist Management</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              {nicheConfig?.label ? `${nicheConfig.label} Hub` : 'Medical Team Hub'}
            </span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Administer doctor profiles, availability status, clinical hours, and consultation workloads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
          >
            <Plus size={16} />
            <span>Add New Doctor</span>
          </button>
        </div>
      </div>

      {/* Distinction Info Card */}
      <div className="p-4 rounded-2xl bg-[var(--color-glass)] border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">
            <Stethoscope size={16} />
          </div>
          <div>
            <span className="font-bold text-[var(--color-text)]">Doctor Management vs Doctor Slots</span>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              This page manages doctor availability and team profiles. For drag-and-drop appointment slot scheduling, open{' '}
              <Link href="/calendar" className="text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5">
                <Calendar size={11} className="inline" /> Doctor Calendar & Slots &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Doctors List, Right = Selected Doctor Schedule & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Doctor Profile Cards */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            Active Doctors ({doctors.length})
          </h2>

          {doctors.map((doc) => {
            const isSelected = selectedDoctor.id === doc.id;
            const utilPercent = Math.round((doc.bookedHours / doc.totalHours) * 100);

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer space-y-3 group",
                  isSelected
                    ? "bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-blue-500/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      {doc.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--color-text)] group-hover:text-blue-400 transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{doc.specialty}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    doc.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    doc.status === 'In Surgery' ? "bg-sky-500/10 text-sky-400 border-sky-500/20" :
                    doc.status === 'On Break' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {doc.status}
                  </span>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[var(--color-text-muted)]">
                    <span>Today&apos;s Booked Slots</span>
                    <span className="font-mono font-bold text-[var(--color-text)]">{doc.bookedHours}h / {doc.totalHours}h ({utilPercent}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${utilPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/50">
                  <span className="flex items-center gap-1 font-mono"><Phone size={11} /> {doc.phone}</span>
                  <span className="font-bold text-blue-400">{doc.todayAppointments} appointments</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Doctor Deep-Dive & Quick Status Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-lg">
                  {selectedDoctor.avatar}
                </div>
                <div>
                  <h2 className="font-bold text-base text-[var(--color-text)]">{selectedDoctor.name}</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">{selectedDoctor.specialty} • {selectedDoctor.hours}</p>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] text-xs">
                {(['Active', 'On Break', 'In Surgery', 'Off Duty'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleToggleStatus(selectedDoctor.id, st)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all",
                      selectedDoctor.status === st
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">Today&apos;s Load</span>
                <span className="text-xl font-extrabold font-mono text-[var(--color-text)]">{selectedDoctor.todayAppointments} Patients</span>
              </div>

              <div className="p-3.5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">Working Shift</span>
                <span className="text-sm font-bold font-mono text-blue-400 mt-1 block">{selectedDoctor.hours.split(' - ')[0]} - {selectedDoctor.hours.split(' - ')[1]}</span>
              </div>

              <div className="p-3.5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">Clinical Room</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">Consult OT 1</span>
              </div>
            </div>

            {/* Today's Shift Schedule Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                Today&apos;s Time Allocation & Blocks
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="font-bold text-[var(--color-text)]">Morning Consultations Block</span>
                  </div>
                  <span className="font-mono text-[var(--color-text-muted)] font-semibold">09:00 AM - 01:00 PM</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee size={14} className="text-amber-400" />
                    <span className="font-bold text-[var(--color-text)]">Lunch & Charting Break</span>
                  </div>
                  <span className="font-mono text-[var(--color-text-muted)] font-semibold">01:00 PM - 02:00 PM</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="font-bold text-[var(--color-text)]">Procedures & Follow-ups</span>
                  </div>
                  <span className="font-mono text-[var(--color-text-muted)] font-semibold">02:00 PM - 05:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Doctor Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" />
                  Add New Doctor / Specialist
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Khanna"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Medical Specialty / Department *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trichology & Hair Transplant"
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={docPhone}
                      onChange={(e) => setDocPhone(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="dr@clinic.com"
                      value={docEmail}
                      onChange={(e) => setDocEmail(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={docHours}
                    onChange={(e) => setDocHours(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25"
                  >
                    Add Doctor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

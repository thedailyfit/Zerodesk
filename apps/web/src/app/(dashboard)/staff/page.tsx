'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail, Phone, User, X, Check, MoreHorizontal, Shield, Clock } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  userRole: 'ORG_ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  specialization: string;
  availability: Record<string, boolean>;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: '1', name: 'Dr. Meenakshi Rao', role: 'Dermatologist', email: 'meenakshi@glowclinic.com', phone: '+91 98765 43210', userRole: 'MANAGER', isActive: true, specialization: 'Laser Treatments', availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } },
  { id: '2', name: 'Dr. Arun Krishnan', role: 'Hair Transplant Specialist', email: 'arun@glowclinic.com', phone: '+91 87654 32109', userRole: 'MANAGER', isActive: true, specialization: 'Hair Restoration', availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } },
  { id: '3', name: 'Kavita Menon', role: 'Senior Therapist', email: 'kavita@glowclinic.com', phone: '+91 76543 21098', userRole: 'STAFF', isActive: true, specialization: 'Body Treatments', availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } },
  { id: '4', name: 'Rekha Pillai', role: 'Aesthetician', email: 'rekha@glowclinic.com', phone: '+91 65432 10987', userRole: 'STAFF', isActive: true, specialization: 'Facials & Peels', availability: { mon: true, tue: false, wed: true, thu: true, fri: true, sat: true, sun: false } },
  { id: '5', name: 'Sanjay Gupta', role: 'Receptionist', email: 'sanjay@glowclinic.com', phone: '+91 54321 09876', userRole: 'STAFF', isActive: false, specialization: 'Front Desk', availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } },
];

const roleColors: Record<string, string> = {
  ORG_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  STAFF: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userRole, setUserRole] = useState<'ORG_ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [specialization, setSpecialization] = useState('');

  const toggleDayAvailability = (staffId: string, day: string) => {
    setStaffList(prev => prev.map(member => {
      if (member.id === staffId) {
        return {
          ...member,
          availability: {
            ...member.availability,
            [day]: !member.availability[day]
          }
        };
      }
      return member;
    }));
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaffList(prev => prev.map(member => {
      if (member.id === staffId) {
        return { ...member, isActive: !member.isActive };
      }
      return member;
    }));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: StaffMember = {
      id: Date.now().toString(),
      name,
      role: role || 'General Practitioner',
      email,
      phone: phone || '+91 99999 00000',
      userRole,
      isActive: true,
      specialization: specialization || 'General Care',
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }
    };

    setStaffList([...staffList, newMember]);
    setIsModalOpen(false);
    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setSpecialization('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Staff & Staff Availability</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage your clinic team members, access roles, and weekly working schedules.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg"
        >
          <Plus size={16} />
          Add Staff Member
        </button>
      </div>

      {/* Staff Grid / Table */}
      <div className="grid gap-3">
        {staffList.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl hover:border-purple-500/30 transition-all group",
              !member.isActive && "opacity-60 bg-slate-950/40"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {getInitials(member.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[var(--color-text)]">{member.name}</span>
                    <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border font-semibold", roleColors[member.userRole])}>
                      {member.userRole}
                    </span>
                    <button
                      onClick={() => toggleStaffStatus(member.id)}
                      className={cn(
                        "px-2 py-0.5 text-[10px] rounded-full font-medium transition-colors border",
                        member.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      )}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {member.role} · <span className="text-purple-300 font-medium">{member.specialization}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col text-xs text-[var(--color-text-muted)] space-y-0.5">
                  <span className="flex items-center gap-1.5"><Mail size={12} className="text-purple-400" />{member.email}</span>
                  <span className="flex items-center gap-1.5"><Phone size={12} className="text-emerald-400" />{member.phone}</span>
                </div>

                {/* Day-by-Day Availability Toggle */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Weekly Shift Days (Click to toggle)</span>
                  <div className="flex gap-1">
                    {DAYS.map((day) => {
                      const isAvailable = member.availability[day];
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDayAvailability(member.id, day)}
                          title={`Toggle ${day.toUpperCase()} availability`}
                          className={cn(
                            "w-7 h-7 rounded-lg text-[9px] font-bold flex items-center justify-center uppercase transition-all shadow-sm",
                            isAvailable
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:scale-105"
                              : "bg-slate-800/80 text-slate-500 border border-slate-700 hover:bg-slate-700"
                          )}
                        >
                          {day.charAt(0)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <User size={18} className="text-purple-400" />
                  Add New Staff Member
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Job Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Dermatologist"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">User Access Tier</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="STAFF">STAFF (Limited)</option>
                      <option value="MANAGER">MANAGER (Full Clinic Access)</option>
                      <option value="ORG_ADMIN">ORG ADMIN (Owner)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@glowclinic.com"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Specialization / Department</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Laser & Acne Treatments"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors"
                  >
                    Add Staff Member
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

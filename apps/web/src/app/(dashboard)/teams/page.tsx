'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { NicheId } from '@/config/niches/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Mail, 
  Phone, 
  User, 
  X, 
  Star, 
  MessageSquare, 
  Search, 
  Users,
  Edit2,
  Trash2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';
import { apiClient } from '@/lib/api-client';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  userRole: 'ORG_ADMIN' | 'MANAGER' | 'STAFF';
  shiftStatus: 'On Duty' | 'In Surgery' | 'On Leave' | 'Off Duty';
  isActive: boolean;
  specialization: string;
  photoUrl?: string;
  metrics: {
    monthlyAppts: number;
    rating: number;
    efficiency: string;
    revenue: string;
  };
  availability: Record<string, boolean>;
}

const DEPARTMENTS_BY_NICHE: Record<NicheId, string[]> = {
  skin: ['Dermatology', 'Aesthetics', 'Laser', 'Hair Restoration', 'Front Desk', 'Billing', 'Nursing'],
  dental: ['Endodontics', 'Prosthodontics', 'Orthodontics', 'Oral Surgery', 'Hygiene', 'Front Desk', 'Billing'],
  spa: ['Massage', 'Body Treatments', 'Facial Therapy', 'Aromatherapy', 'Front Desk', 'Guest Relations'],
  salon: ['Hair Styling', 'Hair Color', 'Bridal', 'Skin & Facial', 'Nail Art', 'Front Desk', 'Billing'],
  realestate: ['Sales', 'Leasing', 'Legal', 'Marketing', 'Customer Relations', 'Finance', 'Admin'],
  hotel: ['Front Office', 'Housekeeping', 'F&B Service', 'Kitchen', 'Concierge', 'Events', 'Engineering'],
};

export default function TeamsPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const departments = DEPARTMENTS_BY_NICHE[currentNiche] || DEPARTMENTS_BY_NICHE.skin;

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<string>(departments[0] || 'General');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userRole, setUserRole] = useState<'ORG_ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [specialization, setSpecialization] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<any[]>('/staff');
      if (Array.isArray(data)) {
        const mapped: TeamMember[] = data.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role || 'Practitioner',
          department: s.department || departments[0] || 'Clinical',
          email: s.email || 'staff@clinic.com',
          phone: s.phone || '',
          userRole: s.userRole || 'STAFF',
          shiftStatus: s.isActive ? 'On Duty' : 'Off Duty',
          isActive: s.isActive ?? true,
          specialization: s.specialization || s.role || 'Clinical Care',
          metrics: {
            monthlyAppts: s.appointmentsCount || 0,
            rating: 5.0,
            efficiency: '100%',
            revenue: '₹0',
          },
          availability: s.availability || { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false },
        }));
        setTeamList(mapped);
      } else {
        setTeamList([]);
      }
    } catch (e) {
      console.warn('Failed to fetch staff from API, displaying empty state:', e);
      setTeamList([]);
    } finally {
      setIsLoading(false);
    }
  }, [departments]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff, currentNiche]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient('/staff', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim() || 'Staff Specialist',
          department,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          specialization: specialization.trim() || undefined,
        }),
      });

      setIsModalOpen(false);
      setName('');
      setRole('');
      setEmail('');
      setPhone('');
      setSpecialization('');
      fetchStaff();
    } catch (err) {
      console.error('Failed to create staff member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMembers = teamList.filter((m) => {
    const matchesDept = selectedDept === 'All' || m.department === selectedDept;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 min-h-screen" style={{ color: 'var(--color-text)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="text-blue-500" /> Team & Staff Directory
          </h1>
          <p className="opacity-70 text-sm mt-1">
            Manage {nicheConfig?.terminology?.staff || 'staff'} members, doctors, and specialists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStaff()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            title="Refresh Staff"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-400' : ''} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={15} /> Add Team Member
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedDept('All')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0',
              selectedDept === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            All Departments
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0',
                selectedDept === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--color-text)]"
          />
        </div>
      </div>

      {/* Team Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="p-12 border border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-[var(--color-surface)]/50">
          <Users size={36} className="opacity-30 text-blue-500" />
          <h3 className="text-base font-semibold">No Team Members Found</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm">
            {searchQuery || selectedDept !== 'All'
              ? 'No staff members match the current filter criteria.'
              : 'Add your clinic doctors, nurses, and front-desk receptionists to enable appointment slot assignment.'}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold mt-2 transition"
          >
            Add First Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <motion.div
              layout
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-500/40 transition shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text)]">{member.name}</h3>
                    <p className="text-xs text-blue-400 font-medium">{member.role}</p>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{member.department}</span>
                  </div>
                </div>

                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                    member.shiftStatus === 'On Duty'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  )}
                >
                  {member.shiftStatus}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] text-xs space-y-2 text-[var(--color-text-muted)]">
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-blue-400" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-blue-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span>Specialization:</span>
                <span className="font-semibold text-[var(--color-text)]">{member.specialization}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Add Team Member</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ayesha Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Consultant Dermatologist"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Acne & Laser"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="ayesha@clinic.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Add Member'}
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

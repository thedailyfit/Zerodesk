'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Mail, 
  Phone, 
  User, 
  X, 
  Check, 
  Shield, 
  Clock, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Search, 
  Users, 
  SlidersHorizontal,
  Activity,
  Award
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: 'Dermatology' | 'Hair Restoration' | 'Aesthetics' | 'Front Desk';
  email: string;
  phone: string;
  userRole: 'ORG_ADMIN' | 'MANAGER' | 'STAFF';
  shiftStatus: 'On Duty' | 'In Surgery' | 'On Leave' | 'Off Duty';
  isActive: boolean;
  specialization: string;
  metrics: {
    monthlyAppts: number;
    rating: number;
    efficiency: string;
    revenue: string;
  };
  availability: Record<string, boolean>;
}

const INITIAL_TEAM: TeamMember[] = [
  { 
    id: '1', 
    name: 'Dr. Meenakshi Rao', 
    role: 'Lead Dermatologist', 
    department: 'Dermatology', 
    email: 'meenakshi@glowclinic.com', 
    phone: '+91 98765 43210', 
    userRole: 'MANAGER', 
    shiftStatus: 'In Surgery', 
    isActive: true, 
    specialization: 'Laser & Acne Specialist', 
    metrics: { monthlyAppts: 142, rating: 4.9, efficiency: '98%', revenue: '₹11.2L' },
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
  },
  { 
    id: '2', 
    name: 'Dr. Arun Krishnan', 
    role: 'Hair Transplant Surgeon', 
    department: 'Hair Restoration', 
    email: 'arun@glowclinic.com', 
    phone: '+91 87654 32109', 
    userRole: 'MANAGER', 
    shiftStatus: 'On Duty', 
    isActive: true, 
    specialization: 'FUE Hair Restoration', 
    metrics: { monthlyAppts: 86, rating: 4.8, efficiency: '95%', revenue: '₹9.8L' },
    availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } 
  },
  { 
    id: '3', 
    name: 'Kavita Menon', 
    role: 'Senior Aesthetic Therapist', 
    department: 'Aesthetics', 
    email: 'kavita@glowclinic.com', 
    phone: '+91 76543 21098', 
    userRole: 'STAFF', 
    shiftStatus: 'On Duty', 
    isActive: true, 
    specialization: 'Body Contouring & Peels', 
    metrics: { monthlyAppts: 110, rating: 4.9, efficiency: '99%', revenue: '₹3.2L' },
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } 
  },
  { 
    id: '4', 
    name: 'Rekha Pillai', 
    role: 'Aesthetician', 
    department: 'Aesthetics', 
    email: 'rekha@glowclinic.com', 
    phone: '+91 65432 10987', 
    userRole: 'STAFF', 
    shiftStatus: 'Off Duty', 
    isActive: true, 
    specialization: 'Facials & Medi-Spas', 
    metrics: { monthlyAppts: 72, rating: 4.7, efficiency: '94%', revenue: '₹1.6L' },
    availability: { mon: true, tue: false, wed: true, thu: true, fri: true, sat: true, sun: false } 
  },
  { 
    id: '5', 
    name: 'Sanjay Gupta', 
    role: 'Front Desk Lead', 
    department: 'Front Desk', 
    email: 'sanjay@glowclinic.com', 
    phone: '+91 54321 09876', 
    userRole: 'STAFF', 
    shiftStatus: 'On Duty', 
    isActive: true, 
    specialization: 'Patient Relations & Billing', 
    metrics: { monthlyAppts: 310, rating: 4.9, efficiency: '100%', revenue: 'N/A' },
    availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
  },
];

const roleColors: Record<string, string> = {
  ORG_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  STAFF: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const statusColors: Record<string, string> = {
  'On Duty': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'In Surgery': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'On Leave': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Off Duty': 'bg-slate-800 text-slate-400 border-slate-700',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function TeamsPage() {
  const [teamList, setTeamList] = useState<TeamMember[]>(INITIAL_TEAM);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<'Dermatology' | 'Hair Restoration' | 'Aesthetics' | 'Front Desk'>('Dermatology');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userRole, setUserRole] = useState<'ORG_ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [specialization, setSpecialization] = useState('');

  const filteredMembers = teamList.filter(m => {
    const matchesDept = selectedDept === 'All' || m.department === selectedDept;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const toggleDayAvailability = (staffId: string, day: string) => {
    setTeamList(prev => prev.map(member => {
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
    setTeamList(prev => prev.map(member => {
      if (member.id === staffId) {
        return { ...member, isActive: !member.isActive };
      }
      return member;
    }));
  };

  const updateUserRole = (staffId: string, newRole: 'ORG_ADMIN' | 'MANAGER' | 'STAFF') => {
    setTeamList(prev => prev.map(member => {
      if (member.id === staffId) {
        return { ...member, userRole: newRole };
      }
      return member;
    }));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name,
      role: role || 'General Practitioner',
      department,
      email,
      phone: phone || '+91 99999 00000',
      userRole,
      shiftStatus: 'On Duty',
      isActive: true,
      specialization: specialization || 'General Care',
      metrics: { monthlyAppts: 0, rating: 5.0, efficiency: '100%', revenue: '₹0' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }
    };

    setTeamList([...teamList, newMember]);
    setIsModalOpen(false);
    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setSpecialization('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Users className="text-purple-400" /> Teams & Resource Management
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage clinic practitioners, staff schedules, performance metrics, and access tiers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Add Team Member
        </button>
      </div>

      {/* Department Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-2 rounded-2xl">
        {/* Department Filter Tabs */}
        <div className="flex flex-wrap gap-1">
          {['All', 'Dermatology', 'Hair Restoration', 'Aesthetics', 'Front Desk'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
                selectedDept === dept
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-[var(--color-text-muted)] hover:text-white hover:bg-slate-800/60"
              )}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-3xl shadow-sm hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 relative group",
              !member.isActive && "opacity-60 bg-slate-950/40"
            )}
          >
            {/* Top row: Avatar + Name + Badges */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-base font-extrabold shadow-md shrink-0">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                      {member.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{member.role}</p>
                    <span className="inline-block text-[10px] text-purple-300 font-semibold mt-0.5">
                      {member.department}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-col items-end gap-1">
                  <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border font-bold", statusColors[member.shiftStatus])}>
                    {member.shiftStatus}
                  </span>
                  
                  {/* Role Selector Dropdown */}
                  <select
                    value={member.userRole}
                    onChange={(e) => updateUserRole(member.id, e.target.value as any)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-lg border font-semibold bg-slate-950 focus:outline-none cursor-pointer",
                      roleColors[member.userRole]
                    )}
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ORG_ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              {/* Performance Metrics Box */}
              <div className="grid grid-cols-4 gap-2 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 text-center">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Appts</p>
                  <p className="text-xs font-bold text-slate-200 font-mono mt-0.5">{member.metrics.monthlyAppts}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Rating</p>
                  <p className="text-xs font-bold text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                    {member.metrics.rating} <Star size={9} className="fill-amber-400" />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Efficiency</p>
                  <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">{member.metrics.efficiency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-medium">Revenue</p>
                  <p className="text-xs font-bold text-purple-300 font-mono mt-0.5">{member.metrics.revenue}</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-[var(--color-glass-border)] pt-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${member.phone}`}
                  title={`Call ${member.name}`}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
                >
                  <Phone size={14} />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  title={`Email ${member.name}`}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-400 hover:border-purple-500/30 transition-colors"
                >
                  <Mail size={14} />
                </a>
                <button
                  title={`Send WhatsApp message`}
                  onClick={() => alert(`Opening chat with ${member.name}...`)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-blue-400 hover:border-blue-500/30 transition-colors cursor-pointer"
                >
                  <MessageSquare size={14} />
                </button>
              </div>

              {/* Active Toggle */}
              <button
                onClick={() => toggleStaffStatus(member.id)}
                className={cn(
                  "px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer",
                  member.isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                )}
              >
                {member.isActive ? 'Active Staff' : 'Inactive'}
              </button>
            </div>

            {/* Shift Days Row */}
            <div className="pt-2 border-t border-[var(--color-glass-border)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold">Weekly Shift Schedule</span>
                <span className="text-[9px] text-slate-500">Click to toggle</span>
              </div>
              <div className="flex justify-between gap-1">
                {DAYS.map((day) => {
                  const isAvailable = member.availability[day];
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDayAvailability(member.id, day)}
                      title={`Toggle ${day.toUpperCase()} availability`}
                      className={cn(
                        "w-8 h-7 rounded-lg text-[9px] font-bold flex items-center justify-center uppercase transition-all shadow-sm cursor-pointer",
                        isAvailable
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:scale-105"
                          : "bg-slate-900 text-slate-600 border border-slate-800 hover:bg-slate-800"
                      )}
                    >
                      {day.charAt(0)}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Team Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <User size={18} className="text-purple-400" /> Add New Team Member
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sunita Kapoor"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Dermatologist"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      <option value="Dermatology">Dermatology</option>
                      <option value="Hair Restoration">Hair Restoration</option>
                      <option value="Aesthetics">Aesthetics</option>
                      <option value="Front Desk">Front Desk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sunita@glowclinic.com"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">User Access Tier</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="STAFF">STAFF (Limited Clinic Access)</option>
                    <option value="MANAGER">MANAGER (Full Clinic Access)</option>
                    <option value="ORG_ADMIN">ORG ADMIN (Owner / Executive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Anti-Aging & Laser Surgery"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Add Member
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

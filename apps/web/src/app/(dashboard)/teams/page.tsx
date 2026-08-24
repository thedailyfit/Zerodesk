'use client';

import { useState, useRef, useEffect } from 'react';
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
  Upload
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';

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
  auto: ['Sales', 'Service Center', 'Spare Parts', 'Finance & Insurance', 'Marketing', 'Admin'],
};

const DEFAULT_TEAMS_BY_NICHE: Record<NicheId, TeamMember[]> = {
  skin: [
    { 
      id: 'tm-sk-1', 
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
      id: 'tm-sk-2', 
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
      id: 'tm-sk-3', 
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
      id: 'tm-sk-4', 
      name: 'Pooja Hegde', 
      role: 'Frontdesk Manager', 
      department: 'Front Desk', 
      email: 'pooja@glowclinic.com', 
      phone: '+91 54321 09876', 
      userRole: 'ORG_ADMIN', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Patient Relations & Billing', 
      metrics: { monthlyAppts: 310, rating: 4.9, efficiency: '100%', revenue: 'N/A' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    }
  ],
  dental: [
    { 
      id: 'tm-dt-1', 
      name: 'Dr. Arvind Sharma', 
      role: 'Chief Endodontist', 
      department: 'Endodontics', 
      email: 'dr.sharma@dentalcare.com', 
      phone: '+91 91234 11111', 
      userRole: 'MANAGER', 
      shiftStatus: 'In Surgery', 
      isActive: true, 
      specialization: 'Rotary RCT & Micro-Endo', 
      metrics: { monthlyAppts: 128, rating: 4.95, efficiency: '97%', revenue: '₹14.5L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-dt-2', 
      name: 'Dr. Priya Nair', 
      role: 'Orthodontist Specialist', 
      department: 'Orthodontics', 
      email: 'dr.priya@dentalcare.com', 
      phone: '+91 91234 22222', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Clear Aligners & Braces', 
      metrics: { monthlyAppts: 94, rating: 4.9, efficiency: '96%', revenue: '₹18.2L' },
      availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-dt-3', 
      name: 'Dr. Rohan Verma', 
      role: 'Implantologist & Cosmetic Lead', 
      department: 'Prosthodontics', 
      email: 'dr.rohan@dentalcare.com', 
      phone: '+91 91234 33333', 
      userRole: 'STAFF', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Titanium Implants & Zirconia', 
      metrics: { monthlyAppts: 72, rating: 4.85, efficiency: '94%', revenue: '₹12.0L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } 
    },
    { 
      id: 'tm-dt-4', 
      name: 'Sarah Hygienist', 
      role: 'Lead Dental Hygienist', 
      department: 'Hygiene', 
      email: 'sarah@dentalcare.com', 
      phone: '+91 91234 44444', 
      userRole: 'STAFF', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Deep Scaling & Preventive Polish', 
      metrics: { monthlyAppts: 160, rating: 4.9, efficiency: '99%', revenue: '₹2.8L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    }
  ],
  spa: [
    { 
      id: 'tm-sp-1', 
      name: 'Master Somchai', 
      role: 'Master Deep Tissue Therapist', 
      department: 'Massage', 
      email: 'somchai@serenityspa.com', 
      phone: '+91 99887 11111', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Hot Stone & Deep Tissue Recovery', 
      metrics: { monthlyAppts: 135, rating: 4.98, efficiency: '99%', revenue: '₹5.4L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-sp-2', 
      name: 'Ananya Healer', 
      role: 'Ayurvedic Physician (BAMS)', 
      department: 'Body Treatments', 
      email: 'ananya@serenityspa.com', 
      phone: '+91 99887 22222', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Panchakarma & Abhyanga Detox', 
      metrics: { monthlyAppts: 110, rating: 4.9, efficiency: '96%', revenue: '₹6.1L' },
      availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-sp-3', 
      name: 'Maya Sen', 
      role: 'Senior Aromatherapist', 
      department: 'Aromatherapy', 
      email: 'maya@serenityspa.com', 
      phone: '+91 99887 33333', 
      userRole: 'STAFF', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Organic Herbal Wraps & Scrubs', 
      metrics: { monthlyAppts: 92, rating: 4.85, efficiency: '95%', revenue: '₹3.8L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } 
    }
  ],
  salon: [
    { 
      id: 'tm-sl-1', 
      name: 'Zara Khan', 
      role: 'Master Creative Director', 
      department: 'Hair Styling', 
      email: 'zara@luxurysalon.com', 
      phone: '+91 98123 11111', 
      userRole: 'ORG_ADMIN', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Precision Couture Cuts & Keratin', 
      metrics: { monthlyAppts: 154, rating: 4.96, efficiency: '98%', revenue: '₹9.4L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-sl-2', 
      name: 'Rohit Mehra', 
      role: 'Senior Colorist & Balayage Lead', 
      department: 'Hair Color', 
      email: 'rohit@luxurysalon.com', 
      phone: '+91 98123 22222', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Balayage, Babylights & Olaplex', 
      metrics: { monthlyAppts: 118, rating: 4.9, efficiency: '96%', revenue: '₹8.1L' },
      availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-sl-3', 
      name: 'Tanya Roy', 
      role: 'Lead Bridal Artist', 
      department: 'Bridal', 
      email: 'tanya@luxurysalon.com', 
      phone: '+91 98123 33333', 
      userRole: 'STAFF', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Celebrity HD Airbrush Glam', 
      metrics: { monthlyAppts: 45, rating: 4.95, efficiency: '100%', revenue: '₹6.8L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    }
  ],
  realestate: [
    { 
      id: 'tm-re-1', 
      name: 'Vikram Aditya', 
      role: 'Senior Luxury Property Advisor', 
      department: 'Sales', 
      email: 'vikram@zerorealty.com', 
      phone: '+91 90011 11111', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Luxury Villas & Penthouse Closures', 
      metrics: { monthlyAppts: 48, rating: 4.9, efficiency: '95%', revenue: '₹85.0L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-re-2', 
      name: 'Rajesh Gupta', 
      role: 'Commercial Portfolio Head', 
      department: 'Leasing', 
      email: 'rajesh@zerorealty.com', 
      phone: '+91 90011 22222', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Grade-A Commercial Space & RERA Title', 
      metrics: { monthlyAppts: 36, rating: 4.85, efficiency: '92%', revenue: '₹1.2Cr' },
      availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } 
    }
  ],
  hotel: [
    { 
      id: 'tm-ht-1', 
      name: 'Kabir Mehta', 
      role: 'Chief Concierge & VIP Relations', 
      department: 'Concierge', 
      email: 'kabir@grandhotel.com', 
      phone: '+91 97766 11111', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Luxury Stay Protocol & Guest Delight', 
      metrics: { monthlyAppts: 220, rating: 4.98, efficiency: '99%', revenue: '₹24.0L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-ht-2', 
      name: 'Sunita Rao', 
      role: 'Front Office Hostess Head', 
      department: 'Front Office', 
      email: 'sunita@grandhotel.com', 
      phone: '+91 97766 22222', 
      userRole: 'STAFF', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Express PMS Check-in & Folios', 
      metrics: { monthlyAppts: 450, rating: 4.92, efficiency: '100%', revenue: 'N/A' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    }
  ],
  auto: [
    { 
      id: 'tm-au-1', 
      name: 'Suresh Kumar', 
      role: 'Senior Sales Lead', 
      department: 'Sales', 
      email: 'suresh@zeroshowroom.com', 
      phone: '+91 96655 11111', 
      userRole: 'MANAGER', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'SUV Specialist & Corporate Sales', 
      metrics: { monthlyAppts: 64, rating: 4.9, efficiency: '96%', revenue: '₹1.8Cr' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    },
    { 
      id: 'tm-au-2', 
      name: 'Gaurav Singh', 
      role: 'Master Service Lead', 
      department: 'Service Center', 
      email: 'gaurav@zeroshowroom.com', 
      phone: '+91 96655 22222', 
      userRole: 'STAFF', 
      shiftStatus: 'On Duty', 
      isActive: true, 
      specialization: 'Diagnostics, Detailing & Warranty', 
      metrics: { monthlyAppts: 180, rating: 4.88, efficiency: '95%', revenue: '₹14.2L' },
      availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } 
    }
  ]
};

const roleColors: Record<string, string> = {
  ORG_ADMIN: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  STAFF: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const statusColors: Record<string, string> = {
  'On Duty': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'In Surgery': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'On Leave': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Off Duty': 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function TeamsPage() {
  const { currentNiche } = useNiche();
  const [teamList, setTeamList] = useState<TeamMember[]>(() => DEFAULT_TEAMS_BY_NICHE[currentNiche] || DEFAULT_TEAMS_BY_NICHE.skin);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setTeamList(DEFAULT_TEAMS_BY_NICHE[currentNiche] || DEFAULT_TEAMS_BY_NICHE.skin);
    setSelectedDept('All');
  }, [currentNiche]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = DEPARTMENTS_BY_NICHE[currentNiche] || DEPARTMENTS_BY_NICHE.skin;

  // Form State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<string>(departments[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userRole, setUserRole] = useState<'ORG_ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [specialization, setSpecialization] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingMemberId(null);
    setName('');
    setRole('');
    setDepartment(departments[0]);
    setEmail('');
    setPhone('');
    setUserRole('STAFF');
    setSpecialization('');
    setPhotoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setName(member.name);
    setRole(member.role);
    setDepartment(member.department);
    setEmail(member.email);
    setPhone(member.phone);
    setUserRole(member.userRole);
    setSpecialization(member.specialization);
    setPhotoUrl(member.photoUrl || '');
    setIsModalOpen(true);
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setTeamList(prev => prev.filter(m => m.id !== memberId));
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingMemberId) {
      setTeamList(prev => prev.map(m => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name,
            role: role || 'Staff',
            department,
            email,
            phone: phone || '+91 99999 00000',
            userRole,
            specialization: specialization || 'General',
            photoUrl
          };
        }
        return m;
      }));
    } else {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name,
        role: role || 'Staff',
        department,
        email,
        phone: phone || '+91 99999 00000',
        userRole,
        shiftStatus: 'On Duty',
        isActive: true,
        specialization: specialization || 'General',
        photoUrl,
        metrics: { monthlyAppts: 0, rating: 5.0, efficiency: '100%', revenue: '₹0' },
        availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }
      };
      setTeamList([...teamList, newMember]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Users className="text-blue-600 dark:text-blue-400" /> Teams & Resource Management
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Add Team Member
        </button>
      </div>

      {/* Department Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-2 rounded-2xl">
        {/* Department Filter Tabs */}
        <div className="flex flex-wrap gap-1">
          {['All', ...departments].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
                selectedDept === dept
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-[var(--color-text-muted)] hover:text-blue-600 dark:hover:text-white hover:bg-[var(--color-bg)]"
              )}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
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
              "p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 relative group",
              !member.isActive && "opacity-60 bg-[var(--color-bg)]"
            )}
          >
            {/* Top row: Avatar + Name + Badges */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-md border border-[var(--color-border)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-base font-extrabold shadow-md shrink-0">
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                      {member.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{member.role}</p>
                    <span className="inline-block text-[10px] text-blue-600 dark:text-blue-300 font-semibold mt-0.5">
                      {member.department}
                    </span>
                  </div>
                </div>

                {/* Actions & Status Badges */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 mb-1">
                    <button onClick={() => openEditModal(member)} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 transition-colors bg-[var(--color-bg)] rounded-md border border-[var(--color-border)]" title="Edit Member">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDeleteMember(member.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors bg-[var(--color-bg)] rounded-md border border-[var(--color-border)]" title="Delete Member">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border font-bold", statusColors[member.shiftStatus])}>
                    {member.shiftStatus}
                  </span>
                  
                  {/* Role Selector Dropdown */}
                  <select
                    value={member.userRole}
                    onChange={(e) => updateUserRole(member.id, e.target.value as any)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-lg border font-semibold bg-[var(--color-bg)] focus:outline-none cursor-pointer",
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
              <div className="grid grid-cols-4 gap-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-2.5 text-center">
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Appts</p>
                  <p className="text-xs font-bold text-[var(--color-text)] font-mono mt-0.5">{member.metrics.monthlyAppts}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Rating</p>
                  <p className="text-xs font-bold text-amber-500 font-mono mt-0.5 flex items-center justify-center gap-0.5">
                    {member.metrics.rating} <Star size={9} className="fill-amber-500" />
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Efficiency</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{member.metrics.efficiency}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Revenue</p>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-300 font-mono mt-0.5">{member.metrics.revenue}</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${member.phone}`}
                  title={`Call ${member.name}`}
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-emerald-500 transition-colors"
                >
                  <Phone size={14} />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  title={`Email ${member.name}`}
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-blue-500 transition-colors"
                >
                  <Mail size={14} />
                </a>
                <button
                  title={`Send WhatsApp message`}
                  onClick={() => alert(`Opening chat with ${member.name}...`)}
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-blue-500 transition-colors cursor-pointer"
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
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20"
                )}
              >
                {member.isActive ? 'Active Staff' : 'Inactive'}
              </button>
            </div>

            {/* Shift Days Row */}
            <div className="pt-2 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Weekly Shift Schedule</span>
                <span className="text-[9px] text-[var(--color-text-muted)] opacity-70">Click to toggle</span>
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
                          ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 hover:scale-105"
                          : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
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

      {/* Add/Edit Team Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 text-[var(--color-text)] space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <User size={18} className="text-blue-500" /> {editingMemberId ? 'Edit Team Member' : 'Add New Team Member'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4">
                {/* Photo Upload Zone */}
                <div className="flex flex-col items-center justify-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-[var(--color-text-muted)] cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-colors overflow-hidden bg-[var(--color-bg)]"
                  >
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={20} className="mb-1" />
                        <span className="text-[9px] font-semibold">Upload Photo</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Sunita Kapoor"
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Job Title</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Dermatologist"
                      className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)]"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sunita@glowclinic.com"
                      className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">User Access Tier</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)]"
                  >
                    <option value="STAFF">STAFF (Limited Clinic Access)</option>
                    <option value="MANAGER">MANAGER (Full Clinic Access)</option>
                    <option value="ORG_ADMIN">ORG ADMIN (Owner / Executive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Anti-Aging & Laser Surgery"
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    {editingMemberId ? 'Save Changes' : 'Add Member'}
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

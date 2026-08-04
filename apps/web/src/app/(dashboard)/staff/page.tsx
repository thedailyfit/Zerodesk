'use client';

import { motion } from 'framer-motion';
import { Plus, UserCog, Mail, Phone, Shield, Clock, MoreHorizontal } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

const staff = [
  { id: '1', name: 'Dr. Meenakshi Rao', role: 'Dermatologist', email: 'meenakshi@glowclinic.com', phone: '+91 98765 43210', userRole: 'MANAGER', isActive: true, specialization: 'Laser Treatments', availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false } },
  { id: '2', name: 'Dr. Arun Krishnan', role: 'Hair Transplant Specialist', email: 'arun@glowclinic.com', phone: '+91 87654 32109', userRole: 'MANAGER', isActive: true, specialization: 'Hair Restoration', availability: { mon: true, tue: true, wed: false, thu: true, fri: true, sat: true, sun: false } },
  { id: '3', name: 'Kavita Menon', role: 'Senior Therapist', email: 'kavita@glowclinic.com', phone: '+91 76543 21098', userRole: 'STAFF', isActive: true, specialization: 'Body Treatments', availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } },
  { id: '4', name: 'Rekha Pillai', role: 'Aesthetician', email: 'rekha@glowclinic.com', phone: '+91 65432 10987', userRole: 'STAFF', isActive: true, specialization: 'Facials & Peels', availability: { mon: true, tue: false, wed: true, thu: true, fri: true, sat: true, sun: false } },
  { id: '5', name: 'Sanjay Gupta', role: 'Receptionist', email: 'sanjay@glowclinic.com', phone: '+91 54321 09876', userRole: 'STAFF', isActive: false, specialization: 'Front Desk', availability: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false } },
];

const roleColors: Record<string, string> = {
  ORG_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  STAFF: 'bg-green-500/10 text-green-400 border-green-500/20',
  VIEWER: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your team members and their availability</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      <div className="grid gap-3">
        {staff.map((member, i) => (
          <motion.div key={member.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={cn("p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl hover:bg-[var(--color-glass-hover)] transition-all group", !member.isActive && "opacity-50")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(member.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[var(--color-text)]">{member.name}</span>
                    <span className={cn("px-2 py-0.5 text-[10px] rounded-full border", roleColors[member.userRole])}>{member.userRole}</span>
                    {!member.isActive && <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Inactive</span>}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">{member.role} · {member.specialization}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><Mail size={12} />{member.email}</span>
                  <span className="flex items-center gap-1"><Phone size={12} />{member.phone}</span>
                </div>
                <div className="flex gap-0.5">
                  {days.map((day) => (
                    <div key={day} className={cn("w-6 h-6 rounded text-[8px] font-bold flex items-center justify-center uppercase",
                      (member.availability as any)[day] ? "bg-green-500/10 text-green-400" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"
                    )}>
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--color-surface)] rounded">
                  <MoreHorizontal size={16} className="text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

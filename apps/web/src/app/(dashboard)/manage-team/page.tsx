'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  Edit2, 
  PlayCircle, 
  Crown,
  Key,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamMemberAccess {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  joinedDate: string;
  status: 'Active' | 'Invited';
}

const STORAGE_KEY = 'zerodesk_team_members';

const INITIAL_MEMBERS: TeamMemberAccess[] = [
  {
    id: 'm-1',
    name: 'Arogya (Owner)',
    email: 'theakhileshreddy07@gmail.com',
    role: 'ADMIN',
    joinedDate: '8 days ago',
    status: 'Active'
  },
  {
    id: 'm-2',
    name: 'Pooja (Frontdesk Lead)',
    email: 'frontdesk@zerodesk.in',
    role: 'STAFF',
    joinedDate: '3 days ago',
    status: 'Active'
  }
];

export default function ManageTeamPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'pending' | 'roles'>('members');
  const [members, setMembers] = useState<TeamMemberAccess[]>(INITIAL_MEMBERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberAccess | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load team members', e);
    }
  }, []);

  const saveMembers = (newMembers: TeamMemberAccess[]) => {
    setMembers(newMembers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers));
    } catch (e) {
      console.error('Failed to save team members', e);
    }
  };

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MANAGER' | 'STAFF'>('STAFF');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: TeamMemberAccess = {
      id: `m-${Date.now()}`,
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      joinedDate: 'Just now',
      status: 'Invited'
    };

    saveMembers([newMember, ...members]);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setIsAddModalOpen(false);
      setInviteEmail('');
      setInviteName('');
    }, 1200);
  };

  const handleDeleteMember = (id: string) => {
    saveMembers(members.filter(m => m.id !== id));
  };

  const handleUpdateRole = (id: string, newRole: 'ADMIN' | 'MANAGER' | 'STAFF') => {
    saveMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
    setEditingMember(null);
  };

  const getRoleBadge = (role: TeamMemberAccess['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'MANAGER':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'STAFF':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Notice (Matching Reference Screenshot) */}
      <div className="p-3.5 px-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-300 font-medium">
        Add your whole team to the dashboard and control exactly what each employee can see and do.
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Manage Team</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Control user accounts, staff logins, and role-based dashboard permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-muted)] transition-colors">
            <PlayCircle size={14} />
            <span>Watch guide</span>
          </button>
        </div>
      </div>

      {/* Tabs & Add Member Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'members'
                ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            )}
          >
            <Users size={14} />
            <span>All Members ({members.filter(m => m.status === 'Active').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'pending'
                ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            )}
          >
            <Mail size={14} />
            <span>Pending Invitations ({members.filter(m => m.status === 'Invited').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'roles'
                ? "bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            )}
          >
            <ShieldCheck size={14} />
            <span>Role Permissions</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            Write seats: {members.length}/10
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25"
          >
            <UserPlus size={14} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Tab 1: All Members / Pending */}
      {(activeTab === 'members' || activeTab === 'pending') && (
        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface)]/60 border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-4">Role Access</th>
                  <th className="py-3 px-4">Joined / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {members
                  .filter(m => activeTab === 'members' ? m.status === 'Active' : m.status === 'Invited')
                  .map((member) => (
                    <tr key={member.id} className="hover:bg-[var(--color-surface)]/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.role === 'ADMIN' && <Crown size={12} className="text-amber-400" />}
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className={cn("px-2.5 py-0.5 rounded-full border text-[11px] font-bold inline-block", getRoleBadge(member.role))}>
                          {member.role === 'ADMIN' ? 'Admin (Owner)' : member.role === 'MANAGER' ? 'Manager' : 'Frontdesk Staff'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? "bg-emerald-400" : "bg-amber-400")} />
                          <span className="text-[var(--color-text-muted)]">{member.joinedDate}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingMember(member)}
                            title="Edit Permissions"
                            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-blue-400 transition-colors"
                          >
                            <Edit2 size={13} />
                          </button>
                          {member.role !== 'ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member.id)}
                              title="Remove Access"
                              className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                {members.filter(m => activeTab === 'members' ? m.status === 'Active' : m.status === 'Invited').length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                      No members found in this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Roles & Permissions Breakdown */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-blue-400">
              <Crown size={18} />
              <h3 className="font-bold text-sm text-[var(--color-text)]">Admin (Owner)</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Unrestricted full access across business intelligence, financial accounts, and system configuration.
            </p>
            <ul className="text-xs space-y-1.5 text-[var(--color-text)] border-t border-[var(--color-border)] pt-3">
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Full Access to Business Health & Revenue</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Manage Team & Role Access</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> AI Knowledge Hub & Voice Settings</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Financial Reports & Invoices</li>
            </ul>
          </div>

          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-amber-400">
              <Shield size={18} />
              <h3 className="font-bold text-sm text-[var(--color-text)]">Manager</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Supervises operational staff, CRM lead pipelines, sales metrics, and schedule management.
            </p>
            <ul className="text-xs space-y-1.5 text-[var(--color-text)] border-t border-[var(--color-border)] pt-3">
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Automated Leads & CRM Management</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Staff Calendar & Scheduling</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Operational Delays & Analytics</li>
              <li className="flex items-center gap-2 text-[var(--color-text-muted)]"><X size={13} className="text-rose-400" /> No access to System API Keys</li>
            </ul>
          </div>

          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-emerald-400">
              <Key size={18} />
              <h3 className="font-bold text-sm text-[var(--color-text)]">Frontdesk Staff</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Focused on day-to-day frontdesk reception, quick billing, waiting room, and patient check-ins.
            </p>
            <ul className="text-xs space-y-1.5 text-[var(--color-text)] border-t border-[var(--color-border)] pt-3">
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Quick Bill & Invoices generation</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Book Appointments & Doctor Slots</li>
              <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Waiting Room queue management</li>
              <li className="flex items-center gap-2 text-[var(--color-text-muted)]"><X size={13} className="text-rose-400" /> No access to Financial Analytics</li>
            </ul>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-400" />
                  Edit Role & Permissions
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">{editingMember.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">{editingMember.email}</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'STAFF' as const, label: 'Frontdesk Staff', desc: 'Appointments, Quick Bill, Patient Files, Waiting Room' },
                  { id: 'MANAGER' as const, label: 'Clinic Manager', desc: 'Operations, CRM, Staff Calendar, Delays' },
                  { id: 'ADMIN' as const, label: 'Admin (Full Access)', desc: 'Everything including Revenue, AI Settings, Team' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleUpdateRole(editingMember.id, r.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3",
                      editingMember.role === r.id
                        ? "bg-blue-500/10 border-blue-500/40 text-[var(--color-text)] shadow-sm"
                        : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-blue-500/30"
                    )}
                  >
                    <span className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5", editingMember.role === r.id ? "border-blue-500 bg-blue-500 text-white" : "border-[var(--color-border)]")}>
                      {editingMember.role === r.id && <Check size={10} />}
                    </span>
                    <div>
                      <span className="font-bold block text-[var(--color-text)]">{r.label}</span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">{r.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-400" />
                  Invite Team Member
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>

              {inviteSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-bold text-sm text-[var(--color-text)]">Invitation Sent!</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Access link sent to {inviteEmail}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Employee Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Verma"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="staff@glowclinic.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-2">Assign Role & Dashboard Access</label>
                    <div className="space-y-2">
                      {[
                        { id: 'STAFF' as const, label: 'Frontdesk Staff', desc: 'Appointments, Quick Bill, Patient Files, Waiting Room' },
                        { id: 'MANAGER' as const, label: 'Clinic Manager', desc: 'Operations, CRM, Staff Calendar, Delays' },
                        { id: 'ADMIN' as const, label: 'Admin (Full Access)', desc: 'Everything including Revenue, AI Settings, Team' },
                      ].map((r) => (
                        <label
                          key={r.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all",
                            inviteRole === r.id
                              ? "bg-blue-500/10 border-blue-500/40 text-[var(--color-text)]"
                              : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                          )}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={r.id}
                            checked={inviteRole === r.id}
                            onChange={() => setInviteRole(r.id)}
                            className="mt-0.5 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-bold block text-[var(--color-text)]">{r.label}</span>
                            <span className="text-[11px] text-[var(--color-text-muted)]">{r.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

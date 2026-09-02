'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Filter, 
  Sliders, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Cpu, 
  Mic2, 
  PhoneCall, 
  HardDrive, 
  ShieldAlert, 
  UserCheck, 
  Sparkles,
  Save,
  Eye,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminStore, AdminTenant } from '@/lib/superadmin-store';
import { toast } from 'sonner';

export default function SuperAdminTenantsPage() {
  const router = useRouter();
  const { tenants, voices, llmModels, updateTenant, deleteTenant, impersonateTenant } = useSuperAdminStore();
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [editingTenant, setEditingTenant] = useState<AdminTenant | null>(null);

  const niches = ['All', 'Clinic', 'Real Estate', 'Dental', 'Hotel', 'Coaching', 'Fintech', 'Dealership', 'FMCG'];

  const filteredTenants = tenants.filter((t: any) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.industry.toLowerCase().includes(search.toLowerCase());
    const matchesNiche = selectedNiche === 'All' || t.industry.toLowerCase().includes(selectedNiche.toLowerCase());
    return matchesSearch && matchesNiche;
  });

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    updateTenant(editingTenant.id, editingTenant);
    toast.success(`Updated ${editingTenant.name} settings successfully!`);
    setEditingTenant(null);
  };

  const handleGhostMode = (tenant: AdminTenant) => {
    impersonateTenant(tenant.id);
    toast.success(`Ghost Mode Activated: Impersonating ${tenant.name}`, {
      description: 'You are now viewing the client dashboard live with their specific settings.'
    });
    router.push(`/?ghost=${tenant.id}`);
  };

  const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-rose-500" />
            <span>Multi-Tenant Client Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure LLM assignment, voice permissions, and usage limits per client. Changes reflect instantly on client dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0D111D] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {niches.map(niche => (
          <button
            key={niche}
            onClick={() => setSelectedNiche(niche)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap',
              selectedNiche === niche 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25' 
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            )}
          >
            {niche}
          </button>
        ))}
      </div>

      {/* Tenants Table */}
      <div className="rounded-2xl bg-[#0D111D] border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Client Name</th>
                <th className="px-5 py-4">Industry</th>
                <th className="px-5 py-4">Plan & MRR</th>
                <th className="px-5 py-4">Assigned LLM</th>
                <th className="px-5 py-4">Voice Personas</th>
                <th className="px-5 py-4">Voice Minutes Burn</th>
                <th className="px-5 py-4">DB Chunks</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredTenants.map((t: any) => {
                const assignedLlm = llmModels.find((m: any) => m.id === t.assignedLlmId);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white">
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">/{t.slug}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{t.industry}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-emerald-400">{formatINR(t.mrr)}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{t.plan} Plan</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-purple-300 text-[11px] bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                        {assignedLlm?.name.split(' ')[0] || 'GPT-4o'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-blue-300 text-[11px] bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                        {t.allowedVoiceIds.length} Voices Active
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      <div>{t.voiceMinutesUsed} / {t.voiceMinutesLimit} mins</div>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (t.voiceMinutesUsed / t.voiceMinutesLimit) * 100)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {t.ragChunksCount} chunks
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGhostMode(t)}
                          title="Impersonate & View Client Dashboard"
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold border border-rose-500/30 transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-rose-400" />
                          <span>Ghost Mode</span>
                        </button>
                        <button
                          onClick={() => setEditingTenant(t)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all inline-flex items-center gap-1.5"
                        >
                          <Sliders className="w-3.5 h-3.5 text-slate-300" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Tenant Drawer/Modal */}
      <AnimatePresence>
        {editingTenant && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0D111D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-500" />
                    <span>Control Panel: {editingTenant.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Customize LLM brain, voice access, and billing limits</p>
                </div>
                <button onClick={() => setEditingTenant(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTenant} className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Plan & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Subscription Tier</label>
                    <select
                      value={editingTenant.plan}
                      onChange={(e) => setEditingTenant({ ...editingTenant, plan: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Starter">Starter (₹3,999/mo)</option>
                      <option value="Growth">Growth Pro (₹7,499/mo)</option>
                      <option value="Enterprise">Enterprise VIP (₹14,999/mo)</option>
                      <option value="Trial">Trial Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Account Status</label>
                    <select
                      value={editingTenant.status}
                      onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Past Due">Past Due</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Primary LLM Router */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Assigned Primary LLM Engine</span>
                    <span className="text-[10px] text-purple-400 font-mono">Controls client voice brain</span>
                  </label>
                  <select
                    value={editingTenant.assignedLlmId}
                    onChange={(e) => setEditingTenant({ ...editingTenant, assignedLlmId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    {llmModels.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider.toUpperCase()}) — ${m.costPer1kInput}/1k tokens
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Fallback LLM Router */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Assigned Secondary LLM Engine (Fallback)</span>
                    <span className="text-[10px] text-amber-400 font-mono">Used if primary fails</span>
                  </label>
                  <select
                    value={editingTenant.assignedFallbackLlmId || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, assignedFallbackLlmId: e.target.value || undefined })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- No Fallback --</option>
                    {llmModels.filter((m: any) => m.id !== editingTenant.assignedLlmId).map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.provider.toUpperCase()}) — ${m.costPer1kInput}/1k tokens
                      </option>
                    ))}
                  </select>
                </div>

                {/* Allowed Voice Personas Checkboxes */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-2 block">
                    Allowed Voice Personas (What appears in client Voice AI settings)
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    {voices.map((v: any) => {
                      const isAllowed = editingTenant.allowedVoiceIds.includes(v.id);
                      return (
                        <label 
                          key={v.id} 
                          className={cn(
                            'p-2.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-all',
                            isAllowed ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                          )}
                        >
                          <input 
                            type="checkbox"
                            checked={isAllowed}
                            onChange={(e) => {
                              const newVoices = e.target.checked 
                                ? [...editingTenant.allowedVoiceIds, v.id]
                                : editingTenant.allowedVoiceIds.filter((id: string) => id !== v.id);
                              setEditingTenant({ ...editingTenant, allowedVoiceIds: newVoices });
                            }}
                            className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                          />
                          <div className="overflow-hidden">
                            <div className="font-semibold text-[11px] truncate">{v.name}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{v.provider} • {v.accent}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Monthly Voice Minutes Limit</label>
                    <input 
                      type="number"
                      value={editingTenant.voiceMinutesLimit}
                      onChange={(e) => setEditingTenant({ ...editingTenant, voiceMinutesLimit: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">WhatsApp Messages Limit</label>
                    <input 
                      type="number"
                      value={editingTenant.whatsappMessagesLimit}
                      onChange={(e) => setEditingTenant({ ...editingTenant, whatsappMessagesLimit: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const t = editingTenant;
                      setEditingTenant(null);
                      handleGhostMode(t);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-4 h-4 text-rose-400" />
                    <span>Launch Ghost Mode</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setEditingTenant(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/30"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Apply to Client</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

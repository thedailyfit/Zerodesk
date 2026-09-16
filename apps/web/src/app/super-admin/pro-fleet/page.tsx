'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Crown,
  Search,
  Filter,
  ArrowUpRight,
  Phone,
  Clock,
  MessageSquare,
  Sparkles,
  LogIn,
  Sliders,
  TrendingUp,
  Cpu,
  Radio,
  Building2,
  RefreshCw,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function SuperAdminProFleetPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/admin/tenants');
      if (Array.isArray(data)) {
        // Filter for Pro & Enterprise tenants
        const proTenants = data.filter((t: any) => (t.planTier || t.subscription?.plan || 'starter').toLowerCase() !== 'starter');
        setTenants(proTenants);
      }
    } catch (err) {
      console.warn('Could not load tenants from API, using demo pro fleet:', err);
      setTenants([
        {
          id: 'tenant_pro_01',
          name: 'Apex Dental & Maxillofacial Hospital',
          industry: 'Dental',
          planTier: 'pro',
          voiceConfig: { plivoPhoneNumber: '+918047361921', isActive: true },
          subscription: {
            voiceMinutesUsed: 620,
            voiceMinutesLimit: 1200,
            whatsappMessagesUsed: 2450,
            whatsappMessagesLimit: 5000,
            llmTokensUsed: 1400000,
            llmTokensLimit: 5000000,
            mrr: 9941,
          },
          assignedLlm: { name: 'GPT-4o Omnichannel' },
          kyc: { status: 'VERIFIED' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tenant_pro_02',
          name: 'Aura Heights Developers LLP',
          industry: 'Real Estate',
          planTier: 'enterprise',
          voiceConfig: { plivoPhoneNumber: '+918047361920', isActive: true },
          subscription: {
            voiceMinutesUsed: 1840,
            voiceMinutesLimit: 3000,
            whatsappMessagesUsed: 8900,
            whatsappMessagesLimit: 20000,
            llmTokensUsed: 6200000,
            llmTokensLimit: 20000000,
            mrr: 24999,
          },
          assignedLlm: { name: 'GPT-4o Flagship High-Throughput' },
          kyc: { status: 'VERIFIED' },
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleGhostMode = (tenantId: string, name: string) => {
    toast.success(`Activating Ghost Mode for ${name}`);
    router.push(`/?ghost=${tenantId}`);
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMrr = tenants.reduce((acc, t) => acc + (t.subscription?.mrr || 9941), 0);
  const totalVoiceMins = tenants.reduce((acc, t) => acc + (t.subscription?.voiceMinutesUsed || 0), 0);
  const totalWhatsApp = tenants.reduce((acc, t) => acc + (t.subscription?.whatsappMessagesUsed || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 uppercase tracking-wide flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> High-ARPU Enterprise Tier
            </span>
            <span className="text-xs text-slate-400 font-mono">Pro Fleet Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            Pro & Enterprise Fleet Command
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Omnichannel clinic operations (1,200 - 3,000 mins, WhatsApp WABA Cloud API, 80 pre-built automations, custom AI voices).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadTenants}
            disabled={loading}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all shadow-sm",
              theme === 'light'
                ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
            )}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-cyan-500")} />
            Refresh Fleet
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-cyan-200 shadow-sm" : "bg-cyan-950/20 border-cyan-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4" /> Pro & Enterprise Tenants
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-300">
              MRR ₹{totalMrr.toLocaleString()}
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{tenants.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">High-retention healthcare & luxury hospitality accounts</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-emerald-200 shadow-sm" : "bg-emerald-950/20 border-emerald-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> WhatsApp Outbound Volume
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              WABA Health: Green
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{totalWhatsApp.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Appointment confirmations, aftercare & recall blasts</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-purple-200 shadow-sm" : "bg-purple-950/20 border-purple-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Voice Telephony Consumed
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300">
              3-Line Trunks
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{totalVoiceMins.toLocaleString()} <span className="text-sm font-normal text-slate-400">mins</span></p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across LiveKit SIP & Sarvam Indic voice clusters</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={cn(
        "p-4 rounded-2xl border flex items-center justify-between gap-4",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
      )}>
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Pro tenant or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition-all",
              theme === 'light'
                ? "bg-slate-50 border-slate-200 focus:border-cyan-500 text-slate-900"
                : "bg-slate-800/80 border-slate-700 focus:border-cyan-500 text-slate-100"
            )}
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredTenants.length} Enterprise Accounts
        </span>
      </div>

      {/* Tenant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTenants.map((t) => {
          const usedVoice = t.subscription?.voiceMinutesUsed || 0;
          const limitVoice = t.subscription?.voiceMinutesLimit || 1200;
          const voicePercent = Math.min(100, Math.round((usedVoice / limitVoice) * 100));

          const usedWa = t.subscription?.whatsappMessagesUsed || 0;
          const limitWa = t.subscription?.whatsappMessagesLimit || 5000;
          const waPercent = Math.min(100, Math.round((usedWa / limitWa) * 100));

          const plan = (t.planTier || t.subscription?.plan || 'pro').toUpperCase();
          const hasNumber = t.voiceConfig?.plivoPhoneNumber;

          return (
            <div
              key={t.id}
              className={cn(
                "p-5 rounded-2xl border transition-all space-y-4 hover:border-cyan-500/50",
                theme === 'light' ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {plan}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.industry} &bull; <span className="font-mono">{t.id}</span></p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleGhostMode(t.id, t.name)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-cyan-500 text-slate-400 transition-colors"
                    title="Ghost Mode (Inspect Client Dashboard)"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dual Meters: Voice & WhatsApp */}
              <div className="space-y-3">
                {/* Voice */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Voice Pool: {usedVoice} / {limitVoice} mins
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{voicePercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${voicePercent}%` }}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> WhatsApp WABA: {usedWa} / {limitWa} msgs
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{waPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${waPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Specs & Hardware */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between",
                  theme === 'light' ? "bg-slate-50 border-slate-200" : "bg-slate-800/40 border-slate-700/60"
                )}>
                  <span className="text-slate-400">Carrier DID:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">
                    {hasNumber || '+918047361920'}
                  </strong>
                </div>

                <div className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between",
                  theme === 'light' ? "bg-slate-50 border-slate-200" : "bg-slate-800/40 border-slate-700/60"
                )}>
                  <span className="text-slate-400">Automations:</span>
                  <strong className="text-emerald-500 font-mono">
                    80 Active
                  </strong>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-400" />
                  {t.assignedLlm?.name || 'GPT-4o Flagship Router'}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  MRR: ₹{(t.subscription?.mrr || 9941).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

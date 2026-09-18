'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Zap,
  Search,
  Filter,
  ArrowUpRight,
  Phone,
  Clock,
  ShieldAlert,
  CheckCircle,
  LogIn,
  Sliders,
  TrendingUp,
  Sparkles,
  Building2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function SuperAdminStarterFleetPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await apiClient<any[]>('/admin/tenants');
      if (Array.isArray(data)) {
        // Filter for starter tenants
        const starters = data.filter((t: any) => (t.planTier || t.subscription?.plan || 'starter').toLowerCase() === 'starter');
        setTenants(starters);
      }
    } catch (err) {
      console.warn('Could not load tenants from API:', err);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleUpgradeToPro = async (tenantId: string, tenantName: string) => {
    setIsUpgrading(tenantId);
    try {
      await apiClient(`/admin/tenants/${tenantId}/plan`, {
        method: 'PUT',
        body: JSON.stringify({ planTier: 'pro' }),
      });
      toast.success(`Successfully upgraded ${tenantName} to Pro Plan!`, {
        description: 'Quota expanded to 1,200 voice mins, WhatsApp bot unlocked, and 3 lines enabled.',
      });
      await loadTenants();
    } catch (err: any) {
      toast.error('Upgrade failed', { description: err.message });
    } finally {
      setIsUpgrading(null);
    }
  };

  const handleGhostMode = (tenantId: string, name: string) => {
    toast.success(`Activating Ghost Mode for ${name}`);
    router.push(`/?ghost=${tenantId}`);
  };

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const totalMinutesUsed = tenants.reduce((acc, t) => acc + (t.subscription?.voiceMinutesUsed || 0), 0);
  const totalMinutesPool = tenants.length * 300;
  const highUsageCount = tenants.filter(t => (t.subscription?.voiceMinutesUsed || 0) >= 240).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> SMB Tier Management
            </span>
            <span className="text-xs text-slate-400 font-mono">Starter Fleet Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            Starter Plan Command Fleet
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage single-line AI receptionists (300 mins quota, ₹2,999/mo). Monitor consumption surges and trigger 1-click upgrades to Pro.
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
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-amber-500")} />
            Refresh Fleet
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-amber-200 shadow-sm" : "bg-amber-950/20 border-amber-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Active Starter Tenants
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
              ₹2,999/mo
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{tenants.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Single-DID AI receptionist clinics & salons</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-blue-200 shadow-sm" : "bg-blue-950/20 border-blue-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Aggregated Fuel Gauge
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">
              300 min/mo
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">
            {totalMinutesUsed} / {totalMinutesPool || 300} <span className="text-sm font-normal text-slate-400">mins</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Fleet-wide telephony consumption</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-rose-200 shadow-sm" : "bg-rose-950/20 border-rose-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> High-Surge (Pro Candidates)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300">
              &gt;80% Limit
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{highUsageCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Approaching 300-min cap, ready for Pro upsell</p>
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
            placeholder="Search Starter tenant or niche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition-all",
              theme === 'light'
                ? "bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900"
                : "bg-slate-800/80 border-slate-700 focus:border-amber-500 text-slate-100"
            )}
          />
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredTenants.length} SMBs
        </span>
      </div>

      {/* Tenant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTenants.map((t) => {
          const used = t.subscription?.voiceMinutesUsed || 0;
          const limit = t.subscription?.voiceMinutesLimit || 300;
          const percentage = Math.min(100, Math.round((used / limit) * 100));
          const hasNumber = t.voiceConfig?.plivoPhoneNumber;
          const isKycVerified = t.kyc?.status === 'VERIFIED';

          return (
            <div
              key={t.id}
              className={cn(
                "p-5 rounded-2xl border transition-all space-y-4 hover:border-amber-500/50",
                theme === 'light' ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      STARTER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.industry} &bull; <span className="font-mono">{t.id}</span></p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleGhostMode(t.id, t.name)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-amber-500 text-slate-400 transition-colors"
                    title="Ghost Mode (Inspect Client Dashboard)"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Fuel Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Call Minutes
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {used} / {limit} mins ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      percentage > 80 ? "bg-rose-500" : percentage > 50 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between",
                  theme === 'light' ? "bg-slate-50 border-slate-200" : "bg-slate-800/40 border-slate-700/60"
                )}>
                  <span className="text-slate-400">PSTN DID:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">
                    {hasNumber || 'Pending'}
                  </strong>
                </div>

                <div className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between",
                  theme === 'light' ? "bg-slate-50 border-slate-200" : "bg-slate-800/40 border-slate-700/60"
                )}>
                  <span className="text-slate-400">KYC Status:</span>
                  <strong className={cn(
                    "text-[11px] font-bold",
                    isKycVerified ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {t.kyc?.status || 'PENDING'}
                  </strong>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  MRR: ₹2,999/mo &bull; Single-DID Receptionist
                </span>
                <button
                  onClick={() => handleUpgradeToPro(t.id, t.name)}
                  disabled={isUpgrading === t.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isUpgrading === t.id ? 'Upgrading...' : '1-Click Upgrade to Pro'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenants.length === 0 && !loading && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center">
          <Building2 className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Starter Businesses Found</p>
          <p className="text-xs text-slate-500 mt-0.5">There are currently no active starter-tier businesses matching your filter.</p>
        </div>
      )}
    </div>
  );
}

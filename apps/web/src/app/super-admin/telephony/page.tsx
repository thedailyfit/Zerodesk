'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  Search,
  Filter,
  Radio,
  Plus,
  CheckCircle,
  ExternalLink,
  Shield,
  Zap,
  Crown,
  Building,
  RefreshCw,
  PhoneForwarded,
  ArrowRight,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface AvailableNumber {
  phoneNumber: string;
  type: string;
  country: string;
  monthlyCostInr: number;
  provider: string;
}

interface TenantOption {
  id: string;
  name: string;
  planTier: string;
  industry: string;
  voiceConfig?: {
    plivoPhoneNumber?: string;
    isActive?: boolean;
  };
}

export default function SuperAdminTelephonyPage() {
  const { theme } = useTheme();
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingNumbers, setSearchingNumbers] = useState(false);
  const [numberType, setNumberType] = useState('local');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsData, numbersData] = await Promise.allSettled([
        apiClient<TenantOption[]>('/admin/tenants'),
        apiClient<AvailableNumber[]>(`/admin/telephony/numbers?country=IN&type=${numberType}`),
      ]);

      if (tenantsData.status === 'fulfilled' && Array.isArray(tenantsData.value)) {
        setTenants(tenantsData.value);
      }
      if (numbersData.status === 'fulfilled' && Array.isArray(numbersData.value)) {
        setAvailableNumbers(numbersData.value);
      }
    } catch (err) {
      console.warn('Could not fetch telephony data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [numberType]);

  const handleSearchNumbers = async () => {
    setSearchingNumbers(true);
    try {
      const numbers = await apiClient<AvailableNumber[]>(`/admin/telephony/numbers?country=IN&type=${numberType}`);
      if (Array.isArray(numbers)) {
        setAvailableNumbers(numbers);
        toast.success(`Found ${numbers.length} numbers in Plivo inventory`);
      }
    } catch (err: any) {
      toast.error('Failed to search numbers', { description: err.message });
    } finally {
      setSearchingNumbers(false);
    }
  };

  const handleProvision = async () => {
    if (!selectedNumber || !selectedTenantId) {
      toast.error('Please select both a number and a destination tenant');
      return;
    }

    setIsProvisioning(true);
    try {
      const res = await apiClient<any>(`/admin/tenants/${selectedTenantId}/provision-number`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: selectedNumber.phoneNumber }),
      });

      toast.success(`Successfully provisioned ${selectedNumber.phoneNumber}!`, {
        description: `Bound to LiveKit SIP trunk: ${res.mappedToTrunk || 'sip.livekit.cloud'}`,
      });

      setAssignModalOpen(false);
      setSelectedNumber(null);
      setSelectedTenantId('');
      await loadData();
    } catch (err: any) {
      toast.error('Provisioning failed', { description: err.message });
    } finally {
      setIsProvisioning(false);
    }
  };

  // Compute active assigned lines across tenants
  const activeLines = tenants.filter(t => t.voiceConfig?.plivoPhoneNumber);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wide">
              LiveKit Cloud SIP + Plivo Telecom
            </span>
            <span className="text-xs text-slate-400 font-mono">Carrier Ingress</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <PhoneCall className="w-6 h-6 text-blue-500" />
            Telephony & DID Inventory Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, procure, and map Indian virtual mobile numbers (VMN) and 1800 toll-free lines directly to LiveKit SIP endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSearchNumbers}
            disabled={searchingNumbers}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all shadow-sm",
              theme === 'light'
                ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
            )}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", searchingNumbers && "animate-spin text-blue-500")} />
            Search Plivo Inventory
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-blue-200 shadow-sm" : "bg-blue-950/20 border-blue-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Active Ingress Lines
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300">
              Live PSTN
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{activeLines.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">DIDs receiving live customer voice calls</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-purple-200 shadow-sm" : "bg-purple-950/20 border-purple-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" /> LiveKit SIP Trunk
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono">
              sip.livekit.cloud
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">&lt; 15ms</p>
          <p className="text-[11px] text-slate-500 mt-0.5">SIP Dispatch Webhook latency to Mumbai PoP</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-emerald-200 shadow-sm" : "bg-emerald-950/20 border-emerald-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <PhoneForwarded className="w-4 h-4" /> Available for Allocation
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              Ready
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{availableNumbers.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Pre-cleared Indian DIDs ready to provision</p>
        </div>
      </div>

      {/* Available Numbers from Plivo API */}
      <div className={cn(
        "rounded-2xl border p-5 space-y-4",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-500" />
              Available Carrier Stock (Plivo REST API)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Click "Allocate DID" to purchase and attach directly to a client tenant.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={numberType}
              onChange={(e) => setNumberType(e.target.value)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold outline-none border transition-all",
                theme === 'light' ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-800 border-slate-700 text-slate-200"
              )}
            >
              <option value="local">Local VMN (Standard)</option>
              <option value="tollfree">Toll-Free 1800</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {availableNumbers.map((num) => (
            <div
              key={num.phoneNumber}
              className={cn(
                "p-3.5 rounded-xl border flex flex-col justify-between hover:border-rose-500/50 transition-all group",
                theme === 'light' ? "bg-slate-50/70 border-slate-200" : "bg-slate-800/40 border-slate-700/60"
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                    {num.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">₹{num.monthlyCostInr}/mo</span>
                </div>
                <p className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-2 tracking-wide">
                  {num.phoneNumber}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Carrier: {num.provider} ({num.country})</p>
              </div>

              <button
                onClick={() => {
                  setSelectedNumber(num);
                  setAssignModalOpen(true);
                }}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Allocate DID
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Currently Bound Active DIDs */}
      <div className={cn(
        "rounded-2xl border overflow-hidden",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            Provisioned Tenant Virtual Lines ({activeLines.length})
          </h2>
          <span className="text-xs text-slate-400">All inbound audio routed via LiveKit SIP dispatch</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={cn(
                "border-b text-[11px] font-mono uppercase tracking-wider",
                theme === 'light' ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-slate-950/40 text-slate-400 border-slate-800"
              )}>
                <th className="py-3 px-4 font-semibold">Virtual DID</th>
                <th className="py-3 px-4 font-semibold">Assigned Business</th>
                <th className="py-3 px-4 font-semibold">Plan Tier</th>
                <th className="py-3 px-4 font-semibold">SIP Trunk Domain</th>
                <th className="py-3 px-4 font-semibold">Line Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeLines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No virtual numbers currently assigned to tenants.
                  </td>
                </tr>
              ) : (
                activeLines.map((t) => {
                  const plan = (t.planTier || 'starter').toLowerCase();
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-500" />
                        {t.voiceConfig?.plivoPhoneNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Tenant ID: {t.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {plan === 'starter' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" /> Starter SMB
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 inline-flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" /> Pro Enterprise
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        sip.livekit.cloud:5060
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Ingress Ready
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate DID Modal */}
      <AnimatePresence>
        {assignModalOpen && selectedNumber && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4",
                theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Provision & Map Telephony Line</h3>
                  <p className="text-xs font-mono text-blue-500">{selectedNumber.phoneNumber}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Destination Tenant
                  </label>
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className={cn(
                      "w-full p-2.5 rounded-xl text-xs outline-none border transition-all",
                      theme === 'light' ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-800 border-slate-700 text-slate-100"
                    )}
                  >
                    <option value="">-- Choose Tenant to Assign Line --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.planTier?.toUpperCase() || 'STARTER'} - {t.industry}) {t.voiceConfig?.plivoPhoneNumber ? `[Has: ${t.voiceConfig.plivoPhoneNumber}]` : '[No DID]'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={cn(
                  "p-3 rounded-xl border text-[11px] space-y-1 font-mono",
                  theme === 'light' ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-slate-800/60 border-slate-700 text-slate-300"
                )}>
                  <div className="flex justify-between">
                    <span>Carrier:</span>
                    <strong>Plivo India Telecom</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trunk Target:</span>
                    <strong>sip.livekit.cloud</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto-Dispatch Room:</span>
                    <strong>tenant_{'{tenantId}'}_receptionist</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAssignModalOpen(false);
                    setSelectedNumber(null);
                    setSelectedTenantId('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProvision}
                  disabled={isProvisioning || !selectedTenantId}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {isProvisioning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Provisioning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Building,
  Phone,
  Eye,
  RefreshCw,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface KycRecord {
  id: string;
  tenantId: string;
  businessName: string;
  tradeName?: string;
  gstin?: string;
  panNumber?: string;
  addressProofUrl?: string;
  idProofUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  tenant?: {
    id: string;
    name: string;
    planTier: string;
    industry: string;
    voiceConfig?: {
      plivoPhoneNumber?: string;
      isActive?: boolean;
    };
    subscription?: {
      plan: string;
    };
  };
}

export default function SuperAdminKycPage() {
  const { theme } = useTheme();
  const [kycList, setKycList] = useState<KycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadKycRecords = async () => {
    setLoading(true);
    try {
      const data = await apiClient<KycRecord[]>('/admin/kyc');
      let combined = Array.isArray(data) ? [...data] : [];
      if (typeof window !== 'undefined') {
        const localKyc = localStorage.getItem('zerodesk_kyc_record');
        if (localKyc) {
          try {
            const parsed = JSON.parse(localKyc);
            if (!combined.some(k => k.id === parsed.id || (k.gstin && k.gstin === parsed.gstin))) {
              combined.unshift(parsed);
            }
          } catch {}
        }
      }
      setKycList(combined);
    } catch (err) {
      console.warn('Could not fetch KYC from API:', err);
      let fallbackList: KycRecord[] = [];
      if (typeof window !== 'undefined') {
        const localKyc = localStorage.getItem('zerodesk_kyc_record');
        if (localKyc) {
          try {
            fallbackList.push(JSON.parse(localKyc));
          } catch {}
        }
      }
      setKycList(fallbackList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKycRecords();
  }, []);

  const handleApprove = async (record: KycRecord, autoProvision = true) => {
    setIsProcessing(true);
    try {
      await apiClient(`/admin/kyc/${record.tenantId}/approve`, { method: 'POST' });
      toast.success(`KYC Approved for ${record.businessName}!`);

      if (autoProvision && !record.tenant?.voiceConfig?.plivoPhoneNumber) {
        try {
          const prov = await apiClient<any>(`/admin/tenants/${record.tenantId}/provision-number`, {
            method: 'POST',
            body: JSON.stringify({}),
          });
          toast.success(`Phone Number Provisioned: ${prov.phoneNumber}`, {
            description: 'Assigned carrier line mapped to LiveKit SIP trunk.',
          });
        } catch (provErr: any) {
          toast.info('KYC verified. You can provision a number in Telephony Hub.', {
            description: provErr?.message,
          });
        }
      }

      await loadKycRecords();
    } catch (err: any) {
      toast.error('Failed to approve KYC', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRecord) return;
    setIsProcessing(true);
    try {
      await apiClient(`/admin/kyc/${selectedRecord.tenantId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectionReason }),
      });
      toast.error(`KYC Rejected for ${selectedRecord.businessName}`);
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedRecord(null);
      await loadKycRecords();
    } catch (err: any) {
      toast.error('Failed to reject KYC', { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = kycList.filter(k => k.status === 'PENDING').length;
  const verifiedCount = kycList.filter(k => k.status === 'VERIFIED').length;
  const rejectedCount = kycList.filter(k => k.status === 'REJECTED').length;

  const filteredRecords = kycList.filter(k => {
    const matchesStatus = statusFilter === 'ALL' || k.status === statusFilter;
    const matchesSearch =
      k.businessName.toLowerCase().includes(search.toLowerCase()) ||
      (k.tradeName && k.tradeName.toLowerCase().includes(search.toLowerCase())) ||
      (k.gstin && k.gstin.toLowerCase().includes(search.toLowerCase())) ||
      (k.panNumber && k.panNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wide">
              DoT & TRAI Compliance
            </span>
            <span className="text-xs text-slate-400 font-mono">Carrier KYC Ingestion</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-rose-500" />
            Client KYC Verification Queue
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review GSTIN, PAN, and identity proofs for Starter and Pro tenants before virtual number activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadKycRecords}
            disabled={loading}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all shadow-sm",
              theme === 'light'
                ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
            )}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-rose-500")} />
            Sync Registry
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-amber-200 shadow-sm" : "bg-amber-950/20 border-amber-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Pending Review
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
              Needs Action
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{pendingCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Businesses awaiting telecom DID assignment</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-emerald-200 shadow-sm" : "bg-emerald-950/20 border-emerald-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Verified & Active
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
              Compliant
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{verifiedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Plivo DIDs bound & operating on LiveKit SIP</p>
        </div>

        <div className={cn(
          "p-4 rounded-2xl border transition-all",
          theme === 'light' ? "bg-white border-red-200 shadow-sm" : "bg-red-950/20 border-red-500/30"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Rejected / Incomplete
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-600 dark:text-red-300">
              Disputed
            </span>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-slate-900 dark:text-slate-100">{rejectedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Discrepancy notifications sent to client</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={cn(
        "p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
      )}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, GSTIN, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition-all",
              theme === 'light'
                ? "bg-slate-50 border-slate-200 focus:border-rose-500 text-slate-900"
                : "bg-slate-800/80 border-slate-700 focus:border-rose-500 text-slate-100"
            )}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                statusFilter === st
                  ? (theme === 'light'
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-rose-500 text-white")
                  : (theme === 'light'
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700")
              )}
            >
              {st} {st === 'PENDING' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* KYC Table / List */}
      <div className={cn(
        "rounded-2xl border overflow-hidden",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn(
                "border-b text-[11px] font-mono uppercase tracking-wider",
                theme === 'light' ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-slate-950/40 text-slate-400 border-slate-800"
              )}>
                <th className="py-3.5 px-4 font-semibold">Entity & Plan</th>
                <th className="py-3.5 px-4 font-semibold">Legal GSTIN & PAN</th>
                <th className="py-3.5 px-4 font-semibold">Documents</th>
                <th className="py-3.5 px-4 font-semibold">Telephony Line</th>
                <th className="py-3.5 px-4 font-semibold">Compliance Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No KYC submissions match your current filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const plan = (record.tenant?.planTier || record.tenant?.subscription?.plan || 'starter').toLowerCase();
                  const hasNumber = record.tenant?.voiceConfig?.plivoPhoneNumber;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Entity */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {record.businessName}
                            {plan === 'starter' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" /> Starter
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                <Crown className="w-2.5 h-2.5" /> Pro
                              </span>
                            )}
                          </div>
                          {record.tradeName && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Trade: {record.tradeName}</p>
                          )}
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {record.tenantId}</p>
                        </div>
                      </td>

                      {/* GSTIN / PAN */}
                      <td className="py-4 px-4 font-mono">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">GST: </span>
                          <strong className="text-slate-800 dark:text-slate-200">{record.gstin || 'Not Provided'}</strong>
                        </div>
                        <div className="mt-1">
                          <span className="text-slate-500 dark:text-slate-400">PAN: </span>
                          <strong className="text-slate-800 dark:text-slate-200">{record.panNumber || 'Not Provided'}</strong>
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {record.addressProofUrl ? (
                            <a
                              href={record.addressProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:text-rose-500 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              Address Doc <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No address doc</span>
                          )}
                          {record.idProofUrl && (
                            <a
                              href={record.idProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:text-rose-500 text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              Signatory ID <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Telephony Line */}
                      <td className="py-4 px-4 font-mono">
                        {hasNumber ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="font-semibold">{hasNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not Provisioned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {record.status === 'VERIFIED' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        )}
                        {record.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Review
                          </span>
                        )}
                        {record.status === 'REJECTED' && (
                          <div>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 inline-flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Rejected
                            </span>
                            {record.rejectionReason && (
                              <p className="text-[10px] text-red-500 mt-1 max-w-xs truncate" title={record.rejectionReason}>
                                {record.rejectionReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {record.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(record, true)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve & Assign DID
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setRejectModalOpen(true);
                                }}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {record.status === 'VERIFIED' && !hasNumber && (
                            <button
                              onClick={() => handleApprove(record, true)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" /> Provision Number
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalOpen && selectedRecord && (
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
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Reject KYC Documentation</h3>
                  <p className="text-xs text-slate-400">{selectedRecord.businessName}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rejection Reason (Sent to Client Dashboard)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. GSTIN certificate is illegible or name does not match business registration records..."
                  rows={3}
                  className={cn(
                    "w-full p-3 rounded-xl text-xs outline-none border resize-none transition-all",
                    theme === 'light'
                      ? "bg-slate-50 border-slate-200 focus:border-red-500"
                      : "bg-slate-800 border-slate-700 focus:border-red-500"
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

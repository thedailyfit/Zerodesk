'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  HardDrive, 
  Database, 
  Activity, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  Radio
} from 'lucide-react';
import { useSuperAdminStore } from '@/lib/superadmin-store';

export default function SuperAdminInfrastructurePage() {
  const { tenants } = useSuperAdminStore();

  const services: any[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Server className="w-6 h-6 text-rose-500" />
          <span>Infrastructure & RAG Vector Storage</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor vector embeddings, BullMQ background workers, and real-time WebRTC audio ingress performance.
        </p>
      </div>

      {/* Services Health Grid */}
            <div className="p-12 text-center rounded-2xl bg-[#0D111D] border border-slate-800 shadow-lg">
        <Activity className="w-12 h-12 mx-auto text-slate-700 mb-3" />
        <h3 className="font-bold text-white mb-1">No Monitoring Data</h3>
        <p className="text-slate-400 text-sm">Connect to a monitoring service like Datadog or Prometheus for live metrics.</p>
      </div>

      {/* Vector Storage Breakdown */}
      <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span>PostgreSQL pgvector Chunk Allocation per Tenant</span>
        </h3>

        <div className="space-y-3">
          {tenants.map((t: any) => {
            const pct = Math.min(100, (t.storageUsedMB / t.storageLimitMB) * 100);
            return (
              <div key={t.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between mb-1.5">
                  <span className="font-semibold text-white">{t.name}</span>
                  <span className="font-mono text-slate-400">{t.ragChunksCount} embeddings ({t.storageUsedMB} MB / {t.storageLimitMB} MB)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

  const services = [
    { name: 'PostgreSQL + pgvector', host: 'Supabase Cloud (AWS Mumbai)', status: 'Healthy', latency: '24ms', load: '18%' },
    { name: 'BullMQ Task Worker', host: 'Railway Cluster (Singapore)', status: 'Healthy', latency: '42ms', load: '31%' },
    { name: 'Redis Cache & Locks', host: 'Upstash Global Serverless', status: 'Healthy', latency: '12ms', load: '8%' },
    { name: 'LiveKit WebRTC Server', host: 'LiveKit Cloud Ingress', status: 'Healthy', latency: '35ms', load: '44%' },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((svc, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-white">{svc.name}</span>
              <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {svc.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">{svc.host}</p>
            <div className="flex justify-between text-xs font-mono text-slate-300 pt-3 border-t border-slate-800/80">
              <span>Latency: <strong className="text-emerald-400">{svc.latency}</strong></span>
              <span>Load: <strong className="text-slate-200">{svc.load}</strong></span>
            </div>
          </div>
        ))}
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

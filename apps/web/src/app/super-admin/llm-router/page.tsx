'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Radio, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  DollarSign, 
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminStore } from '@/lib/superadmin-store';
import { toast } from 'sonner';

export default function SuperAdminLlmRouterPage() {
  const { 
    llmModels, 
    globalFailoverEnabled, 
    fallbackModelId, 
    toggleGlobalFailover, 
    setFallbackModel,
    toggleLlmStatus 
  } = useSuperAdminStore();

  const fallbackModel = llmModels.find((m: any) => m.id === fallbackModelId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-rose-500" />
            <span>LLM Engine Registry & Failover Router</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control which AI models are available to tenants, view token costs, and manage sub-second voice failover switches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              toggleGlobalFailover();
              toast.success(`Global failover is now ${!globalFailoverEnabled ? 'ENABLED' : 'DISABLED'}`);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all',
              globalFailoverEnabled 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            )}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Auto-Failover: {globalFailoverEnabled ? 'ARMED' : 'DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* Global Failover Rule Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0D111D] to-[#121829] border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Active Disaster Recovery Strategy</span>
            </div>
            <h3 className="text-lg font-bold text-white">Sub-Second Dynamic Voice Routing Rule</h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              If any flagship model (e.g. OpenAI GPT-4o) encounters a rate limit (HTTP 429) or latency exceeds 1,200ms, LiveKit audio sessions seamlessly divert to the chosen fallback model without call drops.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 w-full lg:w-72">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Designated Fallback Engine</label>
            <select
              value={fallbackModelId}
              onChange={(e) => {
                setFallbackModel(e.target.value);
                toast.success('Fallback model updated');
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-rose-500"
            >
              {llmModels.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {llmModels.map((model: any) => (
          <motion.div
            key={model.id}
            whileHover={{ y: -2 }}
            className={cn(
              'p-6 rounded-2xl border transition-all flex flex-col justify-between',
              model.isActive 
                ? 'bg-[#0D111D] border-slate-800/80 shadow-lg' 
                : 'bg-slate-950/40 border-slate-900 opacity-60'
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{model.name}</h3>
                    <span className="font-mono text-[10px] text-slate-500">{model.modelId}</span>
                  </div>
                </div>

                <span className={cn(
                  'text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider',
                  model.category === 'flagship' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  model.category === 'fast_voice' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                )}>
                  {model.category.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                {model.description}
              </p>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs text-slate-300 mb-5">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Input / 1k</span>
                  <span className="font-bold text-emerald-400">${model.costPer1kInput}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Output / 1k</span>
                  <span className="font-bold text-blue-400">${model.costPer1kOutput}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Context</span>
                  <span className="font-bold text-slate-200">{(model.contextWindow / 1000)}k</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Tier: <strong className="text-slate-200 uppercase">{model.tierRequirement}</strong>
              </span>

              <button
                onClick={() => toggleLlmStatus(model.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all',
                  model.isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                )}
              >
                {model.isActive ? 'Active Engine' : 'Disabled'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

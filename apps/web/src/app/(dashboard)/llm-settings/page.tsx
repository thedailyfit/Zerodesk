'use client';

import { tenantStorage } from '@/lib/tenant-storage';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Sliders, 
  PhoneCall, 
  MessageSquare, 
  Globe, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Radio, 
  Clock, 
  Settings2,
  CheckCircle2,
  Server,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface LLMOption {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Groq';
  description: string;
  speed: 'Ultra Fast' | 'Fast' | 'Balanced' | 'Deep Reasoner';
  avgLatency: string;
  badgeColor: string;
}

export interface LLMSettingsState {
  primaryModel: string;
  fallbackModel: string;
  fallbackLatencyThresholdMs: number;
  voiceAiEnabled: boolean;
  voiceAiTemperature: number;
  whatsappAiEnabled: boolean;
  whatsappAiTemperature: number;
  websiteAiEnabled: boolean;
  websiteAiTemperature: number;
  autoFailoverAlert: boolean;
}

const DEFAULT_SETTINGS: LLMSettingsState = {
  primaryModel: '',
  fallbackModel: '',
  fallbackLatencyThresholdMs: 800,
  voiceAiEnabled: false,
  voiceAiTemperature: 0.3,
  whatsappAiEnabled: false,
  whatsappAiTemperature: 0.7,
  websiteAiEnabled: false,
  websiteAiTemperature: 0.5,
  autoFailoverAlert: false,
};

export default function LLMSettingsPage() {
  const [models, setModels] = useState<LLMOption[]>([]);
  const PRIMARY_LLM_OPTIONS = models;
  const FALLBACK_LLM_OPTIONS = models;
  const [settings, setSettings] = useState<LLMSettingsState>(DEFAULT_SETTINGS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const [latencyResults, setLatencyResults] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    apiClient<any[]>('/tenants/me/llm-models').then(rows => setModels(rows.map(m => ({ id: m.modelId, name: m.name, provider: m.provider, description: m.description || 'Configured model', speed: 'Balanced', avgLatency: 'Not measured', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/25' })))).catch(() => toast.error('Unable to load model registry'));
    // Fetch from real tenant API
    apiClient<any>('/tenants/me/llm-settings')
      .then((res) => {
        if (res) {
          setSettings(prev => ({ ...prev, ...res }));
        }
      })
      .catch(() => toast.error('Unable to load AI settings'));
  }, []);

  const handleSave = async () => {
    try {
      await apiClient('/tenants/me/llm-settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSaveSuccess(true);
      toast.success('LLM routing configuration saved successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save LLM settings to backend:', err);
      toast.error('Failed to save LLM settings. Only Workspace Admins can modify LLM policies.');
    }
  };

  const handleTestLatency = () => {
    setLatencyResults(null);
    setIsTestingLatency(false);
    toast.info('No live model benchmark is configured. Use recorded trace latency in AI observability.');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl text-purple-400">
              <Cpu size={24} />
            </div>
            LLM Orchestration & Fallback Routing
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs sm:text-sm mt-1">
            Choose your primary AI reasoning engine and low-latency secondary fallback for Voice AI, WhatsApp, and Web Frontdesk.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestLatency}
            disabled={isTestingLatency}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-purple-500/40 text-xs font-semibold text-[var(--color-text)] rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={cn("text-purple-400", isTestingLatency && "animate-spin")} />
            <span>{isTestingLatency ? 'Loading Baselines...' : 'Provider Latency Baselines'}</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            {saveSuccess ? <Check size={15} className="text-emerald-300" /> : <Settings2 size={15} />}
            <span>{saveSuccess ? 'Settings Saved!' : 'Save Orchestration'}</span>
          </button>
        </div>
      </div>

      {/* Latency Health Bar */}
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-text)]">Runtime status: verify in AI observability</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              Chat requests try the configured secondary model if the primary request timeout exceeds <span className="font-mono text-purple-400 font-bold">{settings.fallbackLatencyThresholdMs}ms</span> or a provider error occurs. Voice routing applies on the next call.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--color-text-muted)]">Failover Threshold:</span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-purple-400 font-bold">
            {settings.fallbackLatencyThresholdMs} ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 1: PRIMARY LLM */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                Primary Reasoning LLM
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                The main engine queried first for all inbound interactions.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25">
              Primary Tier
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PRIMARY_LLM_OPTIONS.map((model) => {
              const isSelected = settings.primaryModel === model.id;
              const livePing = latencyResults ? latencyResults[model.id] : null;

              return (
                <div
                  key={model.id}
                  onClick={() => setSettings(prev => ({ ...prev, primaryModel: model.id }))}
                  className={cn(
                    "p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                    isSelected
                      ? "border-purple-500 bg-purple-500/5 shadow-md shadow-purple-500/10 ring-1 ring-purple-500/30"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-purple-500/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--color-text)]">{model.name}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border", model.badgeColor)}>
                        {model.provider}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {livePing ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {livePing}ms
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                          {model.avgLatency}
                        </span>
                      )}

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {model.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: SECONDARY FALLBACK LLM */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Secondary Fallback LLM
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Automatically triggered when primary latency exceeds threshold.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">
              High Availability
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {FALLBACK_LLM_OPTIONS.map((model) => {
              const isSelected = settings.fallbackModel === model.id;
              const livePing = latencyResults ? latencyResults[model.id] : null;

              return (
                <div
                  key={model.id}
                  onClick={() => setSettings(prev => ({ ...prev, fallbackModel: model.id }))}
                  className={cn(
                    "p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group",
                    isSelected
                      ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                      : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-amber-500/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--color-text)]">{model.name}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border", model.badgeColor)}>
                        {model.provider}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {livePing ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          {livePing}ms
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                          {model.avgLatency}
                        </span>
                      )}

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {model.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION 3: GRANULAR TOGGLES PER FEATURE & ROUTING THRESHOLDS */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
            <Sliders size={20} className="text-blue-500" />
            Granular Feature Routing & Latency Governance
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Independently calibrate intelligence engines and temperature parameters per channel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Feature 1: Voice AI Telephony */}
          <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <PhoneCall size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--color-text)]">Voice AI Telephony</h3>
                  <span className="text-[10px] text-[var(--color-text-muted)]">LiveKit SIP Inbound</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.voiceAiEnabled}
                onChange={e => setSettings(prev => ({ ...prev, voiceAiEnabled: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Temperature (Factual):</span>
                <span className="font-mono font-bold text-[var(--color-text)]">{settings.voiceAiTemperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={settings.voiceAiTemperature}
                onChange={e => setSettings(prev => ({ ...prev, voiceAiTemperature: parseFloat(e.target.value) }))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-[var(--color-text-muted)] block">
                Lower temperature prevents hallucinations during phone calls.
              </span>
            </div>
          </div>

          {/* Feature 2: WhatsApp AI Conversations */}
          <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--color-text)]">WhatsApp AI Engine</h3>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Meta Cloud API</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.whatsappAiEnabled}
                onChange={e => setSettings(prev => ({ ...prev, whatsappAiEnabled: e.target.checked }))}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Temperature (Engaging):</span>
                <span className="font-mono font-bold text-[var(--color-text)]">{settings.whatsappAiTemperature}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.whatsappAiTemperature}
                onChange={e => setSettings(prev => ({ ...prev, whatsappAiTemperature: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-[var(--color-text-muted)] block">
                Balanced temperature for empathetic booking and triage dialogues.
              </span>
            </div>
          </div>

          {/* Feature 3: Website AI Frontdesk */}
          <div className="p-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--color-text)]">Website AI Widget</h3>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Web Visitor Leadgen</span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={settings.websiteAiEnabled}
                onChange={e => setSettings(prev => ({ ...prev, websiteAiEnabled: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Temperature:</span>
                <span className="font-mono font-bold text-[var(--color-text)]">{settings.websiteAiTemperature}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.9"
                step="0.05"
                value={settings.websiteAiTemperature}
                onChange={e => setSettings(prev => ({ ...prev, websiteAiTemperature: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-[var(--color-text-muted)] block">
                Direct visitor engagement with rate-card knowledge grounding.
              </span>
            </div>
          </div>

        </div>

        {/* Failover Threshold Slider Control */}
        <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Clock size={14} className="text-purple-400" />
                Dynamic Failover Latency Cutoff Threshold
              </span>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                If the Primary LLM does not return tokens within this time window, requests seamlessly switch to Secondary Fallback.
              </p>
            </div>
            <span className="font-mono font-bold text-sm text-purple-400 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-xl self-start sm:self-auto">
              {settings.fallbackLatencyThresholdMs} ms
            </span>
          </div>

          <input
            type="range"
            min="400"
            max="2000"
            step="50"
            value={settings.fallbackLatencyThresholdMs}
            onChange={e => setSettings(prev => ({ ...prev, fallbackLatencyThresholdMs: parseInt(e.target.value) }))}
            className="w-full accent-purple-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
            <span>400ms (Hyper-aggressive)</span>
            <span>800ms (Recommended)</span>
            <span>2000ms (Permissive)</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs text-[var(--color-text)] cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoFailoverAlert}
              onChange={e => setSettings(prev => ({ ...prev, autoFailoverAlert: e.target.checked }))}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Log failover incidents to Audit Ledger</span>
          </label>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 ml-auto"
          >
            {saveSuccess && <Check size={14} className="text-emerald-300" />}
            <span>{saveSuccess ? 'Saved & Applied!' : 'Save Orchestration Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

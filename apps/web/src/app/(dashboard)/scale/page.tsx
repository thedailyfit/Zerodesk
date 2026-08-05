'use client';

import { motion } from 'framer-motion';
import { Rocket, Zap, ShieldCheck, Server, Globe2, Cpu, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';

const scaleFeatures = [
  {
    title: "Custom LLM Fine-Tuning & On-Prem RAG",
    desc: "Train a custom Llama 3 / Mistral model exclusively on your business's proprietary medical transcripts, SOPs, and knowledge base with 0 data leakage.",
    tag: "Enterprise AI",
    icon: Cpu,
    status: "Available for Upgrade"
  },
  {
    title: "Multi-Branch Franchise Sync",
    desc: "Manage multiple clinic locations or branches from a single unified dashboard with location-based role permissions and centralized CRM aggregation.",
    tag: "Franchise & Multi-Location",
    icon: Server,
    status: "Available for Upgrade"
  },
  {
    title: "Dedicated Voice IP Gateway & Low Latency",
    desc: "Upgrade to dedicated SIP trunking and direct carrier routing for ultra-low latency (<300ms) human-like voice responses with custom phone numbers.",
    tag: "Voice AI Pro",
    icon: Headphones,
    status: "Available for Upgrade"
  },
  {
    title: "Official Meta WhatsApp Green Tick & Business API",
    desc: "Get full official WhatsApp Business API verification with custom green badge support, unlimited template messaging, and broadcast campaigns.",
    tag: "Meta Certified",
    icon: Globe2,
    status: "Available for Upgrade"
  },
  {
    title: "Custom Webhook & CRM Integrations",
    desc: "Connect ZeroDesk to Salesforce, HubSpot, Zoho, Epic EMR, Practo, or custom internal REST APIs via custom bi-directional n8n webhooks.",
    tag: "Integrations",
    icon: Zap,
    status: "Available for Upgrade"
  },
  {
    title: "HIPAA / SOC2 Compliance & Dedicated SLA",
    desc: "Dedicated cloud instance on AWS/Railway with 99.99% uptime SLA, encrypted audit logging, and 24/7 dedicated solutions engineer support.",
    tag: "Security & Compliance",
    icon: ShieldCheck,
    status: "Enterprise Plan"
  }
];

export default function ScalePage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden p-8 rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 border border-purple-500/30 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Rocket size={240} className="text-purple-400" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Zap size={14} className="text-yellow-400 animate-pulse" />
            Ready to Scale Upgrade Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Scale Your Clinic to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Multi-Branch Autopilot</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Unlock enterprise-grade AI capabilities, custom LLM fine-tuning, dedicated voice gateways, and multi-location management built for high-growth businesses.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2">
              Book Scale Consultation
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Ready to Scale Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scaleFeatures.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-xl bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-purple-300 font-mono border border-slate-700">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-purple-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  {feat.status}
                </span>
                <button className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enable Feature →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

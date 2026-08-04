'use client';

import { motion } from 'framer-motion';
import { Phone, Mic, Volume2, Globe, Settings as SettingsIcon, PhoneIncoming, PhoneOutgoing, PhoneOff, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const personalities = [
  { id: 'receptionist', label: 'Receptionist', desc: 'Warm, welcoming, moderate pace', icon: '👋' },
  { id: 'luxury', label: 'Luxury', desc: 'Refined, slow, elegant', icon: '✨' },
  { id: 'corporate', label: 'Corporate', desc: 'Clear, efficient, professional', icon: '💼' },
  { id: 'professional', label: 'Professional', desc: 'Balanced, knowledgeable', icon: '🎯' },
  { id: 'friendly', label: 'Friendly', desc: 'Enthusiastic, upbeat', icon: '😊' },
  { id: 'doctor_assistant', label: 'Doctor Assistant', desc: 'Calm, reassuring, precise', icon: '🩺' },
];

const recentCalls = [
  { id: '1', customer: 'Rajesh Kumar', phone: '+91 98765 43210', type: 'inbound', duration: '4:32', status: 'completed', resolution: 'AI_RESOLVED', time: '14:30' },
  { id: '2', customer: 'Priya Sharma', phone: '+91 87654 32109', type: 'outbound', duration: '2:15', status: 'completed', resolution: 'AI_RESOLVED', time: '13:45' },
  { id: '3', customer: 'Unknown', phone: '+91 76543 21098', type: 'inbound', duration: '0:00', status: 'missed', resolution: null, time: '13:20' },
  { id: '4', customer: 'Amit Patel', phone: '+91 65432 10987', type: 'inbound', duration: '6:12', status: 'transferred', resolution: 'HUMAN_RESOLVED', time: '12:10' },
];

export default function VoicePage() {
  const selectedPersonality = 'professional';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voice AI</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Configure your AI receptionist voice agent</p>
      </div>

      {/* Status Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-gradient-to-r from-[var(--color-primary-50)] to-transparent border border-[var(--color-primary-200)] rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <Phone size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text)]">Voice AI Active</p>
              <p className="text-xs text-[var(--color-text-muted)]">Phone: +91 40 1234 5678 · Powered by Vapi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400">Online</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Personality */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2"><Mic size={16} />Voice Personality</h3>
          <div className="grid grid-cols-2 gap-2">
            {personalities.map((p) => (
              <button key={p.id}
                className={cn("p-3 rounded-lg border text-left transition-all",
                  selectedPersonality === p.id
                    ? "bg-[var(--color-primary-100)] border-[var(--color-primary)] text-[var(--color-text)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                )}>
                <span className="text-lg">{p.icon}</span>
                <p className="text-sm font-medium mt-1">{p.label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{p.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2"><Globe size={16} />Languages</h3>
          <div className="space-y-2">
            {[
              { code: 'en', name: 'English', enabled: true },
              { code: 'hi', name: 'Hindi', enabled: true },
              { code: 'te', name: 'Telugu', enabled: true },
              { code: 'hinglish', name: 'Hinglish', enabled: false },
            ].map((lang) => (
              <div key={lang.code} className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text)]">{lang.name}</span>
                <div className={cn("w-8 h-4 rounded-full transition-colors relative cursor-pointer", lang.enabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg-tertiary)]")}>
                  <div className={cn("w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all", lang.enabled ? "left-4.5" : "left-0.5")} />
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-[var(--color-text)] mt-6 mb-3 flex items-center gap-2"><Volume2 size={16} />Greeting Message</h3>
          <textarea className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" rows={3}
            defaultValue="Hello! Welcome to Glow Skin Clinic. How can I help you today?" />
        </motion.div>
      </div>

      {/* Recent Calls */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Recent Voice Calls</h3>
        <div className="space-y-2">
          {recentCalls.map((call) => (
            <div key={call.id} className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="flex items-center gap-3">
                {call.type === 'inbound' ? <PhoneIncoming size={16} className="text-blue-400" /> : <PhoneOutgoing size={16} className="text-green-400" />}
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{call.customer}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{call.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {call.resolution === 'AI_RESOLVED' && <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle2 size={10} />AI Resolved</span>}
                {call.status === 'missed' && <span className="text-[10px] text-red-400 flex items-center gap-1"><PhoneOff size={10} />Missed</span>}
                <span className="text-xs text-[var(--color-text-muted)] font-mono">{call.duration}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{call.time}</span>
                <button className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded"><Play size={12} className="text-[var(--color-text-muted)]" /></button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

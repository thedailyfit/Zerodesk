'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Mic, 
  Volume2, 
  Globe, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneOff, 
  Play, 
  Pause,
  CheckCircle2, 
  Power,
  FileText,
  X,
  Search,
  Check,
  User,
  Clock,
  Sparkles,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AVAILABLE_AGENTS = [
  {
    id: 'agent_1',
    name: 'DermAI Receptionist (Jubilee Hills)',
    provider: 'Vapi.ai',
    agentId: 'vapi_agent_hyderabad_v4',
    voiceName: 'Kavita Soft Tone (ElevenLabs)',
    phone: '+91 40 1234 5678',
    status: 'ACTIVE'
  },
  {
    id: 'agent_2',
    name: 'VIP Concierge Agent (Banjara Hills)',
    provider: 'Vapi.ai',
    agentId: 'vapi_agent_vip_v2',
    voiceName: 'Priya Professional (ElevenLabs)',
    phone: '+91 40 8765 4321',
    status: 'ACTIVE'
  },
  {
    id: 'agent_3',
    name: 'After-Hours Outbound Agent (Retell AI)',
    provider: 'Retell AI',
    agentId: 'retell_agent_afterhours_99a',
    voiceName: 'Dr. Meenakshi Assist (Sarvam Voice)',
    phone: '+91 40 5555 9999',
    status: 'STANDBY'
  }
];

const personalities = [
  { id: 'receptionist', label: 'Receptionist', desc: 'Warm, welcoming, moderate pace', icon: '👋' },
  { id: 'luxury', label: 'Luxury', desc: 'Refined, slow, elegant', icon: '✨' },
  { id: 'corporate', label: 'Corporate', desc: 'Clear, efficient, professional', icon: '💼' },
  { id: 'professional', label: 'Professional', desc: 'Balanced, knowledgeable', icon: '🎯' },
  { id: 'friendly', label: 'Friendly', desc: 'Enthusiastic, upbeat', icon: '😊' },
  { id: 'doctor_assistant', label: 'Doctor Assistant', desc: 'Calm, reassuring, precise', icon: '🩺' },
];

const INITIAL_CALLS = [
  { 
    id: '1', 
    customer: 'Rajesh Kumar', 
    phone: '+91 98765 43210', 
    type: 'inbound', 
    duration: '4:32', 
    status: 'completed', 
    resolution: 'AI_RESOLVED', 
    time: '14:30 Today',
    transcript: "AI: Hello Rajesh, welcome to Glow Skin Clinic! How can I help you today?\nRajesh: Hi, I wanted to ask about laser hair removal pricing and availability.\nAI: Of course! Our laser hair removal packages start at ₹3,000. Dr. Meenakshi has openings this Friday at 4 PM. Should I reserve that slot for you?\nRajesh: Yes please, book Friday 4 PM.\nAI: Perfect! I've confirmed your slot and sent details to your WhatsApp."
  },
  { 
    id: '2', 
    customer: 'Priya Sharma', 
    phone: '+91 87654 32109', 
    type: 'outbound', 
    duration: '2:15', 
    status: 'completed', 
    resolution: 'AI_RESOLVED', 
    time: '13:45 Today',
    transcript: "AI: Hi Priya, this is Glow Clinic calling to remind you of your Chemical Peel session tomorrow at 11 AM.\nPriya: Thanks for calling! Is there any prep needed?\nAI: Please avoid heavy sun exposure and active serums tonight. See you tomorrow at 11 AM!"
  },
  { 
    id: '3', 
    customer: 'Ankit Rawat', 
    phone: '+91 76543 21098', 
    type: 'inbound', 
    duration: '0:00', 
    status: 'missed', 
    resolution: 'MISSED', 
    time: '13:20 Today',
    transcript: "[Call Missed — Auto-triggered WhatsApp Follow-up sent to patient]"
  },
  { 
    id: '4', 
    customer: 'Amit Patel', 
    phone: '+91 65432 10987', 
    type: 'inbound', 
    duration: '6:12', 
    status: 'transferred', 
    resolution: 'HUMAN_RESOLVED', 
    time: '12:10 Today',
    transcript: "AI: Hello Amit, welcome to Glow Clinic!\nAmit: I have severe skin allergies from a medication and need urgent doctor advice.\nAI: I understand completely. Let me immediately connect you to our senior dermatologist Dr. Meenakshi..."
  },
  { 
    id: '5', 
    customer: 'Sneha Reddy', 
    phone: '+91 54321 09876', 
    type: 'outbound', 
    duration: '3:40', 
    status: 'completed', 
    resolution: 'AI_RESOLVED', 
    time: 'Yesterday',
    transcript: "AI: Hello Sneha! Checking in regarding your Full Body Package enquiry.\nSneha: Yes, can you send the treatment schedule?\nAI: Absolutely! Sent to your WhatsApp now."
  }
];

export default function VoicePage() {
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState('agent_1');
  const [showEditAgentModal, setShowEditAgentModal] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('doctor_assistant');
  const [calls, setCalls] = useState(INITIAL_CALLS);
  const [searchCall, setSearchCall] = useState('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const currentAgent = AVAILABLE_AGENTS.find(a => a.id === selectedAgentId) || AVAILABLE_AGENTS[0];

  const filteredCalls = calls.filter(c => 
    c.customer.toLowerCase().includes(searchCall.toLowerCase()) || 
    c.phone.includes(searchCall)
  );

  const toggleAudioPlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setTimeout(() => setPlayingId(null), 4000); // Simulate audio playback
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Voice AI Agent</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Autonomous phone call answering, appointment booking, and call history logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/voice-knowledge-hub"
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Sparkles size={14} className="text-blue-400" />
            <span>Voice AI Knowledge Hub & Prompts →</span>
          </a>

          {/* Master ON / OFF Switch */}
          <div className="flex items-center gap-3 bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-border)]">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider pl-2">
              Voice Feature
            </span>
            <button
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md",
                isVoiceActive
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              )}
            >
              <Power size={14} />
              <span>{isVoiceActive ? 'VOICE AI ON' : 'VOICE AI OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Agent & Telephony Selector Bar */}
      <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Active Agent ID:</span>
              <select 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-slate-900 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold px-3 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {AVAILABLE_AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.provider}) — ID: {agent.agentId}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">
              Provider: <span className="text-cyan-400 font-semibold">{currentAgent.provider}</span> · Cloned Voice: <span className="text-emerald-400">{currentAgent.voiceName}</span> · Linked Number: <span className="text-blue-300">{currentAgent.phone}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowEditAgentModal(true)}
          className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <Settings size={14} />
          <span>Edit Agent Credentials & IDs</span>
        </button>
      </div>

      {/* Voice Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Personality */}
        <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <Mic size={16} className="text-blue-400" />
            Voice AI Personality Mode
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPersonality(p.id)}
                className={cn(
                  "p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group",
                  selectedPersonality === p.id
                    ? "bg-blue-600/10 border-blue-500 text-white shadow-md"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-blue-500/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{p.icon}</span>
                  {selectedPersonality === p.id && <Check size={14} className="text-blue-400" />}
                </div>
                <p className="text-sm font-semibold mt-2">{p.label}</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-snug">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Languages & Greeting */}
        <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Globe size={16} className="text-cyan-400" />
            Multilingual Voice Support
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'English (US & India)', active: true },
              { name: 'Hindi (हिंदी)', active: true },
              { name: 'Telugu (తెలుగు)', active: true },
              { name: 'Hinglish (Hybrid)', active: true },
            ].map((lang) => (
              <div key={lang.name} className="flex items-center justify-between p-2.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text)] font-medium">
                <span>{lang.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-[var(--color-text)] pt-2 flex items-center gap-2">
            <Volume2 size={16} className="text-amber-400" />
            Active Voice Greeting Script
          </h3>
          <textarea
            className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            rows={3}
            defaultValue="Hello! Welcome to Glow Skin Clinic. I am Dr. Meenakshi's AI assistant. How can I help you today?"
          />
        </div>
      </div>

      {/* Past Voice Call History */}
      <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>Voice Calls Past History</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                {filteredCalls.length} Logs
              </span>
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Complete record of inbound & outbound phone calls handled by AI.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search call logs..."
              value={searchCall}
              onChange={(e) => setSearchCall(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0",
                  call.type === 'inbound' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}>
                  {call.type === 'inbound' ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text)]">{call.customer}</p>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">{call.phone}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-2 mt-0.5">
                    <span className="capitalize">{call.type} Call</span>
                    <span>•</span>
                    <span>{call.time}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {call.resolution === 'AI_RESOLVED' && (
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> AI Resolved
                  </span>
                )}
                {call.resolution === 'HUMAN_RESOLVED' && (
                  <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <User size={11} /> Human Handed Off
                  </span>
                )}
                {call.status === 'missed' && (
                  <span className="text-[11px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <PhoneOff size={11} /> Missed Call
                  </span>
                )}

                <span className="text-xs text-[var(--color-text-muted)] font-mono w-12 text-right">{call.duration}</span>

                {/* Audio Player Button */}
                <button
                  onClick={() => toggleAudioPlay(call.id)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  {playingId === call.id ? (
                    <>
                      <Pause size={12} className="text-amber-400 animate-pulse" />
                      <span className="text-amber-400">Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      <span>Audio</span>
                    </>
                  )}
                </button>

                {/* View Transcript Modal */}
                <button
                  onClick={() => setActiveCallId(call.id)}
                  className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs transition-colors flex items-center gap-1 border border-blue-500/30"
                >
                  <FileText size={12} />
                  <span>Transcript</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Modal */}
      <AnimatePresence>
        {activeCallId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText size={18} className="text-blue-400" />
                  Call Transcript: {calls.find(c => c.id === activeCallId)?.customer}
                </h3>
                <button onClick={() => setActiveCallId(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {calls.find(c => c.id === activeCallId)?.transcript}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveCallId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit / Add Agent Credentials Modal */}
      <AnimatePresence>
        {showEditAgentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={20} className="text-blue-400" />
                  <h3 className="font-bold text-base text-white">Voice Agent API Credentials & Agent IDs</h3>
                </div>
                <button onClick={() => setShowEditAgentModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Provider Platform</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500">
                    <option value="vapi">Vapi.ai (Recommended for Latency)</option>
                    <option value="retell">Retell AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Agent Name</label>
                  <input 
                    type="text" 
                    defaultValue={currentAgent.name} 
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-blue-500"
                    placeholder="e.g. DermAI Jubilee Hills Receptionist"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Provider Agent ID (from Vapi / Retell Dashboard)</label>
                  <input 
                    type="text" 
                    defaultValue={currentAgent.agentId} 
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-blue-300 font-mono focus:border-blue-500"
                    placeholder="e.g. vapi_agent_hyderabad_v4 or retell_99a"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ElevenLabs Cloned Voice ID / Name</label>
                  <input 
                    type="text" 
                    defaultValue={currentAgent.voiceName} 
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono focus:border-blue-500"
                    placeholder="e.g. Kavita Soft Tone (ElevenLabs Voice ID: X1yZ...)"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Linked Twilio Phone Number</label>
                  <input 
                    type="text" 
                    defaultValue={currentAgent.phone} 
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowEditAgentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowEditAgentModal(false)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl font-bold shadow-lg shadow-blue-500/20"
                >
                  Save Agent Credentials
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

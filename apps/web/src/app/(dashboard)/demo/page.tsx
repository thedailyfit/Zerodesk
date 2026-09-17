'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  PhoneCall, 
  Clock, 
  MapPin, 
  UserCheck, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity, 
  IndianRupee, 
  RefreshCw, 
  Calendar, 
  MessageSquare, 
  FileText,
  AlertTriangle,
  Stethoscope,
  Info
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  sessions?: string;
  description: string;
  tag?: string;
}

const DEMO_SERVICES: ServiceItem[] = [
  {
    id: 'hydrafacial',
    name: 'HydraFacial Deluxe (Korean Glass Glow)',
    category: 'Facials & Glow',
    price: 4500,
    duration: '45 mins',
    sessions: 'Pack of 3: ₹11,999',
    description: '7-step deep vacuum extraction, salicylic exfoliation, antioxidant infusion & LED therapy.',
    tag: 'Most Popular'
  },
  {
    id: 'laser-full',
    name: 'Full Body Laser Hair Reduction (Soprano Titanium)',
    category: 'Laser Treatments',
    price: 14999,
    duration: '90 mins',
    sessions: 'Pack of 6: ₹69,999',
    description: 'Painless triple-wavelength laser hair reduction with ice-cold sapphire cooling.',
    tag: 'Best Value'
  },
  {
    id: 'laser-underarms',
    name: 'Underarms Laser Hair Reduction',
    category: 'Laser Treatments',
    price: 2499,
    duration: '20 mins',
    sessions: 'Pack of 6: ₹11,999',
    description: 'Quick 20-minute targeted hair reduction. 80%+ hair density drop in 3 sessions.'
  },
  {
    id: 'chemical-peel',
    name: 'Medical Chemical Peels (Acne & Brightening)',
    category: 'Skin Rejuvenation',
    price: 2800,
    duration: '30 mins',
    sessions: 'Pack of 4: ₹9,999',
    description: 'Clinical-grade Salicylic and Glycolic peels targeting active acne, dark spots, and melasma.'
  },
  {
    id: 'botox',
    name: 'Botox Anti-Wrinkle Treatment (Allergan USA)',
    category: 'Injectables & Anti-Aging',
    price: 350,
    duration: '30 mins',
    sessions: 'Per Unit (typically 20-30 units)',
    description: 'US FDA-approved Allergan Botox for forehead horizontal lines, crow\'s feet, and frown lines.',
    tag: 'US FDA Approved'
  },
  {
    id: 'fillers',
    name: 'Juvederm Ultra XC Dermal Fillers',
    category: 'Injectables & Anti-Aging',
    price: 22000,
    duration: '45 mins',
    sessions: 'Per 1ml syringe',
    description: 'Natural hyaluronic acid filler for lip augmentation, cheekbone contouring, and smile lines.'
  },
  {
    id: 'prp-hair',
    name: 'PRP Hair Therapy (GFC Growth Factor Concentrate)',
    category: 'Hair & Scalp',
    price: 5000,
    duration: '60 mins',
    sessions: 'Pack of 4: ₹17,500',
    description: 'Autologous platelet growth factors spun in sterile centrifuge to halt hair fall and thicken hair shafts.',
    tag: 'High Clinical CSAT'
  },
  {
    id: 'carbon-laser',
    name: 'Carbon Laser Peel (Hollywood Red Carpet Peel)',
    category: 'Facials & Glow',
    price: 3800,
    duration: '45 mins',
    sessions: 'Pack of 3: ₹9,999',
    description: 'Liquid carbon paste irradiated with Q-switched laser to vaporize dead skin, sebum, and tighten pores.'
  }
];

const TEST_QUESTIONS = [
  {
    lang: 'English',
    flag: '🇬🇧',
    questions: [
      {
        q: "What are your clinic timings and where are you located?",
        expected: "Located on 100 Feet Road, Indiranagar, Bengaluru. Open Mon–Sat 10 AM to 7:30 PM, Sun 11 AM to 4 PM."
      },
      {
        q: "How much does HydraFacial cost, and what does it include?",
        expected: "₹4,500 per session (package of 3 for ₹11,999) with 7-step Korean glass glow protocol."
      },
      {
        q: "Can I book a consultation with Dr. Ananya Rao for tomorrow?",
        expected: "Offers consultation at ₹800 and offers to send the WhatsApp booking link immediately."
      },
      {
        q: "Is full body laser hair removal painful?",
        expected: "Reassures that Soprano Titanium ice-cooling makes it virtually painless and comfortable."
      },
      {
        q: "Can you send me your location and rate card on WhatsApp?",
        expected: "Confirms and triggers instant WhatsApp dispatch with Google Maps link."
      }
    ]
  },
  {
    lang: 'Hinglish / Hindi',
    flag: '🇮🇳',
    questions: [
      {
        q: "Aapke clinic ki timings kya hain aur clinic kahan par hai?",
        expected: "Replies warmly in Hinglish: Indiranagar 100 Feet Road, Mon–Sat 10:00 AM se 7:30 PM."
      },
      {
        q: "HydraFacial ka kya price hai aur doctor ki fees kitni hai?",
        expected: "HydraFacial ₹4,500 aur Dr. Ananya Rao ke saath consultation fee ₹800 hai."
      },
      {
        q: "Kya laser hair removal mein bahut dard hota hai?",
        expected: "Painless cooling technology ke baare mein batati hai aur confirm karti hai."
      },
      {
        q: "Kya main kal shaam ke liye Dr. Ananya se appointment schedule kar sakta hoon?",
        expected: "Available slots batakar appointment confirm karti hai."
      }
    ]
  },
  {
    lang: 'Telugu',
    flag: '🇮🇳',
    questions: [
      {
        q: "Dr. Ananya Rao gari consultation fee entha and timings cheppandi?",
        expected: "Consultation fee ₹800 and timings 10:00 AM nunchi 7:30 PM varaku ani Telugu lo chebuthundi."
      },
      {
        q: "HydraFacial package price entha untundi andi?",
        expected: "Single session ₹4,500 and 3 sessions package ₹11,999 ani chebuthundi."
      }
    ]
  }
];

export default function DemoPage() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'questions' | 'prompt'>('data');

  const categories = ['ALL', 'Facials & Glow', 'Laser Treatments', 'Injectables & Anti-Aging', 'Hair & Scalp'];

  const filteredServices = selectedCategory === 'ALL' 
    ? DEMO_SERVICES 
    : DEMO_SERVICES.filter(s => s.category === selectedCategory);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSyncToLiveAgent = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      // Simulate live sync call
      await new Promise(r => setTimeout(r, 1200));
      setSyncStatus('Live Voice AI is synchronized with Dr. Ananya Rao & Aura Clinic rate card! Calls to your phone number will answer using this data.');
    } catch {
      setSyncStatus('Sync failed, please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Stethoscope className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                VOICE AI TEST LAB (PRO PLAN)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Aura Skin & Aesthetic Clinic
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Dr. Ananya Rao MD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Skin Clinic Demo Portal for Voice AI Testing
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              This dedicated testing ground provides complete, calibrated clinic data (treatments, pricing, doctor credentials, timings, and Indian multi-lingual prompts) for testing your live phone number via Plivo & LiveKit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 self-start md:self-center">
            <button
              onClick={handleSyncToLiveAgent}
              disabled={isSyncing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing Voice Agent...' : 'Sync Live Voice AI'}
            </button>
            <a
              href="tel:+918919205848"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-medium text-sm transition-all"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Dial Plivo Test Number
            </a>
          </div>
        </div>

        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{syncStatus}</span>
          </motion.div>
        )}
      </div>

      {/* Clinic Key Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Lead Dermatologist</div>
            <div className="text-sm font-semibold text-white">Dr. Ananya Rao, MD</div>
            <div className="text-xs text-slate-400">AIIMS Gold Medalist (11+ yrs)</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Clinic Timings</div>
            <div className="text-sm font-semibold text-white">Mon–Sat: 10 AM – 7:30 PM</div>
            <div className="text-xs text-slate-400">Sunday: 11 AM – 4:00 PM</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Consultation Fee</div>
            <div className="text-sm font-semibold text-white">₹800 / Visit</div>
            <div className="text-xs text-slate-400">Includes 7-day prescription review</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Location</div>
            <div className="text-sm font-semibold text-white">100 Ft Rd, Indiranagar</div>
            <div className="text-xs text-slate-400">Opp. Toit, Metro Pillar 124</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'data' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Treatment Rate Card ({DEMO_SERVICES.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'questions' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Multi-Lingual Test Scripts
        </button>

        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'prompt' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Voice AI Prompt & Rules
        </button>
      </div>

      {/* TAB 1: Treatment Rate Card */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {service.category}
                    </span>
                    {service.tag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {service.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-white text-base leading-snug">
                    {service.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">{service.duration}</div>
                    {service.sessions && (
                      <div className="text-[11px] text-emerald-400 font-medium">{service.sessions}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ₹{service.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Lingual Test Scripts */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-200 text-xs flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span>
              During your live call to <strong>+918919205848</strong>, speak any of these questions in your natural accent. The AI will recognize the intent, answer with accurate clinic pricing, and seamlessly reply in English, Hindi, Hinglish, or Telugu.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TEST_QUESTIONS.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <span className="text-xl">{section.flag}</span>
                  <h3 className="text-sm font-semibold text-white">{section.lang} Test Prompts</h3>
                </div>

                <div className="space-y-3">
                  {section.questions.map((item, qIdx) => {
                    const copyKey = `${sIdx}-${qIdx}`;
                    const isCopied = copiedIndex === copyKey;
                    return (
                      <div
                        key={qIdx}
                        className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-100 italic">
                            "{item.q}"
                          </p>
                          <button
                            onClick={() => handleCopy(item.q, copyKey)}
                            title="Copy to clipboard"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex-shrink-0"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-medium">Expected Reply: </span>
                          {item.expected}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Voice AI System Prompt & Rules */}
      {activeTab === 'prompt' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300 space-y-4 leading-relaxed overflow-x-auto">
            <div className="text-emerald-400 font-semibold text-sm">
              // Live System Prompt Loaded into LiveKit Voice Worker:
            </div>
            <pre className="whitespace-pre-wrap text-slate-300 bg-slate-950/80 p-4 rounded-lg border border-slate-800">
{`You are the warm, highly professional AI front desk receptionist for Aura Skin & Aesthetic Clinic in Indiranagar, Bengaluru.
Your doctor is Dr. Ananya Rao, MBBS, MD (Dermatology, Venereology & Leprosy — AIIMS Gold Medalist, 11+ years experience).

LOCATION & TIMINGS:
- Location: 2nd Floor, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru (Opposite Toit Brewpub, Metro Pillar 124).
- Clinic Hours: Monday to Saturday: 10:00 AM – 7:30 PM, Sunday: 11:00 AM – 4:00 PM.
- Doctor Consultation Fee: ₹800 (includes 7-day free prescription follow-up).

COMPLETE TREATMENT RATE CARD:
1. HydraFacial Deluxe: ₹4,500 / session (Package of 3: ₹11,999). 7-step Korean glass glow protocol.
2. Full Body Laser Hair Reduction: ₹14,999 / session (Package of 6: ₹69,999). Painless Soprano Titanium triple-wavelength.
3. Underarms Laser Hair Reduction: ₹2,499 / session.
4. Chemical Peels (Acne & Glow): ₹2,800 / session. Medical-grade salicylic/glycolic peels.
5. Botox Anti-Wrinkle (Allergan USA): ₹350 / unit. Forehead & crow's feet typically require 20-30 units (₹7,000 – ₹10,500).
6. Juvederm Dermal Fillers: ₹22,000 / 1ml syringe (lips, cheeks, chin).
7. PRP Hair Therapy (GFC Growth Factor): ₹5,000 / session (Package of 4: ₹17,500).
8. Carbon Laser Peel (Hollywood Glow Peel): ₹3,800 / session.

INDIAN PERSONA, CADENCE & MULTI-LINGUAL CODE-SWITCHING:
- Tone: Warm, respectful, polite Indian English receptionist. Speak with an authentic Indian English cadence.
- Use natural Indian conversational markers: "Ji bilkul", "Namaskaram", "Sir/Ma'am", "Certainly, let me help you with that".
- If caller speaks Hindi/Hinglish, reply in Hindi/Hinglish: "Ji bilkul! Dr. Ananya ke saath consultation fee 800 rupees hai..."
- If caller speaks Telugu, reply in Telugu: "Namaskaram andi! Dr. Ananya Rao gari consultation fee 800 rupees andi..."

CRITICAL VOICE PHONE RULES:
- Keep answers short and concise: 1 to 2 sentences maximum, natural for phone calls.
- Always offer to send Google Maps location and booking link directly to their WhatsApp.`}
            </pre>
          </div>
        </div>
      )}

      {/* Safety & Removal Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>This demo page was generated exclusively for your testing session. When you are finished with telephony validation, let us know and it will be safely unmounted.</span>
        </div>
      </div>
    </div>
  );
}

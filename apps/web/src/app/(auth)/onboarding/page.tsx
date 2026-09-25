'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Clock, 
  Tag, 
  Plus, 
  Trash2, 
  Bot, 
  Volume2, 
  CheckCircle2, 
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import type { NicheId } from '@/config/niches/types';

interface NicheMeta {
  id: NicheId;
  title: string;
  tagline: string;
  emoji: string;
  defaultName: string;
  defaultServices: { name: string; price: string }[];
}

const NICHES: NicheMeta[] = [
  { 
    id: 'skin', 
    title: 'Skin Clinic', 
    tagline: 'Aesthetic dermatology, lasers & personalized client care', 
    emoji: '🏥', 
    defaultName: 'Aesthetic Skin Clinic',
    defaultServices: [
      { name: 'HydraFacial Deep Glow', price: '₹3,500' },
      { name: 'Full-Body Laser Hair Reduction', price: '₹7,500' },
      { name: 'Advanced Clinical Peel', price: '₹2,500' }
    ]
  },
  { 
    id: 'dental', 
    title: 'Dental Clinic', 
    tagline: 'Dental practice, appointment bookings & patient hygiene workflows', 
    emoji: '🦷', 
    defaultName: 'Dental Care Center',
    defaultServices: [
      { name: 'Comprehensive Consultation & X-Ray', price: '₹800' },
      { name: 'Ultrasonic Scaling & Polishing', price: '₹1,800' },
      { name: 'Clear Aligner Assessment', price: '₹2,500' }
    ]
  },
  { 
    id: 'spa', 
    title: 'Spa & Wellness', 
    tagline: 'Holistic wellness, therapies & suite appointments', 
    emoji: '🧖', 
    defaultName: 'Serenity Wellness Spa',
    defaultServices: [
      { name: 'Signature Abhyanga Herbal Massage', price: '₹3,200' },
      { name: 'Deep Tissue Recovery Session', price: '₹3,800' },
      { name: 'Thermal Hydrotherapy Spa Bath', price: '₹2,400' }
    ]
  },
  { 
    id: 'realestate', 
    title: 'Real Estate', 
    tagline: 'High-value property sales, NRI inquiries & site visits', 
    emoji: '🏢', 
    defaultName: 'Prime Properties & Estates',
    defaultServices: [
      { name: 'Luxury Property Portfolio Consultation', price: 'Complimentary' },
      { name: 'Exclusive Site Visit Chauffeur Package', price: 'Complimentary' },
      { name: 'Commercial Investment Advisory Brief', price: '₹5,000' }
    ]
  },
  { 
    id: 'hotel', 
    title: 'Hotel & Resort', 
    tagline: 'Guest reservations, front desk & hospitality concierge OS', 
    emoji: '🏨', 
    defaultName: 'Grand Resort & Suites',
    defaultServices: [
      { name: 'Deluxe Suite Reservation (1 Night)', price: '₹8,500' },
      { name: 'Airport Chauffeur Transfer', price: '₹2,200' },
      { name: 'Sunset Cabana Private Dining', price: '₹4,500' }
    ]
  },
];

type FrontdeskTone = 'serene' | 'friendly' | 'professional';

const TONES_INFO: Record<FrontdeskTone, { title: string; desc: string; sample: string }> = {
  serene: {
    title: 'Serene & Empathetic',
    desc: 'Calm, patient, and deeply reassuring. Ideal for healthcare, wellness, and aesthetic care.',
    sample: '"Namaste! Welcome. How can I assist you with scheduling your appointment today?"'
  },
  friendly: {
    title: 'Warm & Friendly',
    desc: 'Approachable, cheerful, and conversational. Great for hospitality, spas, and boutique studios.',
    sample: '"Hey there! 👋 Welcome! I\'d love to help you book your visit or answer any questions."'
  },
  professional: {
    title: 'Executive & Professional',
    desc: 'Crisp, articulate, and authoritative. Best for luxury advisory, corporate real estate, and high-ticket sales.',
    sample: '"Good day. Thank you for reaching our desk. I am at your service to coordinate your inquiry."'
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Niche
  const [selectedNiche, setSelectedNiche] = useState<NicheId>('skin');

  // Step 2: Business Profile
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('+91 80 4736 1000');
  const [city, setCity] = useState('Bengaluru');
  const [workingHours, setWorkingHours] = useState('09:00 AM - 08:00 PM (Mon - Sat)');

  // Step 3: Top Offerings
  const [offerings, setOfferings] = useState<{ name: string; price: string }[]>(() => {
    return NICHES[0].defaultServices;
  });

  // Step 4: AI Frontdesk Setup
  const [aiName, setAiName] = useState('Aria');
  const [aiTone, setAiTone] = useState<FrontdeskTone>('serene');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default services and name when niche changes
  const handleSelectNiche = (nicheId: NicheId) => {
    setSelectedNiche(nicheId);
    const n = NICHES.find(item => item.id === nicheId);
    if (n) {
      if (!businessName) setBusinessName(n.defaultName);
      setOfferings(n.defaultServices);
    }
  };

  const handleUpdateOffering = (index: number, field: 'name' | 'price', val: string) => {
    setOfferings(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleAddOffering = () => {
    setOfferings(prev => [...prev, { name: '', price: '₹1,000' }]);
  };

  const handleRemoveOffering = (index: number) => {
    if (offerings.length <= 1) return;
    setOfferings(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const chosenConfig = NICHES.find(n => n.id === selectedNiche);
    const finalName = businessName.trim() || chosenConfig?.defaultName || 'ZeroDesk Business';

    // Store in localStorage
    localStorage.setItem('zerodesk-niche', selectedNiche);
    localStorage.setItem('zerodesk-business-name', finalName);
    localStorage.setItem('zerodesk-role', 'ADMIN');
    localStorage.setItem('zerodesk-business-profile', JSON.stringify({ phone, city, workingHours }));
    localStorage.setItem('zerodesk-top-offerings', JSON.stringify(offerings));
    localStorage.setItem('zerodesk-ai-frontdesk', JSON.stringify({ name: aiName, tone: aiTone }));

    try {
      await apiClient('/tenants/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: finalName,
          industry: selectedNiche,
          phone,
          city,
          workingHours,
          offerings,
          aiConfig: { name: aiName, tone: aiTone }
        }),
      });
    } catch (err) {
      console.warn('Backend onboarding sync notice:', err);
    }

    // Launch dashboard
    window.location.href = '/';
  };

  const stepsList = [
    { num: 1, label: 'Business Niche' },
    { num: 2, label: 'Profile & Location' },
    { num: 3, label: 'Top Offerings' },
    { num: 4, label: 'AI Frontdesk' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 space-y-6">
        
        {/* Step Progress Bar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isDone = currentStep > step.num;

              return (
                <div key={step.num} className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center w-full">
                    <div className={cn(
                      "w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm",
                      isActive
                        ? "bg-blue-600 text-white ring-4 ring-blue-500/20"
                        : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                    )}>
                      {isDone ? <Check size={12} strokeWidth={3} /> : step.num}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] sm:text-xs font-semibold truncate w-full hidden sm:block",
                    isActive ? "text-blue-500" : isDone ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Card Container */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {/* STEP 1: CHOOSE NICHE */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
                    Step 1: Choose Your Business Category
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                    Select your operational industry to configure tailored workflows, calendar slots, and telephony agents.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {NICHES.map((niche) => {
                    const isSelected = selectedNiche === niche.id;
                    return (
                      <button
                        key={niche.id}
                        type="button"
                        onClick={() => handleSelectNiche(niche.id)}
                        className={cn(
                          "group relative flex items-start p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden",
                          isSelected 
                            ? "border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/10 ring-1 ring-blue-500" 
                            : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30"
                        )}
                      >
                        <div className="text-3xl mr-3.5 relative z-10 shrink-0 select-none">
                          {niche.emoji}
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-bold text-sm sm:text-base leading-snug transition-colors",
                              isSelected ? "text-blue-500" : "text-[var(--color-text)]"
                            )}>
                              {niche.title}
                            </h3>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-[var(--color-text-muted)] text-xs mt-1 leading-relaxed">
                            {niche.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                  >
                    <span>Continue to Profile & Location</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: BUSINESS PROFILE & LOCATION */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
                    Step 2: Business Profile & Location
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                    This information powers your client-facing communications, SMS confirmations, and AI knowledge grounding.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1 flex items-center gap-1.5">
                      <Building2 size={14} className="text-blue-500" />
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={`e.g. ${NICHES.find(n => n.id === selectedNiche)?.defaultName || 'Apex Health'}`}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text)] mb-1 flex items-center gap-1.5">
                        <Phone size={14} className="text-emerald-500" />
                        Dedicated Caller Inbound Phone *
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 80 4736 1000"
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text)] mb-1 flex items-center gap-1.5">
                        <MapPin size={14} className="text-rose-500" />
                        City / Operational Location *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru, Karnataka"
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" />
                      Working Operating Hours *
                    </label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="e.g. 09:00 AM - 08:00 PM (Monday to Saturday)"
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                  >
                    <span>Continue to Top Offerings</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: TOP OFFERINGS / THERAPIES */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
                      Step 3: Top Offerings & Services
                    </h2>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Rate Card
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                    Specify initial services or packages. Your AI receptionist will quote these prices accurately during inbound calls and chats.
                  </p>
                </div>

                <div className="space-y-3">
                  {offerings.map((offering, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-[var(--color-bg)] p-3 rounded-2xl border border-[var(--color-border)]">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          value={offering.name}
                          onChange={(e) => handleUpdateOffering(idx, 'name', e.target.value)}
                          placeholder="Service Name (e.g. HydraFacial Glow)"
                          className="w-full bg-transparent text-xs font-semibold text-[var(--color-text)] focus:outline-none"
                        />
                      </div>

                      <div className="w-32 shrink-0">
                        <input
                          type="text"
                          required
                          value={offering.price}
                          onChange={(e) => handleUpdateOffering(idx, 'price', e.target.value)}
                          placeholder="Price (e.g. ₹3,500)"
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 text-right focus:outline-none"
                        />
                      </div>

                      {offerings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOffering(idx)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddOffering}
                    className="w-full py-2.5 border border-dashed border-[var(--color-border)] hover:border-blue-500/50 rounded-2xl text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 hover:bg-blue-500/5 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Another Service</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                  >
                    <span>Continue to AI Frontdesk</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: AI FRONTDESK SETUP & LAUNCH */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text)] tracking-tight">
                    Step 4: AI Frontdesk Persona & Tone
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                    Pick your AI receptionist name and conversational tone. You can adjust this anytime in Voice AI settings.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1 flex items-center gap-1.5">
                      <Bot size={14} className="text-blue-500" />
                      AI Frontdesk Assistant Name
                    </label>
                    <input
                      type="text"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      placeholder="e.g. Aria, Kavya, or Frontdesk Assistant"
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[var(--color-text)]">
                      Select Conversational Tone
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['serene', 'friendly', 'professional'] as FrontdeskTone[]).map((t) => {
                        const isSelected = aiTone === t;
                        const info = TONES_INFO[t];

                        return (
                          <div
                            key={t}
                            onClick={() => setAiTone(t)}
                            className={cn(
                              "p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 text-left",
                              isSelected
                                ? "border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
                                : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-xs text-[var(--color-text)]">{info.title}</h4>
                                {isSelected && <Check size={14} className="text-blue-500" />}
                              </div>
                              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                                {info.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Greeting Sample Preview */}
                  <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 size={12} className="text-blue-400" />
                      Live Inbound Call Preview ({aiName})
                    </span>
                    <p className="text-xs text-[var(--color-text)] italic leading-relaxed">
                      {TONES_INFO[aiTone].sample}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-102"
                  >
                    {isSubmitting ? (
                      <>
                        <Zap size={14} className="animate-spin" />
                        <span>Configuring Workspace...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Complete Setup & Launch Dashboard</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

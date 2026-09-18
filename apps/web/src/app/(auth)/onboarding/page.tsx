'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Building2, Check, ArrowRight, Sparkles, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import type { NicheId } from '@/config/niches/types';

const NICHES = [
  { 
    id: 'skin', 
    title: 'Skin Clinic', 
    tagline: 'Aesthetic dermatology, treatments & client care', 
    emoji: '🏥', 
    accent: 'from-blue-600 to-indigo-600', 
    defaultName: 'Aesthetic Skin Clinic'
  },
  { 
    id: 'dental', 
    title: 'Dental Clinic', 
    tagline: 'Dental practice, appointments & patient workflows', 
    emoji: '🦷', 
    accent: 'from-cyan-500 to-blue-500', 
    defaultName: 'Dental Care Center'
  },
  { 
    id: 'spa', 
    title: 'Spa & Wellness', 
    tagline: 'Holistic wellness, therapies & guest appointments', 
    emoji: '🧖', 
    accent: 'from-emerald-500 to-teal-500', 
    defaultName: 'Serenity Wellness Spa'
  },
  { 
    id: 'realestate', 
    title: 'Real Estate', 
    tagline: 'High-value property sales, inquiries & site visits', 
    emoji: '🏢', 
    accent: 'from-amber-500 to-orange-500', 
    defaultName: 'Prime Properties'
  },
  { 
    id: 'hotel', 
    title: 'Hotel & Resort', 
    tagline: 'Guest reservations, front desk & hospitality OS', 
    emoji: '🏨', 
    accent: 'from-indigo-500 to-blue-600', 
    defaultName: 'Grand Resort & Suites'
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedNiche, setSelectedNiche] = useState<NicheId>('skin');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (nicheId?: NicheId) => {
    const nicheToSet = nicheId || selectedNiche;
    if (!nicheToSet) return;
    
    setIsSubmitting(true);
    const chosenConfig = NICHES.find(n => n.id === nicheToSet);
    const finalName = businessName.trim() || chosenConfig?.defaultName || 'ZeroDesk Business';

    // Save to local storage
    localStorage.setItem('zerodesk-niche', nicheToSet);
    localStorage.setItem('zerodesk-business-name', finalName);
    localStorage.setItem('zerodesk-role', 'ADMIN');
    
    try {
      await apiClient('/tenants/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: finalName,
          industry: nicheToSet,
        }),
      });
    } catch (err) {
      console.warn('Backend onboarding sync notice:', err);
    }

    // Redirect to dashboard with realistic clean data
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-500 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Setup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)] tracking-tight">
            Choose Your Business Niche
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
            Select your category to configure your AI receptionist, appointment calendar, CRM pipeline, and workflows.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          {/* Niche Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {NICHES.map((niche) => {
              const isSelected = selectedNiche === niche.id;
              return (
                <button
                  key={niche.id}
                  type="button"
                  onClick={() => setSelectedNiche(niche.id)}
                  className={cn(
                    "group relative flex items-start p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden",
                    isSelected 
                      ? "border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/10 ring-1 ring-blue-500" 
                      : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface)]"
                  )}
                >
                  <div className="text-3xl mr-3.5 relative z-10 shrink-0 select-none">
                    {niche.emoji}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-bold text-sm sm:text-base leading-snug transition-colors",
                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-[var(--color-text)]"
                      )}>
                        {niche.title}
                      </h3>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-xs mt-1 leading-relaxed">
                      {niche.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Business Name Input */}
          <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              Business Name (Optional)
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={`e.g. ${NICHES.find(n => n.id === selectedNiche)?.defaultName || 'Apex Clinic'}`}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Realistic operational mode with zero mock data</span>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isSubmitting ? 'Configuring Workspace...' : 'Launch Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

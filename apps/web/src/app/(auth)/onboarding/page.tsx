'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Building2, Globe, ChevronRight, Check, 
  Crown, Users, User, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NicheId } from '@/config/niches/types';

type Step = 1 | 2 | 3;

const NICHES = [
  { id: 'skin', title: 'Skin & Dermatology Clinic', tagline: 'Advanced care for healthy skin', emoji: '🏥', accent: 'from-blue-600 to-indigo-600', color: 'blue' },
  { id: 'spa', title: 'Spa & Wellness Center', tagline: 'Relaxation and holistic wellness', emoji: '🧖', accent: 'from-emerald-500 to-teal-500', color: 'emerald' },
  { id: 'realestate', title: 'Real Estate & Property', tagline: 'Connecting people with dream homes', emoji: '🏢', accent: 'from-amber-500 to-orange-500', color: 'amber' },
  { id: 'dental', title: 'Dental Clinic', tagline: 'Expert dental care and surgery', emoji: '🦷', accent: 'from-cyan-500 to-blue-500', color: 'cyan' },
  { id: 'hotel', title: 'Hotel & Resort', tagline: 'Unforgettable stays and hospitality', emoji: '🏨', accent: 'from-indigo-500 to-blue-600', color: 'indigo' },
] as const;

const ROLES = [
  { id: 'ADMIN', title: 'Owner / Admin', description: 'Full access to all settings, billing, and team management.', icon: Crown },
  { id: 'MANAGER', title: 'Manager', description: 'Oversee daily operations, staff schedules, and reports.', icon: Users },
  { id: 'STAFF', title: 'Staff', description: 'Access to personal schedule and basic customer management.', icon: User },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  
  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    niche: '' as NicheId | '',
    role: ''
  });

  const handleNext = () => setStep((s) => (s < 3 ? (s + 1) as Step : s));
  
  const handleSubmit = () => {
    // Save to local storage
    localStorage.setItem('zerodesk-niche', formData.niche);
    localStorage.setItem('zerodesk-business-name', formData.businessName);
    localStorage.setItem('zerodesk-role', formData.role);
    
    // Redirect to dashboard
    router.push('/');
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <div className="w-full max-w-3xl relative z-10">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 px-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500",
                step >= s ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
              )}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-24 md:w-48 h-1 mx-2 rounded-full transition-colors duration-500",
                  step > s ? "bg-[var(--color-primary)]/50" : "bg-[var(--color-border)]"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl shadow-black/20 rounded-3xl overflow-hidden min-h-[500px] flex flex-col backdrop-blur-xl relative">
          
          <div className="flex-1 p-8 md:p-12 relative">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Welcome to ZeroDesk</h2>
                  <p className="text-[var(--color-text-muted)] mb-8">Let's set up your workspace. What's the name of your business?</p>
                  
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--color-text-muted)] flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--color-text-muted)] flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Website URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-10">
                    <button
                      onClick={handleNext}
                      disabled={!formData.businessName.trim()}
                      className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 ml-auto"
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Select Your Industry</h2>
                  <p className="text-[var(--color-text-muted)] mb-8">We'll customize your CRM and workflows based on your selection.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {NICHES.map((niche) => {
                      const isSelected = formData.niche === niche.id;
                      return (
                        <button
                          key={niche.id}
                          onClick={() => setFormData({ ...formData, niche: niche.id as NicheId })}
                          className={cn(
                            "group relative flex items-start p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden",
                            isSelected 
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-lg shadow-[var(--color-primary)]/10" 
                              : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                          )}
                        >
                          {/* Hover gradient effect */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                            niche.accent
                          )} />

                          <div className="text-4xl mr-4 relative z-10">{niche.emoji}</div>
                          <div className="flex-1 relative z-10">
                            <h3 className={cn("font-bold text-lg mb-1 transition-colors", isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-text)]")}>
                              {niche.title}
                            </h3>
                            <p className="text-[var(--color-text-muted)] text-sm">{niche.tagline}</p>
                          </div>
                          
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="absolute top-4 right-4 text-[var(--color-primary)]"
                            >
                              <Check className="w-6 h-6" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-10 flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!formData.niche}
                      className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40"
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Choose Your Role</h2>
                  <p className="text-[var(--color-text-muted)] mb-8">What will be your primary responsibilities at {formData.businessName || 'your business'}?</p>
                  
                  <div className="space-y-4">
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      const isSelected = formData.role === role.id;
                      
                      return (
                        <button
                          key={role.id}
                          onClick={() => setFormData({ ...formData, role: role.id })}
                          className={cn(
                            "w-full flex items-center p-5 rounded-2xl border transition-all duration-300",
                            isSelected 
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-md shadow-[var(--color-primary)]/10" 
                              : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-text-muted)]"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mr-5 transition-colors",
                            isSelected ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                          )}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="text-left flex-1">
                            <h3 className={cn("font-bold text-lg", isSelected ? "text-[var(--color-primary)]" : "text-[var(--color-text)]")}>
                              {role.title}
                            </h3>
                            <p className="text-[var(--color-text-muted)] text-sm">{role.description}</p>
                          </div>
                          
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            isSelected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-[var(--color-border)]"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-auto pt-10 flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!formData.role}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/25"
                    >
                      Launch Dashboard 🚀
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

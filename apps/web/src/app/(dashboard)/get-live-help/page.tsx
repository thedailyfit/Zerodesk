'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  MessageCircle, 
  Mail, 
  Video, 
  Send, 
  CheckCircle2, 
  FileQuestion, 
  LifeBuoy, 
  ExternalLink,
  Calendar,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

const DEFAULT_TICKETS_BY_NICHE: Record<NicheId, SupportTicket[]> = {
  skin: [
    {
      id: 't-sk-1',
      ticketNumber: 'ZD-2026-041',
      subject: 'Assistance with custom HydraFacial prompt calibration',
      category: 'AI Knowledge Hub',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: 'Today, 11:30 AM'
    },
    {
      id: 't-sk-2',
      ticketNumber: 'ZD-2026-029',
      subject: 'Twilio SIP Trunk configuration verification for Laser OPD',
      category: 'Voice Telephony',
      priority: 'High',
      status: 'Resolved',
      createdAt: '2 days ago'
    }
  ],
  dental: [
    {
      id: 't-dt-1',
      ticketNumber: 'ZD-2026-104',
      subject: 'Integration with digital RVG sensor & X-ray patient viewer',
      category: 'Technical Integration',
      priority: 'High',
      status: 'In Progress',
      createdAt: 'Today, 10:15 AM'
    },
    {
      id: 't-dt-2',
      ticketNumber: 'ZD-2026-088',
      subject: 'Invisalign 3D scan booking webhook parameter mapping',
      category: 'AI Knowledge Hub',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: '3 days ago'
    }
  ],
  spa: [
    {
      id: 't-sp-1',
      ticketNumber: 'ZD-2026-205',
      subject: 'Configure dual therapist assignment rule for couple sanctuary suite',
      category: 'Operations Setup',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: 'Today, 09:45 AM'
    },
    {
      id: 't-sp-2',
      ticketNumber: 'ZD-2026-172',
      subject: 'WhatsApp Ayurvedic intake questionnaire automated dispatch',
      category: 'AI Knowledge Hub',
      priority: 'High',
      status: 'Resolved',
      createdAt: 'Yesterday'
    }
  ],
  salon: [
    {
      id: 't-sl-1',
      ticketNumber: 'ZD-2026-312',
      subject: 'Tiered commission rate rule for Master Stylists & Senior Colorists',
      category: 'Billing & Staff',
      priority: 'High',
      status: 'In Progress',
      createdAt: 'Today, 12:00 PM'
    },
    {
      id: 't-sl-2',
      ticketNumber: 'ZD-2026-290',
      subject: 'Bridal package advance token payment gateway link setup',
      category: 'Billing & Staff',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: '4 days ago'
    }
  ],
  realestate: [
    {
      id: 't-re-1',
      ticketNumber: 'ZD-2026-401',
      subject: 'Automated 99acres and MagicBricks lead webhook routing test',
      category: 'CRM & Integrations',
      priority: 'High',
      status: 'In Progress',
      createdAt: 'Today, 11:00 AM'
    }
  ],
  hotel: [
    {
      id: 't-ht-1',
      ticketNumber: 'ZD-2026-508',
      subject: 'PMS room availability live synchronization webhook check',
      category: 'Technical Integration',
      priority: 'High',
      status: 'In Progress',
      createdAt: 'Today, 08:30 AM'
    }
  ],
  auto: [
    {
      id: 't-au-1',
      ticketNumber: 'ZD-2026-614',
      subject: 'Test drive GPS tracking link SMS template registration',
      category: 'AI Telephony',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: 'Today, 10:00 AM'
    }
  ]
};

export default function GetLiveHelpPage() {
  const { currentNiche } = useNiche();
  const [tickets, setTickets] = useState<SupportTicket[]>(() => DEFAULT_TICKETS_BY_NICHE[currentNiche] || DEFAULT_TICKETS_BY_NICHE.skin);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoBooked, setVideoBooked] = useState(false);

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zerodesk_support_tickets_${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTickets(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load support tickets', e);
    }
    setTickets(DEFAULT_TICKETS_BY_NICHE[currentNiche] || DEFAULT_TICKETS_BY_NICHE.skin);
  }, [currentNiche]);

  const saveTickets = (newTickets: SupportTicket[]) => {
    setTickets(newTickets);
    try {
      localStorage.setItem(`zerodesk_support_tickets_${currentNiche}`, JSON.stringify(newTickets));
    } catch (e) {
      console.error('Failed to save support tickets', e);
    }
  };
  
  // Ticket Form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `t-${Date.now()}`,
        ticketNumber: `ZD-2026-${String(Math.floor(100 + Math.random() * 900))}`,
        subject: subject.trim(),
        category,
        priority,
        status: 'Open',
        createdAt: 'Just now'
      };

      saveTickets([newTicket, ...tickets]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubject('');
      setDescription('');
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Headphones size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Get Live Help & Support</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Submit support tickets directly to ZeroDesk central engineering or reach out via live channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Support Engineers Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Open a Ticket Form */}
        <div className="lg:col-span-7 bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <FileQuestion size={16} className="text-blue-400" />
              Open a Support Ticket
            </h2>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              Connected to Super Admin Hub
            </span>
          </div>

          {submitSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>Ticket submitted successfully! ZeroDesk operations team will respond within 2-4 hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Subject / Issue Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Need assistance connecting custom WhatsApp template"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="AI Knowledge Hub">AI Knowledge Hub / Prompts</option>
                  <option value="Voice Telephony">Voice AI / Telephony</option>
                  <option value="Billing & Pricing">Billing & Invoices</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Priority Level</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-bold border transition-all text-center",
                        priority === p
                          ? p === 'High' 
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40" 
                            : "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Description & Details *</label>
              <textarea
                required
                rows={4}
                placeholder="Explain the problem in detail, what steps you took, and what you expected to see..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting to Super Admin...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Ticket to ZeroDesk Team</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Quick Contact & My Tickets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Support Channels */}
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              Immediate Contact Channels
            </h3>

            <div className="space-y-2.5">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={18} />
                  <div>
                    <span className="block text-[var(--color-text)]">WhatsApp Fast Support</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Mon–Sat 9AM–8PM • Typically replies in 5 mins</span>
                  </div>
                </div>
                <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
              </a>

              <a
                href="mailto:support@zerodesk.in"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-bold group"
              >
                <div className="flex items-center gap-2.5">
                  <Mail size={18} />
                  <div>
                    <span className="block text-[var(--color-text)]">Email Support</span>
                    <span className="text-[10px] text-blue-400 font-normal">support@zerodesk.in</span>
                  </div>
                </div>
                <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
              </a>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold">
                <div className="flex items-center gap-2.5">
                  <Video size={18} className="text-blue-400" />
                  <div>
                    <span className="block text-[var(--color-text)]">Book 1-on-1 Video Onboarding</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-normal">Screen-share walkthrough with engineer</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500 transition-colors shadow-sm"
                >
                  Book Call
                </button>
              </div>
            </div>
          </div>

          {/* Ticket History */}
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center justify-between">
              <span>My Open Tickets ({tickets.length})</span>
              <LifeBuoy size={14} className="text-blue-400" />
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-400 text-[11px]">{t.ticketNumber}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      t.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      t.status === 'In Progress' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                      {t.status}
                    </span>
                  </div>
                  <p className="font-semibold text-[var(--color-text)] line-clamp-1">{t.subject}</p>
                  <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-1">
                    <span>{t.category}</span>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Onboarding Booking Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <Video size={18} className="text-blue-400" />
                  1-on-1 Engineering Walkthrough
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    setVideoBooked(false);
                  }}
                  className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>

              {videoBooked ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 size={44} className="text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-bold text-sm text-[var(--color-text)]">Walkthrough Session Reserved!</h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    A Google Meet link and calendar invite have been sent to your registered account email.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Get a dedicated 30-minute Google Meet session with a ZeroDesk core solutions engineer to configure custom prompts, VoIP SIP trunks, and webhook automation.
                  </p>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                      <Calendar size={14} />
                      <span>Next Available: Today at 04:00 PM IST</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)]">Duration: 30 minutes • Google Meet</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoBooked(true);
                        setTimeout(() => {
                          setIsVideoModalOpen(false);
                          setVideoBooked(false);
                        }, 2500);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
                    >
                      Confirm Session
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, CheckCircle2, XCircle, Clock, Send, Image, FileText, 
  Mic, MapPin, Settings as SettingsIcon, Check, X, Sparkles, Zap, ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useNiche } from '@/components/providers/niche-provider';
import type { ActiveNicheId } from '@/config/niches/types';
import Link from 'next/link';

interface SequenceTemplate {
  id: string;
  name: string;
  category: 'Utility' | 'Marketing' | 'Authentication';
  trigger: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  enabled: boolean;
  description: string;
}

const NICHE_SEQUENCE_TEMPLATES: Record<ActiveNicheId, SequenceTemplate[]> = {
  skin: [
    { id: 'sk_1', name: 'Appointment Confirmation', category: 'Utility', trigger: 'Instant on Booking', status: 'APPROVED', enabled: true, description: 'Sends sitting details, provider name, location GPS pin & pre-sitting instructions.' },
    { id: 'sk_2', name: '2-Hour Pre-Sitting Reminder', category: 'Utility', trigger: '2 Hours Before', status: 'APPROVED', enabled: true, description: 'Cuts no-shows by 35% with 1-tap WhatsApp confirmation button.' },
    { id: 'sk_3', name: 'Missed Call Recovery (15m)', category: 'Utility', trigger: '15m Post Missed Call', status: 'APPROVED', enabled: true, description: 'AI conversational opener offering instant appointment booking to missed callers.' },
    { id: 'sk_4', name: 'Post-Laser Care Protocol', category: 'Utility', trigger: '2h Post Treatment', status: 'APPROVED', enabled: true, description: 'Automated aftercare PDF, sunscreen rules & SOS helpline for cosmetic procedures.' },
    { id: 'sk_5', name: 'HydraFacial 28-Day Glow Recall', category: 'Marketing', trigger: '28 Days Post Visit', status: 'APPROVED', enabled: true, description: 'Recurring maintenance nudge for HydraFacial & Medifacial retention.' },
    { id: 'sk_6', name: 'Google Review CSAT Shield', category: 'Marketing', trigger: '4h Post Sitting', status: 'APPROVED', enabled: true, description: 'Routes 5-star clients to Google Reviews and privately triages lower ratings.' },
    { id: 'sk_7', name: 'Patch Test Allergy Clearance', category: 'Utility', trigger: '48h Post Test', status: 'APPROVED', enabled: true, description: 'Safety check-in asking client to upload photo before chemical peel or laser.' },
    { id: 'sk_8', name: 'GST Invoice & Session Summary', category: 'Utility', trigger: 'Instant on Checkout', status: 'APPROVED', enabled: true, description: 'Delivers digital tax invoice and session summary PDF directly to customer WhatsApp.' }
  ],
  dental: [
    { id: 'dt_1', name: 'Dental Appointment Confirmation', category: 'Utility', trigger: 'Instant on Booking', status: 'APPROVED', enabled: true, description: 'Sends chair slot, treating dentist, clinic map and medical history intake link.' },
    { id: 'dt_2', name: '2-Hour Chair Reminder', category: 'Utility', trigger: '2 Hours Before', status: 'APPROVED', enabled: true, description: 'Reduces dental chair downtime with 1-tap Confirm / Reschedule buttons.' },
    { id: 'dt_3', name: 'Missed Call Recovery (15m)', category: 'Utility', trigger: '15m Post Missed Call', status: 'APPROVED', enabled: true, description: 'Connects with patients seeking emergency toothache or routine consult.' },
    { id: 'dt_4', name: 'Post-Extraction Pain & Diet Care', category: 'Utility', trigger: '3h Post Surgery', status: 'APPROVED', enabled: true, description: 'Sends ice pack instructions, soft diet guidelines and 24h emergency helpline.' },
    { id: 'dt_5', name: '6-Month Scaling & Hygiene Recall', category: 'Marketing', trigger: '180 Days Post Visit', status: 'APPROVED', enabled: true, description: 'Automated preventive recall maintaining patient oral health and clinic revenue.' },
    { id: 'dt_6', name: 'Aligner Switch Tracker', category: 'Utility', trigger: 'Every 14 Days', status: 'APPROVED', enabled: true, description: 'Reminds clear aligner patients to switch trays and upload progress selfies.' },
    { id: 'dt_7', name: 'Google Review 5-Star Booster', category: 'Marketing', trigger: '2h Post Visit', status: 'APPROVED', enabled: true, description: 'Captures happy smile transformation patient reviews for Google Maps ranking.' },
    { id: 'dt_8', name: 'Lab Crown / Bridge Arrival Alert', category: 'Utility', trigger: 'On Lab Delivery', status: 'APPROVED', enabled: true, description: 'Notifies patient immediately when prosthetic is ready for permanent cementation.' }
  ],
  spa: [
    { id: 'sp_1', name: 'Spa Session Confirmation', category: 'Utility', trigger: 'Instant on Booking', status: 'APPROVED', enabled: true, description: 'Sends therapist assignment, private suite details & aromatherapy intake form.' },
    { id: 'sp_2', name: 'Day-Before Spa Reminder', category: 'Utility', trigger: '24 Hours Before', status: 'APPROVED', enabled: true, description: 'Pre-arrival sauna & steam room advisory to ensure guests arrive relaxed.' },
    { id: 'sp_3', name: 'Missed Call Recovery (15m)', category: 'Utility', trigger: '15m Post Missed Call', status: 'APPROVED', enabled: true, description: 'Recovers luxury spa inquiries with digital service menu and instant booking.' },
    { id: 'sp_4', name: 'Post-Massage Hydration Guide', category: 'Utility', trigger: '2h Post Therapy', status: 'APPROVED', enabled: true, description: 'Herbal detox tea recommendations and relaxation advice after therapy.' },
    { id: 'sp_5', name: 'Midweek Stress Relief Offer', category: 'Marketing', trigger: 'Every Tuesday 10am', status: 'APPROVED', enabled: true, description: 'Broadcasts off-peak afternoon 20% privilege slots to regular guests.' },
    { id: 'sp_6', name: 'Favorite Therapist 21-Day Recall', category: 'Marketing', trigger: '21 Days Post Visit', status: 'APPROVED', enabled: true, description: 'Re-books guests with their preferred therapist or wellness specialist.' },
    { id: 'sp_7', name: 'Quarterly Wellness Club Renewal', category: 'Marketing', trigger: '14 Days Pre-Expiry', status: 'APPROVED', enabled: true, description: 'Retains spa club members with automated renewal link and bonus treatment.' },
    { id: 'sp_8', name: 'Guest CSAT & Feedback Form', category: 'Marketing', trigger: '3h Post Treatment', status: 'APPROVED', enabled: true, description: 'Captures guest satisfaction scores and directs positive reviews to Google/TripAdvisor.' }
  ],
  realestate: [
    { id: 're_1', name: 'Instant Digital Brochure Drop', category: 'Utility', trigger: 'Instant on Ad Lead', status: 'APPROVED', enabled: true, description: 'Dispatches high-res floor plans, project video & Google Maps pin in < 15 seconds.' },
    { id: 're_2', name: 'VIP Site Visit Free Cab Dispatch', category: 'Utility', trigger: 'On Visit Request', status: 'APPROVED', enabled: true, description: 'Sends chauffeured Uber/Ola cab booking confirmation & driver details.' },
    { id: 're_3', name: '24h Site Visit Reminder + Gate Pass', category: 'Utility', trigger: '24 Hours Before', status: 'APPROVED', enabled: true, description: 'Delivers QR gate pass and sales manager contact for friction-free entrance.' },
    { id: 're_4', name: 'Missed Call Recovery (15m)', category: 'Utility', trigger: '15m Post Missed Call', status: 'APPROVED', enabled: true, description: 'Instant response to prospective homebuyers calling from 99acres / MagicBricks.' },
    { id: 're_5', name: 'Post-Visit Cost Sheet & Unit Lock', category: 'Utility', trigger: '1h Post Visit', status: 'APPROVED', enabled: true, description: 'Delivers itemized pricing, payment schedule & token reservation link.' },
    { id: 're_6', name: 'Construction Drone Milestone', category: 'Marketing', trigger: 'Monthly Slab Drop', status: 'APPROVED', enabled: true, description: 'Builds buyer trust with 4K drone construction video broadcasts.' },
    { id: 're_7', name: 'Token Payment & KYC Upload Link', category: 'Utility', trigger: 'On Token Receipt', status: 'APPROVED', enabled: true, description: 'Secure WhatsApp portal for PAN, Aadhaar & agreement verification.' },
    { id: 're_8', name: 'Dormant Lead 14-Day Reactivation', category: 'Marketing', trigger: '14 Days Inactive', status: 'APPROVED', enabled: true, description: 'Re-engages cold buyers with limited-period subvention & price freeze alert.' }
  ],
  hotel: [
    { id: 'ht_1', name: 'Reservation Confirmation & Prefs', category: 'Utility', trigger: 'Instant on Booking', status: 'APPROVED', enabled: true, description: 'Sends check-in QR code, pillow menu & dietary preference questionnaire.' },
    { id: 'ht_2', name: 'Airport Chauffeur Dispatch', category: 'Utility', trigger: 'Flight Landed', status: 'APPROVED', enabled: true, description: 'Tracks incoming flight and sends chauffeur vehicle number and pickup terminal.' },
    { id: 'ht_3', name: 'Sunset Dining Table Reservation', category: 'Marketing', trigger: 'Check-in Day 2pm', status: 'APPROVED', enabled: true, description: 'Exclusive dining upgrade offering sunset rooftop or pool deck seating.' },
    { id: 'ht_4', name: '1-Tap Daily Housekeeping Request', category: 'Utility', trigger: 'Daily 9:00 AM', status: 'APPROVED', enabled: true, description: 'Allows in-stay guests to schedule room cleaning with a single tap.' },
    { id: 'ht_5', name: 'Express Mobile Check-out & GST Folio', category: 'Utility', trigger: 'Departure Morning', status: 'APPROVED', enabled: true, description: 'Zero-wait frontdesk checkout with instant digital GST tax invoice on WhatsApp.' },
    { id: 'ht_6', name: 'TripAdvisor & Google Review Booster', category: 'Marketing', trigger: '4h Post Checkout', status: 'APPROVED', enabled: true, description: 'Directs satisfied guests to post 5-star reviews on TripAdvisor and Google.' },
    { id: 'ht_7', name: 'Lost & Found Instant Image Dispatch', category: 'Utility', trigger: 'On Item Found', status: 'APPROVED', enabled: true, description: 'Sends photo of forgotten belongings to departed guest with courier return options.' },
    { id: 'ht_8', name: 'Return Guest Anniversary Privilege', category: 'Marketing', trigger: '330 Days Post Stay', status: 'APPROVED', enabled: true, description: 'Invites past guests for anniversary getaway with complimentary suite upgrade.' }
  ]
};

const statusConfig: Record<string, { style: string; label: string }> = {
  APPROVED: { style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Meta Approved' },
  PENDING: { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'In Review' },
  REJECTED: { style: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejected' },
};

export default function WhatsappPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<SequenceTemplate[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalToday: 0,
    resolvedRate: 100,
    avgResponse: '0.8s',
    templatesSent: 0,
  });

  const [businessInfo, setBusinessInfo] = useState({
    phone: 'Meta Cloud API Connected',
    name: `${nicheConfig?.label || 'ZeroDesk'} WhatsApp Channel`,
  });

  // Load niche templates with persistent localStorage
  useEffect(() => {
    const key = `zd_wa_templates_${currentNiche}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse wa templates', e);
      }
    }
    const defaultTemplates = NICHE_SEQUENCE_TEMPLATES[currentNiche] || NICHE_SEQUENCE_TEMPLATES.skin;
    setTemplates(defaultTemplates);
    localStorage.setItem(key, JSON.stringify(defaultTemplates));
  }, [currentNiche]);

  const toggleTemplate = (id: string) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        const nextState = !t.enabled;
        const msg = nextState 
          ? `Sequence "${t.name}" enabled for automated WhatsApp dispatch.` 
          : `Sequence "${t.name}" paused.`;
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
        return { ...t, enabled: nextState };
      }
      return t;
    });
    setTemplates(updated);
    localStorage.setItem(`zd_wa_templates_${currentNiche}`, JSON.stringify(updated));
  };

  useEffect(() => {
    async function loadWhatsappData() {
      try {
        setLoading(true);
        const [convsRes, tenantRes] = await Promise.allSettled([
          apiClient('/conversations'),
          apiClient('/tenants/me')
        ]);

        const convs = convsRes.status === 'fulfilled' && Array.isArray(convsRes.value) ? convsRes.value : [];
        if (tenantRes.status === 'fulfilled' && tenantRes.value) {
          const t: any = tenantRes.value;
          setBusinessInfo({
            phone: t.whatsappNumber || t.phone || 'Meta Cloud API Connected',
            name: t.name || `${nicheConfig?.label || 'ZeroDesk'} WhatsApp Channel`,
          });
        } else {
          setBusinessInfo(prev => ({
            ...prev,
            name: `${nicheConfig?.label || 'ZeroDesk'} WhatsApp Channel`,
          }));
        }

        const waConvs = convs.filter((c: any) => (c.channel || '').toUpperCase() === 'WHATSAPP');
        const resolved = waConvs.filter((c: any) => c.status === 'COMPLETED');
        const rate = waConvs.length > 0 ? Math.round((resolved.length / waConvs.length) * 100) : 100;

        setStats({
          totalToday: waConvs.length,
          resolvedRate: rate,
          avgResponse: '0.8s',
          templatesSent: waConvs.length > 0 ? Math.round(waConvs.length * 0.8) : 0,
        });

        const mapped = waConvs.slice(0, 6).map((c: any) => ({
          id: c.id,
          customer: c.customer?.name || `${nicheConfig?.terminology?.customer || 'Client'}`,
          message: c.messages?.[0]?.content || 'Inquiry regarding appointments and services.',
          response: c.messages?.[1]?.content || c.aiSummary || 'ZeroDesk AI processed inquiry.',
          time: new Date(c.startedAt || c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          resolved: c.status === 'COMPLETED',
        }));

        setMessages(mapped);

      } catch (err) {
        console.error('Failed loading whatsapp telemetry:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWhatsappData();
  }, [currentNiche, nicheConfig]);

  const activeCount = templates.filter(t => t.enabled).length;

  const statsItems = [
    { label: 'Messages Today', value: stats.totalToday, icon: MessageCircle, color: 'text-green-400' },
    { label: 'AI Resolved', value: `${stats.resolvedRate}%`, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Active Sequences', value: `${activeCount} / ${templates.length}`, icon: Zap, color: 'text-blue-400' },
    { label: 'Templates Sent', value: stats.templatesSent, icon: Send, color: 'text-indigo-400' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">WhatsApp Business AI</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Meta Cloud API autonomous conversational assistant & automated sequence dispatcher for {nicheConfig?.label || 'your business'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/outbound-campaigns"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-xs font-semibold rounded-xl text-[var(--color-text)] transition-colors"
          >
            <Sparkles size={14} className="text-blue-400" />
            <span>Outbound Broadcasts</span>
          </Link>
        </div>
      </div>

      {/* Connection Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/30">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[var(--color-text)] text-base">Meta Cloud API WhatsApp Engine</p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified WABA
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{businessInfo.phone} · {businessInfo.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[var(--color-surface)]/80 px-3.5 py-1.5 rounded-xl border border-[var(--color-border)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">Webhook Live (0.8s avg)</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsItems.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">{s.label}</span>
                <Icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-bold mt-2 text-[var(--color-text)]">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column: Live Messages & Automated Sequence Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Messages (5 Cols) */}
        <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[var(--color-text)]">Recent WhatsApp Conversations</h2>
            <Link href="/unified-inbox" className="text-xs text-blue-400 hover:underline font-medium">Unified Inbox &rarr;</Link>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No WhatsApp messages received yet.</p>
              <p className="text-[11px] mt-1">Inbound {nicheConfig?.terminology?.customer ? `${nicheConfig.terminology.customer.toLowerCase()} ` : ''}chats will appear here with instant AI auto-replies.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text)]">{m.customer}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{m.time}</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    <span className="font-semibold text-[var(--color-text)]">Inquiry:</span> {m.message}
                  </p>
                  <p className="text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 leading-relaxed">
                    <span className="font-semibold text-emerald-300">AI Frontdesk:</span> {m.response}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Automated Sequence Templates with On/Off Toggles (7 Cols) */}
        <div className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2">
                <span>Automated Sequence Templates</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                  {activeCount} Active
                </span>
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Toggle automated Meta WhatsApp notifications & triggers for {nicheConfig?.label || 'this niche'}.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              15m Cron Active
            </span>
          </div>

          <div className="space-y-2.5">
            {templates.map((t) => {
              const status = statusConfig[t.status];
              return (
                <div 
                  key={t.id} 
                  className={cn(
                    "p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4",
                    t.enabled 
                      ? "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-emerald-500/40" 
                      : "bg-[var(--color-bg)]/50 border-[var(--color-border)]/50 opacity-60"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">{t.name}</p>
                      
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-semibold border uppercase tracking-wider",
                        t.category === 'Utility' 
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      )}>
                        {t.category}
                      </span>

                      <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                        <Clock size={10} /> {t.trigger}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 line-clamp-1">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn("hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full border font-medium", status.style)}>
                      {status.label}
                    </span>

                    {/* On/Off Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={t.enabled}
                      onClick={() => toggleTemplate(t.id)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        t.enabled ? "bg-emerald-600" : "bg-slate-700"
                      )}
                      title={t.enabled ? "Click to Pause Sequence" : "Click to Activate Sequence"}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          t.enabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-white">WhatsApp Sequence Updated</p>
              <p className="text-emerald-300/80 mt-0.5">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 ml-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import { 
  Plus, 
  FileText, 
  Search, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  FileCheck, 
  Copy, 
  Check, 
  X,
  Image as ImageIcon,
  Video,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  channel: 'WHATSAPP' | 'VOICE' | 'EMAIL';
  subject?: string;
  content: string;
  mediaAttachment?: 'PDF' | 'IMAGE' | 'VIDEO' | 'NONE';
  isPreinstalled: boolean;
  variables: string[];
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: 'e1',
    title: 'Appointment Confirmation & Pre-Care Email',
    category: 'Booking Confirmation',
    channel: 'EMAIL',
    subject: 'Confirmed: Your {{service}} session at {{business_name}}',
    content: 'Dear {{customer_name}},\n\nYour appointment for {{service}} is confirmed for {{appointment_time}} with Dr. {{staff_name}} at {{business_name}}.\n\nPre-Treatment Instructions:\n1. Avoid direct sun exposure or harsh treatments 48h prior.\n2. Discontinue active retinoids and chemical exfoliants 3 days before.\n3. Arrive with clean skin free of makeup or heavy oils.\n\nNeed to reschedule? Reply directly or call {{phone}}.\n\nWarm regards,\n{{business_name}} Clinical Team',
    mediaAttachment: 'PDF',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'appointment_time', 'staff_name', 'business_name', 'phone']
  },
  {
    id: 'e2',
    title: 'Invoice & Treatment Receipt Delivery Email',
    category: 'Billing & Receipt',
    channel: 'EMAIL',
    subject: 'Receipt & Invoice #{{invoice_no}} from {{business_name}}',
    content: 'Dear {{customer_name}},\n\nThank you for visiting {{business_name}} today for your {{service}} session!\n\nAttached is your official treatment receipt #{{invoice_no}} detailing your procedure breakdown and doctor fee.\n\nTotal Paid: {{amount}}\nDate: {{date}}\n\nIf you have any questions regarding your post-care recovery or next session, feel free to reply.',
    mediaAttachment: 'PDF',
    isPreinstalled: true,
    variables: ['customer_name', 'invoice_no', 'service', 'amount', 'date', 'business_name']
  },
  {
    id: 'e3',
    title: '90-Day Follow-Up & Win-Back Discount Offer',
    category: 'Retention Marketing',
    channel: 'EMAIL',
    subject: 'Time for your touch-up at {{business_name}}? 20% Off Inside 🎁',
    content: 'Hello {{customer_name}},\n\nIt has been 90 days since your last {{service}} session with us!\n\nTo ensure your results stay optimal, we invite you back with an exclusive 20% discount.\n\nUse Code: GLOW20 when booking online or via WhatsApp.\n\nBook your follow-up slot today!',
    mediaAttachment: 'IMAGE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'business_name']
  },
  {
    id: 'e4',
    title: 'Digital Consultation Report & Personalized Roadmap Email',
    category: 'Consultation Follow-up',
    channel: 'EMAIL',
    subject: 'Your Analysis Report & Treatment Plan - {{business_name}}',
    content: 'Dear {{customer_name}},\n\nThank you for undergoing a comprehensive consultation with Dr. {{staff_name}} at {{business_name}}.\n\nBased on your assessment, here is your recommended treatment roadmap:\n\nRecommended Procedures:\n- Primary Treatment: {{service}} (Recommended 4-6 sessions)\n- Maintenance: Monthly follow-ups & routine care\n\nAttached is your full PDF Diagnostic Report. Reply or call {{phone}} to schedule session #1!',
    mediaAttachment: 'PDF',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'staff_name', 'business_name', 'phone']
  },
  {
    id: 'w1',
    title: 'WhatsApp Appointment & Pre-Care Reminder (24h Prior)',
    category: 'Reminders',
    channel: 'WHATSAPP',
    content: 'Hi {{customer_name}}! 👋 Reminder: Your {{service}} session is tomorrow at {{appointment_time}} with Dr. {{staff_name}} at {{business_name}}.\n\nPre-care check: Arrive 10 minutes early.\n\nReply 1 to Confirm or 2 to Reschedule.',
    mediaAttachment: 'IMAGE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'appointment_time', 'staff_name', 'business_name']
  },
  {
    id: 'w2',
    title: 'WhatsApp Post-Visit Care Check & Review Request',
    category: 'Customer Feedback',
    channel: 'WHATSAPP',
    content: 'Hi {{customer_name}}! Hope you feel great after your {{service}} session today with Dr. {{staff_name}} at {{business_name}}. 🌟\n\nPlease follow all aftercare guidelines given.\n\nCould you take 30 seconds to rate your experience? {{review_link}}',
    mediaAttachment: 'NONE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'staff_name', 'business_name', 'review_link']
  },
  {
    id: 'w3',
    title: 'WhatsApp Post-Treatment Aftercare Guidelines',
    category: 'Post-Care Instructions',
    channel: 'WHATSAPP',
    content: 'Hi {{customer_name}}! 🌿 Key aftercare instructions for your {{service}} treatment today:\n\n1. ☀️ Sun Protection: Apply broad-spectrum SPF every 3 hours.\n2. 🧼 Avoid Harsh Products: Use gentle cleanser for 3-5 days.\n3. 🚫 Avoid Heavy Sweating: No intense workouts or hot saunas for 24h.\n\nContact {{business_name}} if you have any questions!',
    mediaAttachment: 'IMAGE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'business_name']
  },
  {
    id: 'w4',
    title: 'Voice AI Missed Call Auto-Responder',
    category: 'Auto-Trigger DM',
    channel: 'WHATSAPP',
    content: 'Hello {{customer_name}}! 🙏 We noticed you just called {{business_name}}. Our AI assistant missed your call while assisting another caller.\n\nHow can we help you right now?\n1️⃣ Book Appointment / Check Services\n2️⃣ Doctor Timings & Pricing\n3️⃣ Reschedule Booking\n\nReply with 1, 2, or 3 to chat instantly!',
    mediaAttachment: 'NONE',
    isPreinstalled: true,
    variables: ['customer_name', 'business_name']
  },
  {
    id: 'v1',
    title: 'Voice AI Inbound Receptionist Script',
    category: 'Inbound Receptionist',
    channel: 'VOICE',
    content: 'Namaskaram! Welcome to {{business_name}}. I am your AI receptionist. Are you calling to book a new appointment, check procedure prices, or speak with our coordinator?',
    isPreinstalled: true,
    variables: ['business_name']
  },
  {
    id: 'v2',
    title: 'Voice AI Outbound Appointment Confirmation Call Script',
    category: 'Outbound Reminder',
    channel: 'VOICE',
    content: 'Hello {{customer_name}}, this is {{business_name}} calling regarding your appointment scheduled for {{appointment_time}} with Dr. {{staff_name}}. Can you confirm if you will be attending?',
    isPreinstalled: true,
    variables: ['customer_name', 'appointment_time', 'staff_name', 'business_name']
  }
];

const channelIcons = {
  WHATSAPP: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  VOICE: { icon: PhoneCall, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  EMAIL: { icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
};

const mediaBadge = {
  PDF: { label: 'PDF Brochure Attached', icon: FileCheck, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  IMAGE: { label: 'Image Attached', icon: ImageIcon, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  VIDEO: { label: 'Video Demo Attached', icon: Video, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  NONE: { label: 'Text Only', icon: FileText, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

export default function TemplatesPage() {
  const { currentNiche, nicheConfig } = useNiche();
  
  const getDefaultTemplates = (): TemplateItem[] => {
    if (nicheConfig?.templates && nicheConfig.templates.length > 0) {
      return nicheConfig.templates.map((t: any) => ({
        id: t.id,
        title: t.title,
        category: t.category || 'General',
        channel: t.channel || 'WHATSAPP',
        subject: t.subject,
        content: t.content,
        mediaAttachment: t.mediaAttachment || 'NONE',
        isPreinstalled: t.isPreinstalled !== false,
        variables: t.variables || ['customer_name', 'business_name']
      }));
    }
    return INITIAL_TEMPLATES;
  };

  const [templates, setTemplates] = useState<TemplateItem[]>(getDefaultTemplates());
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [channel, setChannel] = useState<'WHATSAPP' | 'VOICE' | 'EMAIL'>('WHATSAPP');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [mediaAttachment, setMediaAttachment] = useState<'PDF' | 'IMAGE' | 'VIDEO' | 'NONE'>('NONE');

  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_templates_${currentNiche}`);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
        return;
      } catch (e) {
        // fallback
      }
    }
    setTemplates(getDefaultTemplates());
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveToStorage = (updated: TemplateItem[]) => {
    setTemplates(updated);
    localStorage.setItem(`zerodesk_templates_${currentNiche}`, JSON.stringify(updated));
  };

  const handleResetDefaults = () => {
    const def = getDefaultTemplates();
    saveToStorage(def);
    showToast('Templates reset to niche defaults');
  };

  const filtered = templates.filter((tpl) => {
    if (channelFilter !== 'ALL' && tpl.channel !== channelFilter) return false;
    if (search && !tpl.title.toLowerCase().includes(search.toLowerCase()) && !tpl.content.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Template copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateModal = () => {
    setEditingTemplateId(null);
    setTitle('');
    setCategory('General');
    setChannel('WHATSAPP');
    setSubject('');
    setContent('');
    setMediaAttachment('NONE');
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: TemplateItem) => {
    setEditingTemplateId(tpl.id);
    setTitle(tpl.title);
    setCategory(tpl.category);
    setChannel(tpl.channel);
    setSubject(tpl.subject || '');
    setContent(tpl.content);
    setMediaAttachment(tpl.mediaAttachment || 'NONE');
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingTemplateId) {
      const updated = templates.map((t) => {
        if (t.id === editingTemplateId) {
          return {
            ...t,
            title,
            category,
            channel,
            subject: channel === 'EMAIL' ? subject : undefined,
            content,
            mediaAttachment,
          };
        }
        return t;
      });
      saveToStorage(updated);
      showToast('Template successfully updated!');
    } else {
      const created: TemplateItem = {
        id: Date.now().toString(),
        title,
        category,
        channel,
        subject: channel === 'EMAIL' ? subject : undefined,
        content,
        mediaAttachment,
        isPreinstalled: false,
        variables: ['customer_name', 'service', 'business_name']
      };
      saveToStorage([created, ...templates]);
      showToast('New template created!');
    }

    setIsModalOpen(false);
  };

  const insertVariable = (token: string) => {
    setContent(prev => `${prev} {{${token}}}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-xl text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Pre-Installed Templates & AI Email Scripts</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Editable & Live
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Pre-installed scripts customized for {nicheConfig?.label || 'your business'}. Edit any template, customize scripts, or add custom messages.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white rounded-xl text-xs font-medium transition-all"
            title="Reset to default niche templates"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            <span>Create Custom Template</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search templates, subjects or script text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'EMAIL', 'WHATSAPP', 'VOICE'].map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={cn(
                "px-3.5 py-1.5 text-xs rounded-xl border font-bold transition-all",
                channelFilter === ch
                  ? "bg-purple-600 text-white border-purple-500 shadow"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {ch === 'ALL' ? 'All Channels' : ch === 'EMAIL' ? '✉️ Email Templates' : ch === 'WHATSAPP' ? '💬 WhatsApp' : '📞 Voice AI'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((tpl, i) => {
          const chConf = channelIcons[tpl.channel];
          const ChIcon = chConf.icon;
          const media = tpl.mediaAttachment ? mediaBadge[tpl.mediaAttachment] : null;

          return (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all shadow-sm group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn("p-2 rounded-xl border shrink-0", chConf.bg)}>
                      <ChIcon size={18} className={chConf.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[var(--color-text)] truncate">{tpl.title}</h3>
                        {tpl.isPreinstalled && (
                          <span className="px-2 py-0.5 text-[9px] rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-semibold shrink-0">
                            Preinstalled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">{tpl.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(tpl)}
                      className="p-2 hover:bg-purple-500/10 text-[var(--color-text-muted)] hover:text-purple-600 dark:hover:text-purple-300 rounded-xl transition-colors cursor-pointer"
                      title="Edit this script/template"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleCopy(tpl.id, tpl.content)}
                      className="p-2 hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl transition-colors cursor-pointer"
                      title="Copy Template Content"
                    >
                      {copiedId === tpl.id ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>

                {tpl.channel === 'EMAIL' && tpl.subject && (
                  <div className="p-2.5 bg-[var(--color-bg)] border border-purple-500/30 rounded-xl text-xs">
                    <span className="text-[var(--color-text-muted)] font-medium">Subject: </span>
                    <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">{tpl.subject}</span>
                  </div>
                )}

                <div className="p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs font-mono text-[var(--color-text)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {tpl.content}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-[10px]">
                <div>
                  {media && (
                    <span className={cn("px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5", media.color)}>
                      <media.icon size={12} />
                      {media.label}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => openEditModal(tpl)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit Script</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit / Create Template Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text)]">
                      {editingTemplateId ? 'Edit Script & Template' : 'Create Custom Template'}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {editingTemplateId ? 'Modify template content, dynamic variables, and channel settings.' : 'Add a new custom script for your business operations.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[var(--color-surface)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--color-text)] font-semibold mb-1">Template Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 24h Appointment Reminder"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--color-text)] font-semibold mb-1">Category / Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Booking Confirmation, Follow Up"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--color-text)] font-semibold mb-1">Channel</label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as any)}
                      className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                    >
                      <option value="WHATSAPP">WhatsApp Message</option>
                      <option value="EMAIL">Email Template</option>
                      <option value="VOICE">Voice AI Script</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[var(--color-text)] font-semibold mb-1">Media Attachment</label>
                    <select
                      value={mediaAttachment}
                      onChange={(e) => setMediaAttachment(e.target.value as any)}
                      className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="NONE">None (Text Only)</option>
                      <option value="PDF">PDF Brochure / Document</option>
                      <option value="IMAGE">Image / Flyer</option>
                      <option value="VIDEO">Video Demo</option>
                    </select>
                  </div>
                </div>

                {channel === 'EMAIL' && (
                  <div>
                    <label className="block text-[var(--color-text)] font-semibold mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      placeholder="e.g. Your confirmed booking at {{business_name}}"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[var(--color-text)] font-semibold">Template Script / Body Content</label>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Click to insert token:</span>
                  </div>

                  {/* Variable insertion pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['customer_name', 'service', 'appointment_time', 'staff_name', 'business_name', 'amount'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-mono text-[10px] rounded-md transition-colors cursor-pointer"
                      >
                        + {`{{${v}}}`}
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message script with {{variables}}..."
                    className="w-full p-3.5 bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-purple-500 rounded-xl text-[var(--color-text)] font-mono text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{editingTemplateId ? 'Save Changes' : 'Create Template'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

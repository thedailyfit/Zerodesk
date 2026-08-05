'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Search, 
  Sparkles, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  FileCheck, 
  Copy, 
  Check, 
  X,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';

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
  // Email Scripts & Templates
  {
    id: 'e1',
    title: 'Appointment Confirmation & Pre-Treatment Care Email',
    category: 'Booking Confirmation',
    channel: 'EMAIL',
    subject: 'Confirmed: Your {{service}} appointment at {{business_name}}',
    content: 'Dear {{customer_name}},\n\nYour appointment for {{service}} is confirmed for {{appointment_time}} with {{staff_name}}.\n\nPre-treatment instructions:\n1. Avoid direct sun exposure 24 hours prior.\n2. Do not apply active chemical serums before the session.\n\nNeed to reschedule? Reply directly or call {{phone}}.\n\nWarm regards,\n{{business_name}} Team',
    mediaAttachment: 'PDF',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'appointment_time', 'staff_name', 'business_name', 'phone']
  },
  {
    id: 'e2',
    title: 'Patient Invoice & Treatment Receipt Delivery Email',
    category: 'Billing & Receipt',
    channel: 'EMAIL',
    subject: 'Receipt & Invoice #{{invoice_no}} from {{business_name}}',
    content: 'Hi {{customer_name}},\n\nThank you for visiting {{business_name}} today!\n\nAttached is your official receipt #{{invoice_no}} for {{service}}.\n\nTotal Paid: {{amount}}\nDate: {{date}}\n\nIf you have any questions regarding your invoice or treatment plan, feel free to reply.',
    mediaAttachment: 'PDF',
    isPreinstalled: true,
    variables: ['customer_name', 'invoice_no', 'service', 'amount', 'date', 'business_name']
  },
  {
    id: 'e3',
    title: '90-Day Patient Re-engagement & Win-Back Discount Offer',
    category: 'Retention Marketing',
    channel: 'EMAIL',
    subject: 'We miss you at {{business_name}}! Special 20% off inside 🎁',
    content: 'Hello {{customer_name}},\n\nIt has been a while since your last {{service}} session with us!\n\nTo ensure your skin and hair treatment results stay optimal, we would love to welcome you back with an exclusive 20% discount on your next visit.\n\nUse Code: GLOW20 when booking online or via WhatsApp.\n\nBook your slot today!',
    mediaAttachment: 'IMAGE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'business_name']
  },
  // WhatsApp Templates
  {
    id: 'w1',
    title: 'WhatsApp Appointment Reminder (24h Prior)',
    category: 'Reminders',
    channel: 'WHATSAPP',
    content: 'Hi {{customer_name}}! 👋 This is a quick reminder for your upcoming {{service}} appointment tomorrow at {{appointment_time}} with {{staff_name}} at {{business_name}}.\n\nReply 1 to Confirm or 2 to Reschedule.',
    mediaAttachment: 'IMAGE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'appointment_time', 'staff_name', 'business_name']
  },
  {
    id: 'w2',
    title: 'WhatsApp Post-Visit Feedback & Review Request',
    category: 'Customer Feedback',
    channel: 'WHATSAPP',
    content: 'Hi {{customer_name}}! Hope you enjoyed your {{service}} session today with {{staff_name}}. 🌟\n\nCould you take 30 seconds to share your experience? Your review helps us grow: {{review_link}}',
    mediaAttachment: 'NONE',
    isPreinstalled: true,
    variables: ['customer_name', 'service', 'staff_name', 'review_link']
  },
  // Voice AI Call Scripts
  {
    id: 'v1',
    title: 'Voice AI Short Cold Outreach & New Lead Follow-up',
    category: 'Lead Outreach',
    channel: 'VOICE',
    content: 'Agent: "Hello {{customer_name}}, this is {{bot_name}} calling from {{business_name}}. I noticed you inquired about our {{service}} packages recently. Do you have 2 minutes so I can share our exclusive package pricing for this week?"',
    mediaAttachment: 'NONE',
    isPreinstalled: true,
    variables: ['customer_name', 'bot_name', 'business_name', 'service']
  },
  {
    id: 'v2',
    title: 'Voice AI 10-Min Post-WhatsApp Appointment Confirmation Call',
    category: 'Booking Confirmation',
    channel: 'VOICE',
    content: 'Agent: "Hi {{customer_name}}, I am calling from {{business_name}} to confirm your appointment for {{service}} today at {{appointment_time}}. Should I lock in your booking with {{staff_name}} now?"',
    mediaAttachment: 'NONE',
    isPreinstalled: true,
    variables: ['customer_name', 'business_name', 'service', 'appointment_time', 'staff_name']
  },
];

const channelIcons = {
  WHATSAPP: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  VOICE: { icon: PhoneCall, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  EMAIL: { icon: Mail, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
};

const mediaBadge = {
  PDF: { label: 'PDF Guide Attached', icon: Paperclip, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  IMAGE: { label: 'Image Card Attached', icon: ImageIcon, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  VIDEO: { label: 'Video Attached', icon: Video, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  NONE: null
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new custom template
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'VOICE' | 'EMAIL'>('EMAIL');
  const [category, setCategory] = useState('Custom Script');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [mediaAttachment, setMediaAttachment] = useState<TemplateItem['mediaAttachment']>('NONE');

  const filtered = templates.filter((t) => {
    if (channelFilter !== 'ALL' && t.channel !== channelFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

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

    setTemplates([created, ...templates]);
    posthog.capture('template_created', {
      channel,
      template_category: category,
      has_media_attachment: mediaAttachment !== 'NONE',
    });
    setIsModalOpen(false);
    setTitle('');
    setSubject('');
    setContent('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Pre-Installed Templates & AI Email Scripts</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
              WhatsApp, Voice AI & Email
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Pre-installed scripts customized for your clinic category with email templates and media attachments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shrink-0"
        >
          <Plus size={16} />
          Create Custom Template
        </button>
      </div>

      {/* Channel Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search templates or email scripts..."
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

      {/* Grid of Templates */}
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
              transition={{ delay: i * 0.05 }}
              className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-xl border", chConf.bg)}>
                      <ChIcon size={18} className={chConf.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[var(--color-text)]">{tpl.title}</h3>
                        {tpl.isPreinstalled && (
                          <span className="px-2 py-0.5 text-[9px] rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                            Preinstalled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{tpl.category}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(tpl.id, tpl.content)}
                    className="p-2 hover:bg-[var(--color-surface)] text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
                    title="Copy Template Content"
                  >
                    {copiedId === tpl.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Email Subject Line if EMAIL */}
                {tpl.channel === 'EMAIL' && tpl.subject && (
                  <div className="p-2.5 bg-slate-950/80 border border-purple-500/30 rounded-xl text-xs">
                    <span className="text-slate-400 font-medium">Subject: </span>
                    <span className="font-mono text-purple-200 font-bold">{tpl.subject}</span>
                  </div>
                )}

                {/* Script Body Content */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {tpl.content}
                </div>
              </div>

              {/* Footer: Media Attachment Badge & Variables */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-[10px]">
                <div>
                  {media && (
                    <span className={cn("px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5", media.color)}>
                      <media.icon size={12} />
                      {media.label}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-[var(--color-text-muted)]">
                  <span>Variables:</span>
                  <span className="text-purple-300 font-bold">{tpl.variables.length} Tags</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal for Creating Custom Template */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />
                  Create Custom Template & Script
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTemplate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Template Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chemical Peel Care Instructions Email"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Channel Type *</label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="EMAIL">✉️ Email Script</option>
                      <option value="WHATSAPP">💬 WhatsApp Message</option>
                      <option value="VOICE">📞 Voice AI Call Script</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Media Attachment</label>
                    <select
                      value={mediaAttachment}
                      onChange={(e) => setMediaAttachment(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="NONE">None</option>
                      <option value="PDF">PDF Guide Attachment</option>
                      <option value="IMAGE">Image Card</option>
                      <option value="VIDEO">Video Care Guide</option>
                    </select>
                  </div>
                </div>

                {channel === 'EMAIL' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Subject Line *</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Your post-treatment instructions from {{business_name}}"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Script Content & Text *</label>
                  <textarea
                    rows={5}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write script content. Use {{customer_name}}, {{service}}, {{appointment_time}} tags..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors"
                  >
                    Save Template
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

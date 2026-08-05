'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  MessageCircle, 
  Phone, 
  Star, 
  AlertTriangle, 
  Paperclip, 
  Copy, 
  Check, 
  Send,
  X,
  Sparkles,
  Image as ImageIcon,
  FileDown,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateItem {
  id: string;
  name: string;
  category: 'whatsapp' | 'voice_cold' | 'voice_review' | 'voice_unsatisfied';
  industry: string;
  content: string;
  variables: string[];
  mediaType?: 'pdf' | 'image' | 'video';
  mediaUrl?: string;
  isPreinstalled: boolean;
}

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: '1',
    name: 'Appointment Confirmation & Directions',
    category: 'whatsapp',
    industry: 'Skin & Hair Clinic',
    content: 'Hi {{customer_name}}, your appointment for {{service}} with {{staff_name}} is confirmed for {{appointment_time}} at {{clinic_name}}. Please see attached directions brochure.',
    variables: ['customer_name', 'service', 'staff_name', 'appointment_time', 'clinic_name'],
    mediaType: 'pdf',
    mediaUrl: 'Clinic_Location_Guide.pdf',
    isPreinstalled: true,
  },
  {
    id: '2',
    name: 'Post-Treatment Review Request (WhatsApp)',
    category: 'whatsapp',
    industry: 'Skin & Hair Clinic',
    content: 'Dear {{customer_name}}, thank you for visiting {{clinic_name}} today! How was your {{service}} session with {{staff_name}}? Rate us on Google: {{review_link}}',
    variables: ['customer_name', 'clinic_name', 'service', 'staff_name', 'review_link'],
    mediaType: 'image',
    mediaUrl: 'Review_Card.png',
    isPreinstalled: true,
  },
  {
    id: '3',
    name: 'Short Cold Outreach (Voice AI)',
    category: 'voice_cold',
    industry: 'Skin & Hair Clinic',
    content: 'Hello {{customer_name}}! This is {{bot_name}} calling from {{clinic_name}}. We noticed you enquired about {{service}} on our website. We are offering a complimentary 15-minute consultation this week—would morning or afternoon suit you best?',
    variables: ['customer_name', 'bot_name', 'clinic_name', 'service'],
    isPreinstalled: true,
  },
  {
    id: '4',
    name: 'Post-Visit Satisfaction & Review Request (Voice AI)',
    category: 'voice_review',
    industry: 'Skin & Hair Clinic',
    content: 'Hi {{customer_name}}, {{bot_name}} here from {{clinic_name}} checking in after your {{service}} yesterday! Are you feeling comfortable, and do you have any questions for {{staff_name}}? If you loved your experience, may I text you our Google review link?',
    variables: ['customer_name', 'bot_name', 'clinic_name', 'service', 'staff_name'],
    isPreinstalled: true,
  },
  {
    id: '5',
    name: 'Unsatisfied Customer Escalation (Voice AI)',
    category: 'voice_unsatisfied',
    industry: 'Skin & Hair Clinic',
    content: 'Hello {{customer_name}}, I am calling from {{clinic_name}} regarding your recent feedback on {{service}}. We sincerely apologize that your session fell short of expectations. I would love to connect you directly with our Clinic Director {{manager_name}} for a resolution.',
    variables: ['customer_name', 'clinic_name', 'service', 'manager_name'],
    isPreinstalled: true,
  },
  {
    id: '6',
    name: 'Seasonal Special Treatment Package (WhatsApp)',
    category: 'whatsapp',
    industry: 'Skin & Hair Clinic',
    content: 'Hello {{customer_name}}! ✨ Exclusive Offer: Get 30% OFF on all {{service}} packages this month at {{clinic_name}}. Attached is our treatment video preview!',
    variables: ['customer_name', 'service', 'clinic_name'],
    mediaType: 'video',
    mediaUrl: 'Special_Offer_Treatment.mp4',
    isPreinstalled: true,
  }
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Template Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<TemplateItem['category']>('whatsapp');
  const [newContent, setNewContent] = useState('');
  const [newMediaType, setNewMediaType] = useState<'pdf' | 'image' | 'video' | ''>('');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const filtered = templates.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;

    const created: TemplateItem = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      industry: 'Custom',
      content: newContent,
      variables: newContent.match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/[{}]/g, '')) || [],
      mediaType: newMediaType ? newMediaType : undefined,
      mediaUrl: newMediaUrl ? newMediaUrl : undefined,
      isPreinstalled: false,
    };

    setTemplates([created, ...templates]);
    setIsModalOpen(false);
    setNewName('');
    setNewContent('');
    setNewMediaType('');
    setNewMediaUrl('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Communication Templates</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">Pre-installed Active</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Pre-installed & custom templates tuned for your business category with media attachments and voice scripts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shrink-0"
        >
          <Plus size={16} />
          Create Custom Template
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Templates', icon: FileText },
            { id: 'whatsapp', label: '💬 WhatsApp Messages', icon: MessageCircle },
            { id: 'voice_cold', label: '📞 Voice Cold Outreach', icon: Phone },
            { id: 'voice_review', label: '⭐ Voice Review Request', icon: Star },
            { id: 'voice_unsatisfied', label: '🚨 Voice Escalation', icon: AlertTriangle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5",
                selectedCategory === tab.id
                  ? "bg-purple-600 text-white shadow"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={cn(
                  "px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase tracking-wider",
                  t.category === 'whatsapp' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  t.category === 'voice_cold' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  t.category === 'voice_review' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {t.category.replace('_', ' ')}
                </span>
                {t.isPreinstalled && (
                  <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                    <Sparkles size={10} /> Pre-installed
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-[var(--color-text)] mb-2 group-hover:text-purple-300 transition-colors">
                {t.name}
              </h3>

              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono leading-relaxed mb-3">
                {t.content}
              </div>

              {/* Media Attachment Badge */}
              {t.mediaType && (
                <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg border border-slate-700 text-xs text-slate-300 mb-3">
                  {t.mediaType === 'pdf' && <FileDown size={14} className="text-red-400" />}
                  {t.mediaType === 'image' && <ImageIcon size={14} className="text-emerald-400" />}
                  {t.mediaType === 'video' && <Video size={14} className="text-blue-400" />}
                  <span className="font-medium text-slate-200">Attachment:</span>
                  <span className="truncate text-slate-400">{t.mediaUrl}</span>
                </div>
              )}

              {/* Variables */}
              <div className="flex flex-wrap gap-1 mb-4">
                {t.variables.map(v => (
                  <span key={v} className="px-2 py-0.5 text-[10px] rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-muted)]">{t.industry}</span>
              <button
                onClick={() => handleCopy(t.id, t.content)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors flex items-center gap-1.5"
              >
                {copiedId === t.id ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Custom Template Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="text-purple-400" size={18} />
                  Create Custom Communication Template
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. VIP Consultation Follow-up"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category & Type</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="whatsapp">💬 WhatsApp Message Template</option>
                    <option value="voice_cold">📞 Voice AI Cold Outreach Script</option>
                    <option value="voice_review">⭐ Voice AI Review Request</option>
                    <option value="voice_unsatisfied">🚨 Voice AI Unsatisfied Escalation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Template Content & Script</label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Type your script... Use variables like {{customer_name}}, {{service}}, {{appointment_time}}."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Variables enclosed in double braces will automatically auto-fill from customer records.</p>
                </div>

                {newCategory === 'whatsapp' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Media Attachment</label>
                      <select
                        value={newMediaType}
                        onChange={(e) => setNewMediaType(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="">None</option>
                        <option value="pdf">PDF Document</option>
                        <option value="image">Image Card</option>
                        <option value="video">Video Preview</option>
                      </select>
                    </div>

                    {newMediaType && (
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">File Name / URL</label>
                        <input
                          type="text"
                          value={newMediaUrl}
                          onChange={(e) => setNewMediaUrl(e.target.value)}
                          placeholder="e.g. Brochure.pdf"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm transition-colors"
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

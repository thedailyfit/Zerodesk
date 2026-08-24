'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import Link from 'next/link';
import { 
  FileText, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  ArrowLeft, 
  Paperclip, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Eye, 
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateTemplatePage() {
  const { currentNiche, nicheConfig } = useNiche();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'VOICE'>('WHATSAPP');
  const [category, setCategory] = useState('Booking Confirmation');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [mediaAttachment, setMediaAttachment] = useState<'NONE' | 'PDF' | 'IMAGE' | 'VIDEO'>('NONE');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);

  const availableVariables = [
    { token: '{{customer_name}}', label: `${nicheConfig.terminology.customer} Name`, example: 'Ananya Sharma' },
    { token: '{{service}}', label: `${nicheConfig.terminology.service} Name`, example: currentNiche === 'dental' ? 'Root Canal Treatment' : currentNiche === 'spa' ? 'Ayurvedic Massage' : 'Signature Procedure' },
    { token: '{{appointment_time}}', label: 'Time & Date', example: 'Tomorrow at 11:30 AM' },
    { token: '{{staff_name}}', label: `${nicheConfig.terminology.staff} Name`, example: currentNiche === 'dental' ? 'Dr. Sharma' : currentNiche === 'spa' ? 'Maya' : 'Zara' },
    { token: '{{business_name}}', label: 'Business Name', example: nicheConfig.label },
    { token: '{{booking_link}}', label: 'Booking URL', example: 'zerodesk.app/book/slot-12' },
    { token: '{{invoice_amount}}', label: 'Invoice Total', example: '₹3,500' }
  ];

  const handleInsertVariable = (token: string) => {
    setContent(prev => `${prev} ${token} `);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKB} KB`;
      setAttachedFile({
        name: file.name,
        size: sizeStr
      });
      if (file.type.includes('pdf')) setMediaAttachment('PDF');
      else if (file.type.includes('image')) setMediaAttachment('IMAGE');
      else if (file.type.includes('video')) setMediaAttachment('VIDEO');
    }
  };

  const generatePreview = () => {
    let text = content || 'Start typing message body to see live preview...';
    availableVariables.forEach(v => {
      text = text.replace(new RegExp(v.token.replace(/[{}]/g, '\\$&'), 'g'), v.example);
    });
    return text;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newTemplate = {
      id: `tmpl-${Date.now()}`,
      title,
      channel,
      category,
      subject: channel === 'EMAIL' ? subject : undefined,
      content,
      mediaAttachment,
      attachedFileName: attachedFile?.name,
      isPreinstalled: false,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Save to local storage for current niche
    const key = `zerodesk_custom_templates_${currentNiche}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([newTemplate, ...existing]));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Success Notification */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-xl text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Template successfully created and saved to active workflows!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <Link href="/templates/pre-installed" className="hover:text-blue-500 transition-colors flex items-center gap-1">
              <FileText size={12} />
              <span>Templates</span>
            </Link>
            <ChevronRight size={12} />
            <span className="text-blue-500 font-semibold">Create Template</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <span>Create Custom Message Template</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Multi-Channel
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Design dynamic notification scripts, WhatsApp broadcasts, and appointment reminders with variables and file attachments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/templates/pre-installed"
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <FileText size={14} className="text-blue-500" />
            <span>Pre-installed Templates</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Form Builder & Live Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Builder */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSave} className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4 text-xs">
            {/* Channel Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Communication Channel *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400' },
                  { id: 'EMAIL', label: 'Email', icon: Mail, color: 'text-blue-400' },
                  { id: 'VOICE', label: 'Voice Script', icon: PhoneCall, color: 'text-amber-400' },
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id as any)}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2.5 rounded-xl border font-bold transition-all",
                      channel === ch.id
                        ? "bg-blue-600/10 border-blue-500 text-blue-400 shadow-sm"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <ch.icon size={15} className={ch.color} />
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24-Hour Pre-Appointment Reminder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workflow Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Booking Confirmation">Booking Confirmation</option>
                  <option value="Pre-Care Instructions">Pre-Care Instructions</option>
                  <option value="Post-Procedure Care">Post-Procedure Care</option>
                  <option value="Payment & Invoicing">Payment & Invoicing</option>
                  <option value="Lapsed Recall">Lapsed Customer Recall</option>
                  <option value="Special Promotional Offer">Special Promotional Offer</option>
                </select>
              </div>
            </div>

            {/* Email Subject (if channel === EMAIL) */}
            {channel === 'EMAIL' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Important instructions regarding your upcoming {{service}} session"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Dynamic Variable Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-semibold flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-400" />
                  <span>Insert Dynamic Variables</span>
                </label>
                <span className="text-[10px] text-[var(--color-text-muted)]">Click chip to inject into text</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                {availableVariables.map(v => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => handleInsertVariable(v.token)}
                    className="px-2 py-1 text-[11px] bg-[var(--color-bg-secondary)] hover:bg-blue-600/20 hover:text-blue-400 border border-[var(--color-border)] rounded-lg font-mono text-[var(--color-text-secondary)] transition-colors"
                    title={`Inserts example: ${v.example}`}
                  >
                    + {v.token}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Body */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Message Content / Script *</label>
              <textarea
                rows={7}
                required
                placeholder="Dear {{customer_name}}, this is a quick reminder for your {{service}} tomorrow at {{appointment_time}} with {{staff_name}}..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-[var(--color-text)] font-sans text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Document / Media Attachment Dropzone */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Paperclip size={13} className="text-blue-400" />
                  <span>Media / Document Attachment (PDF, Image, Video)</span>
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Optional for WhatsApp & Email</span>
              </label>

              <div className="p-3.5 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] hover:border-blue-500/60 rounded-xl relative transition-all">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.mp4,.mov"
                  onChange={handleFileAttach}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {attachedFile ? (
                  <div className="flex items-center justify-between p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-blue-600 text-white shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[var(--color-text)] truncate">{attachedFile.name}</p>
                        <p className="text-[10px] text-blue-400">{attachedFile.size} • {mediaAttachment} Attachment</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachedFile(null);
                        setMediaAttachment('NONE');
                      }}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-1">
                    <Upload size={18} className="mx-auto text-blue-400 opacity-80" />
                    <p className="font-semibold text-xs text-[var(--color-text)]">Click or Drag & Drop Attachment</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Attach PDF brochure, pre-care guides, or treatment image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Will be instantly available in WhatsApp / Email automations
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                <Save size={14} />
                <span>Save Template</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Live Dynamic Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-blue-500" />
                <span>Live Channel Preview</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold">
                {channel}
              </span>
            </div>

            {/* Smartphone / WhatsApp Mockup */}
            {channel === 'WHATSAPP' && (
              <div className="rounded-2xl bg-[#0b141a] border border-slate-800 p-4 shadow-xl text-xs space-y-3 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                      ZD
                    </div>
                    <span>{nicheConfig.label} Official</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Verified AI</span>
                </div>

                <div className="bg-[#1f2c34] p-3.5 rounded-2xl rounded-tl-none text-slate-100 space-y-2.5 max-w-[95%] shadow-md">
                  {attachedFile && (
                    <div className="p-2 bg-[#111b21] rounded-xl flex items-center gap-2 border border-slate-700">
                      <FileText size={16} className="text-emerald-400" />
                      <span className="text-[11px] truncate font-medium">{attachedFile.name}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line text-xs leading-relaxed">{generatePreview()}</p>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-slate-400">
                    <span>11:32 AM</span>
                    <Check size={11} className="text-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Email Mockup */}
            {channel === 'EMAIL' && (
              <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 shadow-xl text-xs space-y-3 font-sans">
                <div className="space-y-1.5 pb-2 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[var(--color-text-muted)] font-semibold">From:</span>
                    <span className="text-[var(--color-text)] font-medium">appointments@{nicheConfig.id}-clinic.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[var(--color-text-muted)] font-semibold">Subject:</span>
                    <span className="text-blue-400 font-bold truncate">{subject || 'No subject entered yet'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[var(--color-bg-secondary)] rounded-xl text-[var(--color-text)] whitespace-pre-line leading-relaxed border border-[var(--color-border)]">
                  {generatePreview()}
                </div>

                {attachedFile && (
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-[11px]">
                    <Paperclip size={12} className="text-blue-400" />
                    <span className="text-[var(--color-text)] font-medium">{attachedFile.name}</span>
                    <span className="text-[10px] text-blue-400 ml-auto">{attachedFile.size}</span>
                  </div>
                )}
              </div>
            )}

            {/* Voice Script Mockup */}
            {channel === 'VOICE' && (
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-4 shadow-xl text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall size={14} />
                    <span>Voice AI Telephony TTS Speech</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 font-mono">110 WPM</span>
                </div>
                <p className="p-3 bg-black/40 rounded-xl text-amber-100 whitespace-pre-line leading-relaxed italic border border-amber-500/20">
                  "{generatePreview()}"
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(generatePreview());
                setCopiedPreview(true);
                setTimeout(() => setCopiedPreview(false), 2000);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-semibold transition-colors"
            >
              {copiedPreview ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Rendered Preview</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

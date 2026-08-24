'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import Link from 'next/link';
import { 
  Mail, 
  FileText, 
  Send, 
  Paperclip, 
  Plus, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  Save, 
  Eye, 
  Smartphone, 
  Monitor, 
  Upload, 
  Trash2,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  preheader: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  attachmentName?: string;
}

export default function EmailTemplatesPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const defaultEmailTemplates: EmailTemplate[] = [
    {
      id: 'em-1',
      title: 'Appointment Confirmation & Directions',
      category: 'Booking',
      subject: `Your {{service}} appointment at ${nicheConfig.label} is confirmed!`,
      preheader: `We look forward to welcoming you on {{appointment_time}}.`,
      body: `Dear {{customer_name}},\n\nThank you for choosing ${nicheConfig.label}. Your scheduled session for {{service}} with {{staff_name}} has been confirmed for {{appointment_time}}.\n\nClinic Address:\n104 Luxury Boulevard, Health District\n\nPlease arrive 10 minutes prior to complete initial diagnostic assessment. If you need to reschedule or have any questions, simply reply to this email.`,
      ctaText: 'View Appointment & Directions',
      ctaUrl: 'https://zerodesk.app/my-booking'
    },
    {
      id: 'em-2',
      title: 'Invoice & Digital Treatment Receipt',
      category: 'Billing',
      subject: `Receipt for your recent visit to ${nicheConfig.label} [INV-{{invoice_no}}]`,
      preheader: `Thank you for your visit. Your detailed invoice is attached.`,
      body: `Dear {{customer_name}},\n\nThank you for visiting ${nicheConfig.label} today! We hope you had a rejuvenating and comfortable experience.\n\nAttached is your official digital GST tax invoice detailing procedures performed and payment breakdown of {{invoice_amount}}.\n\nWe look forward to seeing you at your next scheduled review!`,
      ctaText: 'Download Official PDF Receipt',
      ctaUrl: 'https://zerodesk.app/invoice/download',
      attachmentName: 'Official_Invoice_Summary.pdf'
    },
    {
      id: 'em-3',
      title: 'Post-Care & Recovery Protocol',
      category: 'Care Guidelines',
      subject: `Post-procedure recovery instructions for your {{service}} session`,
      preheader: `Essential instructions for maximum results and soothing recovery.`,
      body: `Dear {{customer_name}},\n\nHere is your official post-care guide following your {{service}} session with {{staff_name}} today.\n\nKey Guidelines:\n1. Keep treated area clean and avoid harsh chemical products for 48 hours.\n2. Stay well hydrated and apply recommended soothing serum twice daily.\n3. Avoid strenuous exercise or direct UV heat exposure for the next 24 hours.\n\nIf you experience any unusual tenderness, reply or call our direct helpline.`,
      ctaText: 'Download Full Post-Care PDF',
      ctaUrl: 'https://zerodesk.app/care-sheet',
      attachmentName: 'Post_Treatment_Care_Guide.pdf'
    }
  ];

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(defaultEmailTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('em-1');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTemplate = emailTemplates.find(t => t.id === activeTemplateId) || emailTemplates[0];

  // Editor form state for active template
  const [subject, setSubject] = useState(activeTemplate.subject);
  const [preheader, setPreheader] = useState(activeTemplate.preheader);
  const [body, setBody] = useState(activeTemplate.body);
  const [ctaText, setCtaText] = useState(activeTemplate.ctaText || '');
  const [attachedFile, setAttachedFile] = useState<string | undefined>(activeTemplate.attachmentName);

  const handleSelectTemplate = (t: EmailTemplate) => {
    setActiveTemplateId(t.id);
    setSubject(t.subject);
    setPreheader(t.preheader);
    setBody(t.body);
    setCtaText(t.ctaText || '');
    setAttachedFile(t.attachmentName);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveActiveTemplate = () => {
    const updated = emailTemplates.map(t => {
      if (t.id === activeTemplate.id) {
        return {
          ...t,
          subject,
          preheader,
          body,
          ctaText,
          attachmentName: attachedFile
        };
      }
      return t;
    });
    setEmailTemplates(updated);
    showToast('Email template successfully saved & updated!');
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      showToast(`Test email successfully sent to ${testEmailAddress}!`);
      setTestEmailAddress('');
    }, 1200);
  };

  const renderPreviewText = (text: string) => {
    return text
      .replace(/{{customer_name}}/g, 'Ananya Sharma')
      .replace(/{{service}}/g, currentNiche === 'dental' ? 'Root Canal Treatment' : currentNiche === 'spa' ? 'Ayurvedic Abhyanga' : 'Signature Care')
      .replace(/{{appointment_time}}/g, 'Tomorrow at 11:30 AM')
      .replace(/{{staff_name}}/g, currentNiche === 'dental' ? 'Dr. Sharma' : currentNiche === 'spa' ? 'Maya' : 'Zara')
      .replace(/{{invoice_no}}/g, 'ZD-2026-948')
      .replace(/{{invoice_amount}}/g, '₹4,500');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <span className="text-[var(--color-text)]">Templates</span>
            <ChevronRight size={12} />
            <span className="text-blue-500 font-semibold">Email Templates & Scripts</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <span>Email Templates & Scripts Hub</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Transactional & Marketing
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Design branded HTML emails for automated appointment confirmations, PDF receipts, and post-procedure care sequences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/templates/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            <span>New Custom Email</span>
          </Link>
        </div>
      </div>

      {/* Main 3-Column Layout: Template Picker, Live Editor, Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider px-1">
              Active Email Templates
            </span>
            <div className="space-y-1.5 pt-1">
              {emailTemplates.map(t => {
                const isSelected = t.id === activeTemplate.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left transition-all flex flex-col gap-1",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md font-semibold"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]"
                    )}
                  >
                    <span className="text-xs truncate font-bold">{t.title}</span>
                    <div className="flex items-center justify-between text-[10px] opacity-80">
                      <span>{t.category}</span>
                      {t.attachmentName && (
                        <span className="flex items-center gap-0.5 text-blue-200">
                          <Paperclip size={10} />
                          PDF
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Email Dispatch Card */}
          <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl space-y-3 text-xs">
            <span className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <Send size={13} className="text-blue-500" />
              <span>Send Live Test Email</span>
            </span>
            <form onSubmit={handleSendTestEmail} className="space-y-2">
              <input
                type="email"
                required
                placeholder="your.email@company.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="w-full p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSendingTest || !testEmailAddress}
                className="w-full py-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSendingTest ? 'Sending...' : 'Dispatch Test'}
              </button>
            </form>
          </div>
        </div>

        {/* Center Column: Email Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 size={14} className="text-blue-500" />
                <span>Editing: {activeTemplate.title}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 font-bold">
                {activeTemplate.category}
              </span>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Preheader */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Inbox Preheader (Snippet Preview)</label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Body Content</label>
              <textarea
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-[var(--color-text)] font-sans text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* CTA Button Text */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Call-To-Action (CTA) Button</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. View Appointment Details"
                className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Attachment File</label>
              <div className="flex items-center gap-2 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                <Paperclip size={15} className="text-blue-400 shrink-0" />
                <input
                  type="text"
                  value={attachedFile || ''}
                  onChange={(e) => setAttachedFile(e.target.value)}
                  placeholder="e.g. Treatment_Receipt.pdf (or leave empty)"
                  className="w-full bg-transparent text-[var(--color-text)] text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)] flex justify-end">
              <button
                type="button"
                onClick={handleSaveActiveTemplate}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                <Save size={14} />
                <span>Save Email Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Email Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-blue-500" />
                <span>Visual Email Preview</span>
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn("p-1 rounded", previewDevice === 'desktop' ? "bg-blue-600 text-white" : "text-slate-400")}
                  title="Desktop View"
                >
                  <Monitor size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn("p-1 rounded", previewDevice === 'mobile' ? "bg-blue-600 text-white" : "text-slate-400")}
                  title="Mobile View"
                >
                  <Smartphone size={13} />
                </button>
              </div>
            </div>

            {/* Email Shell */}
            <div className={cn(
              "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden transition-all text-xs font-sans",
              previewDevice === 'mobile' ? "max-w-[280px] mx-auto" : "w-full"
            )}>
              {/* Email Header Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
                <h4 className="font-bold text-sm tracking-tight">{nicheConfig.label}</h4>
                <p className="text-[10px] text-blue-100 opacity-90">Official Customer Notification</p>
              </div>

              <div className="p-4 space-y-3 text-[var(--color-text)]">
                <div className="pb-2 border-b border-[var(--color-border)] space-y-1">
                  <p className="font-bold text-xs leading-snug">{renderPreviewText(subject)}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] italic">{renderPreviewText(preheader)}</p>
                </div>

                <div className="whitespace-pre-line leading-relaxed text-[11px] text-[var(--color-text-secondary)]">
                  {renderPreviewText(body)}
                </div>

                {ctaText && (
                  <div className="pt-2 text-center">
                    <div className="inline-block px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs shadow-md">
                      {ctaText}
                    </div>
                  </div>
                )}

                {attachedFile && (
                  <div className="p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg flex items-center gap-2 text-[10px]">
                    <Paperclip size={12} className="text-blue-400" />
                    <span className="font-medium truncate">{attachedFile}</span>
                  </div>
                )}
              </div>

              {/* Email Footer */}
              <div className="p-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] text-center text-[9px] text-[var(--color-text-muted)] space-y-0.5">
                <p>© 2026 {nicheConfig.label}. All rights reserved.</p>
                <p>Sent via ZeroDesk AI Unified Communication Engine.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

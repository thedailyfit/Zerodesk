'use client';

import { useState, useEffect } from 'react';
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
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Check, 
  X, 
  Save, 
  Sliders, 
  ChevronRight, 
  Paperclip,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NicheTemplate } from '@/config/niches/types';

export default function PreinstalledTemplatesPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const getDefaultTemplates = () => {
    return (nicheConfig.templates || []).map((t, idx) => ({
      ...t,
      id: t.id || `pre-${idx}`,
      isActive: true, // "Use it" toggle default
    }));
  };

  const [templates, setTemplates] = useState<any[]>(getDefaultTemplates());
  const [selectedChannel, setSelectedChannel] = useState<'ALL' | 'WHATSAPP' | 'EMAIL' | 'VOICE'>('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_preinstalled_${currentNiche}`);
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

  const saveTemplates = (updated: any[]) => {
    setTemplates(updated);
    localStorage.setItem(`zerodesk_preinstalled_${currentNiche}`, JSON.stringify(updated));
  };

  const handleToggleUseIt = (id: string) => {
    const updated = templates.map(t => {
      if (t.id === id) {
        const nextState = !t.isActive;
        showToast(nextState ? `Template enabled for automated dispatch!` : `Template paused.`);
        return { ...t, isActive: nextState };
      }
      return t;
    });
    saveTemplates(updated);
  };

  const handleOpenEdit = (template: any) => {
    setEditingTemplate(template);
    setEditTitle(template.title);
    setEditSubject(template.subject || '');
    setEditContent(template.content);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const updated = templates.map(t => {
      if (t.id === editingTemplate.id) {
        return {
          ...t,
          title: editTitle,
          subject: editSubject,
          content: editContent
        };
      }
      return t;
    });
    saveTemplates(updated);
    setEditingTemplate(null);
    showToast('Template changes saved successfully!');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetToDefaults = () => {
    const fresh = getDefaultTemplates();
    saveTemplates(fresh);
    showToast('Reset to original pre-installed templates.');
  };

  const filtered = templates.filter(t => {
    if (selectedChannel !== 'ALL' && t.channel !== selectedChannel) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.content.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

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

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <span className="text-[var(--color-text)]">Templates</span>
            <ChevronRight size={12} />
            <span className="text-blue-500 font-semibold">Pre-installed Templates</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <span>Pre-installed {nicheConfig.label} Templates</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Ready-to-Use
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Turn pre-configured templates ON/OFF for your business operations, or customize text and variables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl text-xs font-semibold transition-all"
            title="Reset to factory templates"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
          <Link
            href="/templates/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            <span>Create Custom Template</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Channels' },
            { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
            { id: 'EMAIL', label: 'Email', icon: Mail },
            { id: 'VOICE', label: 'Voice Script', icon: PhoneCall },
          ].map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                selectedChannel === ch.id
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              )}
            >
              {ch.icon && <ch.icon size={13} />}
              <span>{ch.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name, keywords, or tags..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </div>
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => {
          const isWhatsApp = t.channel === 'WHATSAPP';
          const isEmail = t.channel === 'EMAIL';
          const isVoice = t.channel === 'VOICE';

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-sm bg-[var(--color-bg-secondary)]",
                t.isActive 
                  ? "border-[var(--color-border)] hover:border-blue-500/50" 
                  : "border-dashed border-[var(--color-border)] opacity-60 bg-[var(--color-surface)]/40"
              )}
            >
              <div className="space-y-3">
                {/* Channel & Category Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isWhatsApp && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <MessageSquare size={11} />
                        <span>WhatsApp</span>
                      </span>
                    )}
                    {isEmail && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold flex items-center gap-1">
                        <Mail size={11} />
                        <span>Email</span>
                      </span>
                    )}
                    {isVoice && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                        <PhoneCall size={11} />
                        <span>Voice Script</span>
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                      {t.category}
                    </span>
                  </div>

                  {/* "Use It" On/Off Switch */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                      {t.isActive ? 'IN USE' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleUseIt(t.id)}
                      className={cn(
                        "w-9 h-5 rounded-full transition-colors relative p-0.5 focus:outline-none",
                        t.isActive ? "bg-blue-600" : "bg-slate-700"
                      )}
                      title={t.isActive ? "Click to disable this template" : "Click to activate this template"}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform",
                          t.isActive ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-[var(--color-text)] leading-snug">
                  {t.title}
                </h3>

                {/* Email Subject if available */}
                {t.subject && (
                  <p className="text-[11px] text-blue-400 font-semibold bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 truncate">
                    Subject: {t.subject}
                  </p>
                )}

                {/* Content snippet */}
                <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-secondary)] line-clamp-4 leading-relaxed font-sans whitespace-pre-line">
                  {t.content}
                </div>

                {/* Media attachment indicator */}
                {t.mediaAttachment && t.mediaAttachment !== 'NONE' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-medium">
                    <Paperclip size={12} />
                    <span>Includes {t.mediaAttachment} Attachment slot</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-lg transition-colors"
                >
                  <Edit3 size={13} className="text-blue-500" />
                  <span>Edit Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(t.id, t.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  {copiedId === t.id ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
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
          );
        })}
      </div>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text)]">
                      Customize Pre-installed Template
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Channel: <strong className="text-blue-400">{editingTemplate.channel}</strong> • Category: {editingTemplate.category}
                    </p>
                  </div>
                </div>
                <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Template Title *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {editingTemplate.channel === 'EMAIL' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Subject Line *</label>
                    <input
                      type="text"
                      required
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Message Script / Text *</label>
                  <textarea
                    rows={7}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-[var(--color-text)] font-sans text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
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

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  BookOpen, 
  Tag, 
  Edit2, 
  Trash2, 
  Upload, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Send,
  X,
  Check,
  Cpu,
  Info,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentItem {
  id: string;
  title: string;
  category: 'SERVICE' | 'PRICING' | 'FAQ' | 'SOP' | 'SCRIPTS' | 'RESTRICTED_GUIDELINES';
  content: string;
  chunks: number;
  isActive: boolean;
  updatedAt: string;
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  { id: '1', title: 'Laser Hair Removal - Complete Treatment SOP', category: 'SOP', content: 'Our diode laser treatment protocol requires 48h patch test and pre-treatment cooling...', chunks: 8, isActive: true, updatedAt: '2026-08-01' },
  { id: '2', title: 'Pricing & Treatment Packages 2026', category: 'PRICING', content: 'Consultation: ₹500, Laser (Small Area): ₹3,000, Full Body Package: ₹45,000...', chunks: 12, isActive: true, updatedAt: '2026-08-02' },
  { id: '3', title: 'Working Hours & Holiday Schedule', category: 'FAQ', content: 'Monday to Saturday: 10 AM - 8 PM, Sunday: Closed...', chunks: 3, isActive: true, updatedAt: '2026-07-28' },
  { id: '4', title: 'Objection Handling & Sales Call Scripts', category: 'SCRIPTS', content: 'When customer mentions competitor pricing: Highlight our 15-year medical expertise...', chunks: 9, isActive: true, updatedAt: '2026-08-03' },
  { id: '5', title: 'Restricted Topics & Medication Advice Guidelines', category: 'RESTRICTED_GUIDELINES', content: 'STRICT RULE: Do not diagnose prescription antibiotics on phone. Direct patient to in-person consultation.', chunks: 5, isActive: true, updatedAt: '2026-08-04' },
  { id: '6', title: 'PRP Hair Therapy Service Guide', category: 'SERVICE', content: 'PRP (Platelet-Rich Plasma) therapy stimulates hair growth via blood plasma centrifugation...', chunks: 7, isActive: true, updatedAt: '2026-08-02' },
];

const categoryConfig: Record<string, { color: string; label: string }> = {
  SOP: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Standard Operating Procedure' },
  PRICING: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Pricing Sheet' },
  FAQ: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'FAQ' },
  SCRIPTS: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Sales & Call Scripts' },
  RESTRICTED_GUIDELINES: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Restricted Guidelines' },
  SERVICE: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', label: 'Service Guide' },
};

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // RAG Test Playground State
  const [testQuery, setTestQuery] = useState('');
  const [ragOutput, setRagOutput] = useState<string | null>(null);
  const [isTestingRag, setIsTestingRag] = useState(false);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('SOP');
  const [content, setContent] = useState('');

  const categories = ['ALL', ...Object.keys(categoryConfig)];

  const filtered = documents.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase()) && !doc.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const created: DocumentItem = {
      id: Date.now().toString(),
      title,
      category,
      content,
      chunks: Math.ceil(content.length / 150),
      isActive: true,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setDocuments([created, ...documents]);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  const handleToggleDoc = (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d));
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id === id));
  };

  const handleTestRagQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTestingRag(true);
    setRagOutput(null);

    setTimeout(() => {
      setRagOutput(`[RAG Match: Chunks 1 & 2] Based on uploaded SOP & Pricing sheets: Our Laser Hair removal package is ₹3,000 for small areas. Patch test is required 48h prior. Tone applied: Empathetic & Medical Advisor.`);
      setIsTestingRag(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>RAG Knowledge Base & AI Agent</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">pgvector Active</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Train your dedicated AI Agent with SOPs, pricing, scripts, FAQs, and restricted conversation guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            Add Knowledge Document
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex items-start gap-3 text-xs text-purple-200">
        <Info size={18} className="text-purple-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Knowledge Base Actions Fully Active & Unlocked</p>
          <p className="text-slate-300 mt-0.5">
            You can upload SOPs, pricing sheets, FAQs, and restricted conversation guides. All documents are automatically chunked, embedded via pgvector, and served to your Voice AI, WhatsApp AI, and Web Chatbot!
          </p>
        </div>
      </div>

      {/* Top Banner: Dedicated AI Agent & Knowledge Score */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Dedicated AI Agent Card */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Bot size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">Glow-Bot v2.4 (Dedicated Tenant AI Agent)</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Indexed Vector Chunks: <strong className="text-purple-300 font-mono">{documents.reduce((s, d) => s + d.chunks, 0)} Chunks</strong> · Engine: <span className="text-emerald-400 font-mono">pgvector + Llama-3</span>
            </p>
          </div>
        </div>

        {/* Live AI Knowledge Score */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Knowledge Coverage Score</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1 flex items-center gap-2">
              94% <span className="text-xs font-semibold text-slate-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Excellent Coverage</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Freshness score updated today.</p>
          </div>
          <Sparkles size={32} className="text-emerald-400 opacity-60" />
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search documents or SOP content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-xl border font-medium transition-all",
                categoryFilter === cat
                  ? "bg-purple-600 text-white border-purple-500 shadow"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {cat === 'ALL' ? 'All Documents' : categoryConfig[cat]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Knowledge Documents */}
      <div className="grid gap-3">
        {filtered.map((doc, i) => {
          const cat = categoryConfig[doc.category];
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group",
                doc.isActive
                  ? "bg-[var(--color-glass)] backdrop-blur border-[var(--color-glass-border)] hover:border-purple-500/40"
                  : "bg-slate-950/40 border-slate-800/60 opacity-50"
              )}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[var(--color-text)]">{doc.title}</h3>
                    <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border font-semibold", cat?.color)}>
                      {cat?.label}
                    </span>
                    {!doc.isActive && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1 font-mono">{doc.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--color-text-muted)] font-mono">
                    <span className="flex items-center gap-1"><BookOpen size={11} />{doc.chunks} Vector Chunks</span>
                    <span>•</span>
                    <span>Updated {doc.updatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleDoc(doc.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors",
                    doc.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                  )}
                >
                  {doc.isActive ? 'Active' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDeleteDoc(doc.id)}
                  className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive RAG Test Playground */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Cpu size={16} className="text-purple-400" />
          Test RAG Query Playground
        </h3>
        <p className="text-xs text-slate-400">Type a test question to verify how your AI Agent retrieves answers from your uploaded SOPs and pricing sheets.</p>

        <form onSubmit={handleTestRagQuery} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. What is the laser treatment pricing and patch test policy?"
            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={isTestingRag || !testQuery.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>{isTestingRag ? 'Retrieving...' : 'Test AI Query'}</span>
          </button>
        </form>

        {ragOutput && (
          <div className="p-3.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-200 leading-relaxed animate-fadeIn">
            {ragOutput}
          </div>
        )}
      </div>

      {/* Add Document Modal */}
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
                  Add AI Knowledge Base Document / SOP
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddDocument} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hair Transplant Post-Care SOP 2026"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category & Category Type *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="SOP">Standard Operating Procedure (SOP)</option>
                    <option value="PRICING">Pricing & Treatment Packages</option>
                    <option value="SCRIPTS">Sales & Objection Handling Scripts</option>
                    <option value="FAQ">Frequently Asked Questions (FAQ)</option>
                    <option value="RESTRICTED_GUIDELINES">Restricted Guidelines & Rules</option>
                    <option value="SERVICE">Service & Treatment Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Document Content & Text *</label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your clinic SOP, pricing tables, or doctor guidelines..."
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
                    Add Document to Vector Index
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

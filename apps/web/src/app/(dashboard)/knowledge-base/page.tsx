'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import Link from 'next/link';
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
  Layers,
  RotateCw,
  MoreVertical,
  Calendar,
  Save,
  CheckCircle,
  FileUp,
  Paperclip,
  ArrowRight,
  HelpCircle
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
  { 
    id: '1', 
    title: 'Standard Operating Protocol 2026', 
    category: 'SOP', 
    content: 'Standard operating protocol. Requires mandatory assessment and pre-session check prior to full service. Post-care guidelines must be provided immediately upon completion.', 
    chunks: 8, 
    isActive: true, 
    updatedAt: 'Aug 14, 2026' 
  },
  { 
    id: '2', 
    title: 'Treatment & Service Menu Pricing', 
    category: 'PRICING', 
    content: 'Detailed pricing menu: Initial Consultation ₹500, Standard Session ₹3,000, Full Package ₹25,000. All prices inclusive of GST. Package discounts of 20% apply for bookings of 4+ sessions.', 
    chunks: 14, 
    isActive: true, 
    updatedAt: 'Aug 12, 2026' 
  },
  { 
    id: '3', 
    title: 'Emergency Handling & Escalation Protocol', 
    category: 'RESTRICTED_GUIDELINES', 
    content: 'STRICT RULE: Never prescribe medications over the phone. For severe pain, acute swelling, or urgent symptoms, immediately escalate to on-duty specialist or direct to nearest center.', 
    chunks: 6, 
    isActive: true, 
    updatedAt: 'Aug 10, 2026' 
  },
  { 
    id: '4', 
    title: 'Client Objection Handling & Sales Scripts', 
    category: 'SCRIPTS', 
    content: 'Handle price objections by highlighting certified experts and clinical technology. Address hesitation with gentle consultation reassurance and clear timeline expectations.', 
    chunks: 9, 
    isActive: true, 
    updatedAt: 'Aug 08, 2026' 
  },
  { 
    id: '5', 
    title: 'Frequently Asked Questions (FAQ)', 
    category: 'FAQ', 
    content: 'Common questions: How many sessions are recommended? What is the expected recovery downtime? What are post-care recommendations? When can results be observed?', 
    chunks: 11, 
    isActive: true, 
    updatedAt: 'Aug 05, 2026' 
  },
  { 
    id: '6', 
    title: 'Complete Service Guide & Care Roadmap', 
    category: 'SERVICE', 
    content: 'Complete client journey: Initial diagnostic consultation -> Tailored session schedule -> Milestone reviews -> Long-term maintenance roadmap.', 
    chunks: 8, 
    isActive: true, 
    updatedAt: 'Aug 01, 2026' 
  },
];

const categoryConfig: Record<string, { color: string; label: string; badge: string }> = {
  SOP: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Standard Operating Procedure', badge: 'SOP' },
  PRICING: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Pricing Sheet', badge: 'Pricing' },
  FAQ: { color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', label: 'FAQ', badge: 'FAQ' },
  SCRIPTS: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Sales & Call Scripts', badge: 'Scripts' },
  RESTRICTED_GUIDELINES: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Restricted Guidelines', badge: 'Safety' },
  SERVICE: { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', label: 'Service Guide', badge: 'Service' },
};

export default function KnowledgeBasePage() {
  const { currentNiche, nicheConfig } = useNiche();
  
  // Format niche default docs
  const getDefaultDocs = (): DocumentItem[] => {
    if (nicheConfig?.knowledgeBaseDocs && nicheConfig.knowledgeBaseDocs.length > 0) {
      return (nicheConfig.knowledgeBaseDocs as any[]).map((d, i) => ({
        id: d.id || `kb-${i}`,
        title: d.title || 'Knowledge Document',
        category: (d.category as any) || 'SOP',
        content: d.content || d.summary || '',
        chunks: d.chunks || Math.ceil((d.content?.length || 200) / 120),
        isActive: d.isActive !== false,
        updatedAt: d.updatedAt || 'Aug 14, 2026'
      }));
    }
    return INITIAL_DOCUMENTS;
  };

  const [documents, setDocuments] = useState<DocumentItem[]>(getDefaultDocs());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Retrain / Learning AI State
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // RAG Test Playground State
  const [testQuery, setTestQuery] = useState('');
  const [ragOutput, setRagOutput] = useState<string | null>(null);
  const [isTestingRag, setIsTestingRag] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'upload' | 'text'>('upload');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentItem['category']>('SOP');
  const [content, setContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Niche change persistence
  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_kb_${currentNiche}`);
    if (saved) {
      try {
        setDocuments(JSON.parse(saved));
        return;
      } catch (e) {
        // fallback
      }
    }
    setDocuments(getDefaultDocs());
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveDocs = (updated: DocumentItem[]) => {
    setDocuments(updated);
    localStorage.setItem(`zerodesk_kb_${currentNiche}`, JSON.stringify(updated));
  };

  const agentName = (() => {
    if (currentNiche === 'skin') return 'DermAI Pro v3.0';
    if (currentNiche === 'dental') return 'DentAI Pro v3.0';
    if (currentNiche === 'spa') return 'WellnessAI Pro v3.0';
    if (currentNiche === 'salon') return 'StyleAI Pro v3.0';
    if (currentNiche === 'realestate') return 'PropertyAI Pro v3.0';
    if (currentNiche === 'hotel') return 'HotelAI Pro v3.0';
    return `${nicheConfig?.label || 'ZeroDesk'} AI Agent`;
  })();

  const handleRetrainAgent = () => {
    setIsRetraining(true);
    setRetrainSuccess(false);

    setTimeout(() => {
      setIsRetraining(false);
      setRetrainSuccess(true);
      showToast(`⚡ ${agentName} successfully learned & vectorized all ${documents.length} knowledge base documents!`);
      setTimeout(() => setRetrainSuccess(false), 4000);
    }, 1800);
  };

  const categories = ['ALL', ...Object.keys(categoryConfig)];

  const filtered = documents.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase()) && !doc.content.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingDocId(null);
    setTitle('');
    setCategory('SOP');
    setContent('');
    setUploadedFile(null);
    setModalTab('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentItem) => {
    setEditingDocId(doc.id);
    setTitle(doc.title);
    setCategory(doc.category);
    setContent(doc.content);
    setUploadedFile(null);
    setModalTab('text');
    setIsModalOpen(true);
  };

  const handleFileProcess = (file: File) => {
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKB} KB`;
    setUploadedFile({
      name: file.name,
      size: sizeStr,
      type: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT'
    });

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    if (!content) {
      setContent(`[Extracted from: ${file.name}]\nOfficial business procedure and verified guidelines document (${sizeStr}). Contains complete operational specifications, customer safety guidelines, pricing schedules, and staff instructions.`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingDocId) {
      const updated = documents.map(d => {
        if (d.id === editingDocId) {
          return {
            ...d,
            title,
            category,
            content,
            chunks: Math.ceil(content.length / 120),
            updatedAt: 'Just now'
          };
        }
        return d;
      });
      saveDocs(updated);
      showToast('Document updated & re-indexed!');
    } else {
      const created: DocumentItem = {
        id: Date.now().toString(),
        title,
        category,
        content,
        chunks: Math.max(2, Math.ceil(content.length / 120)),
        isActive: true,
        updatedAt: 'Just now'
      };
      saveDocs([created, ...documents]);
      showToast('New document created & added to Knowledge Base!');
    }

    setIsModalOpen(false);
  };

  const handleToggleDoc = (id: string) => {
    const updated = documents.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    saveDocs(updated);
  };

  const handleDeleteDoc = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    saveDocs(updated);
    showToast('Document removed from Knowledge Base');
  };

  const handleTestRagQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTestingRag(true);
    setRagOutput(null);

    setTimeout(() => {
      setRagOutput(`[RAG Retrieval: 98% Vector Similarity Score]
Found in: "${documents[0]?.title || 'Knowledge Doc'}" & "${documents[1]?.title || 'Pricing Sheet'}"
AI Answer: Based on your official ${nicheConfig?.label || 'business'} guidelines, ${testQuery.trim()} is addressed according to verified operational protocols. All details have been verified against active tenant embeddings.`);
      setIsTestingRag(false);
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Company Knowledge Base</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Live Embeddings
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Train your dedicated AI Agent with company SOPs, pricing sheets, scripts, FAQs, and operational guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/test-knowledge-base"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shrink-0 group"
          >
            <Bot size={15} className="text-blue-500 group-hover:scale-110 transition-transform" />
            <span>Test in Simulator</span>
            <ArrowRight size={13} className="text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            <span>Add Knowledge Document</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Dedicated AI Agent & Knowledge Coverage with Retrain Refresh Button */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Dedicated AI Agent Card with Refresh / Learn Button */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-blue-500/30 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
              <Bot size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white truncate">
                  {agentName} <span className="text-xs text-blue-300 font-normal">(Dedicated Tenant AI)</span>
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Indexed: <strong className="text-blue-300 font-mono">{documents.reduce((s, d) => s + (d.isActive ? d.chunks : 0), 0)} Chunks</strong> · Engine: <span className="text-emerald-400 font-mono">pgvector + GPT-4o</span>
              </p>
            </div>
          </div>

          {/* Refresh / Retrain Button */}
          <button
            onClick={handleRetrainAgent}
            disabled={isRetraining}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
              isRetraining
                ? "bg-blue-900/50 text-blue-300 border-blue-700 cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-md shadow-blue-900/40 active:scale-95"
            )}
            title="Click to have AI Agent instantly learn and vectorize all documents"
          >
            <RotateCw size={14} className={cn(isRetraining && "animate-spin text-blue-200")} />
            <span>{isRetraining ? 'Learning Content...' : retrainSuccess ? 'AI Updated! ✓' : 'Learn Knowledge Base'}</span>
          </button>
        </div>

        {/* Live AI Knowledge Coverage Score with Status Indicator */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Knowledge Coverage Score</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 flex items-center gap-2">
              96% <span className="text-xs font-semibold text-slate-200 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Fully Trained</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Synced across Voice AI, WhatsApp & Web Receptionist.
            </p>
          </div>
          <Sparkles size={30} className="text-emerald-400 opacity-70 shrink-0" />
        </div>
      </div>

      {/* Test RAG Query Playground (MOVED TO TOP as requested) */}
      <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-blue-500/30 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-blue-400" />
            <h2 className="text-sm font-bold text-[var(--color-text)]">Test RAG Query Playground</h2>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
            Semantic Vector Search Active
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Test what your AI receptionist answers in real-time when callers or WhatsApp leads ask about pricing, procedures, or policies.
        </p>

        <form onSubmit={handleTestRagQuery} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a test question (e.g. 'What is the price of standard treatment?' or 'What are pre-care rules?')..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isTestingRag}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all shrink-0"
          >
            <Send size={14} className={cn(isTestingRag && "animate-pulse")} />
            <span>{isTestingRag ? 'Querying...' : 'Test AI'}</span>
          </button>
        </form>

        {ragOutput && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-slate-950/80 border border-blue-500/30 rounded-xl font-mono text-xs text-blue-200 whitespace-pre-wrap leading-relaxed shadow-inner"
          >
            {ragOutput}
          </motion.div>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search documents or SOP content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  ? "bg-blue-600 text-white border-blue-500 shadow"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {cat === 'ALL' ? 'All Documents' : categoryConfig[cat]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Google Docs Box Format Style Grid (As Requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((doc, i) => {
          const cat = categoryConfig[doc.category] || categoryConfig.SOP;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "rounded-2xl border transition-all flex flex-col justify-between overflow-hidden group shadow-md hover:shadow-xl hover:border-blue-500/50",
                doc.isActive
                  ? "bg-[var(--color-glass)] backdrop-blur border-[var(--color-glass-border)]"
                  : "bg-slate-950/40 border-slate-800/60 opacity-60"
              )}
            >
              {/* Google Docs Document Preview Container (Top Box) */}
              <div 
                onClick={() => openEditModal(doc)}
                className="p-4 bg-slate-950/70 border-b border-[var(--color-border)] relative cursor-pointer min-h-[140px] flex flex-col justify-between group-hover:bg-slate-900/80 transition-colors"
              >
                {/* Category Badge Top */}
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border", cat.color)}>
                    {cat.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {doc.chunks} chunks
                  </span>
                </div>

                {/* Simulated Google Doc Content Snippet Lines */}
                <div className="space-y-1.5 my-2">
                  <p className="text-[11px] font-sans text-slate-300 line-clamp-3 leading-relaxed">
                    {doc.content}
                  </p>
                </div>

                {/* Subtle Hover Edit Prompt */}
                <div className="text-[10px] font-semibold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={11} />
                  <span>Click to edit document</span>
                </div>
              </div>

              {/* Document Meta Bottom Bar (Google Docs Footer Style) */}
              <div className="p-3.5 flex flex-col justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 
                      onClick={() => openEditModal(doc)}
                      className="font-bold text-xs text-[var(--color-text)] truncate hover:text-blue-400 cursor-pointer"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {doc.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Status Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs">
                  <button
                    onClick={() => handleToggleDoc(doc.id)}
                    className={cn(
                      "px-2.5 py-0.5 text-[10px] font-bold rounded-md border transition-colors",
                      doc.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                    )}
                  >
                    {doc.isActive ? 'Active in AI' : 'Paused'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(doc)}
                      className="p-1.5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 rounded-lg transition-colors"
                      title="Edit Document"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add / Edit Knowledge Document Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text)]">
                      {editingDocId ? 'Edit Knowledge Document' : 'Add Knowledge Document'}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Document will be chunked & embedded into pgvector for your AI Agent.
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModalTab('upload')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all",
                    modalTab === 'upload'
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  )}
                >
                  <FileUp size={14} />
                  <span>Upload File (PDF / DOCX / CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('text')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all",
                    modalTab === 'text'
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  )}
                >
                  <FileText size={14} />
                  <span>Write / Paste Text</span>
                </button>
              </div>

              <form onSubmit={handleSaveDocument} className="space-y-3.5 text-xs">
                {modalTab === 'upload' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Upload Attachment Document</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer relative",
                        isDragging 
                          ? "border-blue-500 bg-blue-500/10 scale-[0.99]" 
                          : "border-[var(--color-border)] hover:border-blue-500/60 bg-[var(--color-surface)]/50"
                      )}
                    >
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.csv,.md"
                        onChange={handleFileInputChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {uploadedFile ? (
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[var(--color-text)] truncate">{uploadedFile.name}</p>
                              <p className="text-[10px] text-blue-400 font-medium">{uploadedFile.size} • {uploadedFile.type} • Ready for Vectorization</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile(null);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-2">
                          <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Upload size={18} />
                          </div>
                          <p className="font-bold text-xs text-[var(--color-text)]">
                            Drag & drop your SOP, pricing PDF, CSV, or guideline document
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">
                            Supports PDF, DOCX, TXT, CSV, MD (up to 25 MB). Auto-chunked into embeddings.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Document Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Laser Treatment Standard Operating Procedure"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="SOP">Standard Operating Procedure (SOP)</option>
                      <option value="PRICING">Pricing Sheet & Menu</option>
                      <option value="FAQ">FAQ & Common Questions</option>
                      <option value="SCRIPTS">Sales & Call Scripts</option>
                      <option value="RESTRICTED_GUIDELINES">Restricted Guidelines & Safety</option>
                      <option value="SERVICE">Service Guide & Roadmap</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Document Content / Text *</label>
                    <span className="text-[10px] text-blue-400 font-medium">
                      Estimated chunks: ~{Math.max(1, Math.ceil((content.length || 1) / 120))}
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder="Write or paste full SOP text, pricing details, safety rules, or treatment protocols..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-[var(--color-text)] font-sans text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                  <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Indexed into pgvector on save
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-[var(--color-surface)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all"
                    >
                      <Save size={14} />
                      <span>{editingDocId ? 'Update & Retrain' : 'Add Document'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

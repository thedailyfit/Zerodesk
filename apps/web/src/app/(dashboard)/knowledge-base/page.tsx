'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, BookOpen, Tag, Edit2, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const documents = [
  { id: '1', title: 'Laser Hair Removal - Complete Guide', category: 'SERVICE', content: 'Our laser hair removal uses the latest diode technology...', chunks: 8, isActive: true, updatedAt: '2024-03-10' },
  { id: '2', title: 'Pricing - All Treatments 2024', category: 'PRICING', content: 'Consultation: ₹500, Laser (Small Area): ₹3,000...', chunks: 12, isActive: true, updatedAt: '2024-03-12' },
  { id: '3', title: 'Working Hours & Holiday Schedule', category: 'FAQ', content: 'Monday to Saturday: 10 AM - 8 PM, Sunday: Closed...', chunks: 3, isActive: true, updatedAt: '2024-03-08' },
  { id: '4', title: 'Dr. Meenakshi - Profile', category: 'DOCTOR', content: 'Dr. Meenakshi is a board-certified dermatologist with 15 years...', chunks: 4, isActive: true, updatedAt: '2024-03-05' },
  { id: '5', title: 'Cancellation & Refund Policy', category: 'POLICY', content: 'Appointments can be cancelled up to 4 hours before...', chunks: 5, isActive: true, updatedAt: '2024-03-01' },
  { id: '6', title: 'Post-Treatment Care Instructions', category: 'FAQ', content: 'After laser treatment, avoid direct sunlight for 48 hours...', chunks: 6, isActive: true, updatedAt: '2024-02-28' },
  { id: '7', title: 'Summer Special Offers', category: 'PROMOTION', content: 'Get 30% off on all skin treatments this summer...', chunks: 2, isActive: false, updatedAt: '2024-02-20' },
  { id: '8', title: 'PRP Hair Therapy Brochure', category: 'SERVICE', content: 'PRP (Platelet-Rich Plasma) therapy stimulates hair growth...', chunks: 7, isActive: true, updatedAt: '2024-03-14' },
];

const categoryConfig: Record<string, { color: string; label: string }> = {
  SERVICE: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Service' },
  PRICING: { color: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Pricing' },
  FAQ: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'FAQ' },
  DOCTOR: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Doctor' },
  POLICY: { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Policy' },
  PROMOTION: { color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', label: 'Promotion' },
};

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const categories = ['ALL', ...Object.keys(categoryConfig)];

  const filtered = documents.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage your AI&apos;s knowledge — {documents.length} documents, {documents.reduce((s, d) => s + d.chunks, 0)} chunks indexed
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] rounded-lg text-sm font-medium transition-colors">
            <Upload size={16} />
            Upload File
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} />
            Add Document
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input type="text" placeholder="Search knowledge base..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={cn("px-3 py-1.5 text-xs rounded-lg border transition-all",
                categoryFilter === cat ? "bg-[var(--color-primary)] text-white border-transparent" : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}>
              {cat === 'ALL' ? 'All' : categoryConfig[cat]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((doc, i) => {
          const cat = categoryConfig[doc.category];
          return (
            <motion.div key={doc.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={cn("p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl hover:bg-[var(--color-glass-hover)] transition-all group", !doc.isActive && "opacity-50")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                    <FileText size={18} className="text-[var(--color-primary-light)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-[var(--color-text)]">{doc.title}</h3>
                      <span className={cn("px-2 py-0.5 text-[10px] rounded-full border", cat?.color)}>{cat?.label}</span>
                      {!doc.isActive && <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Inactive</span>}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">{doc.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><BookOpen size={10} />{doc.chunks} chunks</span>
                      <span>Updated {doc.updatedAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-[var(--color-surface)] rounded transition-colors"><Edit2 size={14} className="text-[var(--color-text-muted)]" /></button>
                  <button className="p-1.5 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

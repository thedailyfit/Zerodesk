'use client';

import { motion } from 'framer-motion';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const stages = [
  {
    name: 'New Lead', slug: 'new', color: '#6366f1', leads: [
      { id: '1', title: 'Skin Treatment Inquiry', customer: 'Rajesh Kumar', value: 25000, source: 'VOICE', score: 85, daysInStage: 1 },
      { id: '2', title: 'Hair Transplant Query', customer: 'Vikram Singh', value: 80000, source: 'WHATSAPP', score: 45, daysInStage: 2 },
      { id: '3', title: 'Facial Package', customer: 'Meera Joshi', value: 12000, source: 'WEB_CHAT', score: 60, daysInStage: 0 },
    ],
  },
  {
    name: 'Contacted', slug: 'contacted', color: '#8b5cf6', leads: [
      { id: '4', title: 'Laser Treatment', customer: 'Priya Sharma', value: 35000, source: 'VOICE', score: 72, daysInStage: 3 },
      { id: '5', title: 'Acne Scar Treatment', customer: 'Ankit Rawat', value: 18000, source: 'WHATSAPP', score: 58, daysInStage: 1 },
    ],
  },
  {
    name: 'Qualified', slug: 'qualified', color: '#a855f7', leads: [
      { id: '6', title: 'Full Body Laser Package', customer: 'Sneha Reddy', value: 120000, source: 'VOICE', score: 92, daysInStage: 5 },
    ],
  },
  {
    name: 'Proposal Sent', slug: 'proposal', color: '#d946ef', leads: [
      { id: '7', title: 'Annual Membership', customer: 'Ananya Iyer', value: 50000, source: 'WHATSAPP', score: 78, daysInStage: 2 },
      { id: '8', title: 'Premium Wellness Plan', customer: 'Deepak Menon', value: 75000, source: 'VOICE', score: 80, daysInStage: 4 },
    ],
  },
  {
    name: 'Won', slug: 'won', color: '#22c55e', leads: [
      { id: '9', title: 'Laser Hair Removal', customer: 'Ritu Agarwal', value: 45000, source: 'VOICE', score: 95, daysInStage: 0 },
    ],
  },
  {
    name: 'Lost', slug: 'lost', color: '#ef4444', leads: [
      { id: '10', title: 'Budget Consultation', customer: 'Suresh Nair', value: 8000, source: 'WEB_CHAT', score: 20, daysInStage: 7 },
    ],
  },
];

const sourceIcons: Record<string, string> = { VOICE: '📞', WHATSAPP: '💬', WEB_CHAT: '🌐' };

export default function CrmPage() {
  const totalValue = stages.reduce((sum, s) => sum + s.leads.reduce((ls, l) => ls + l.value, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM Pipeline</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Total pipeline value: <span className="font-mono text-[var(--color-primary-light)]">{formatCurrency(totalValue)}</span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, si) => (
          <motion.div
            key={stage.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
            className="flex-shrink-0 w-72"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-semibold text-[var(--color-text)]">{stage.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">{stage.leads.length}</span>
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">
                {formatCurrency(stage.leads.reduce((s, l) => s + l.value, 0))}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {stage.leads.map((lead, li) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: si * 0.1 + li * 0.05 }}
                  className="p-3 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-lg hover:bg-[var(--color-glass-hover)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{lead.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{lead.customer}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--color-surface)] rounded">
                      <MoreHorizontal size={14} className="text-[var(--color-text-muted)]" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-mono font-semibold" style={{ color: stage.color }}>
                      {formatCurrency(lead.value)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{sourceIcons[lead.source]}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-1 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", lead.score >= 70 ? "bg-green-500" : lead.score >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{lead.score}</span>
                      </div>
                    </div>
                  </div>
                  {lead.daysInStage > 0 && (
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">{lead.daysInStage}d in this stage</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

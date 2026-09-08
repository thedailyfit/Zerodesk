'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, MessageCircle, Globe, ArrowUpRight, Clock } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { apiClient } from '@/lib/api-client';

const channelConfig: Record<string, { icon: typeof Phone; label: string; color: string }> = {
  VOICE: { icon: Phone, label: 'Voice Call', color: 'text-blue-400' },
  WHATSAPP: { icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-400' },
  WEB_CHAT: { icon: Globe, label: 'Web Chat', color: 'text-sky-400' },
};

const statusConfig: Record<string, { label: string; style: string }> = {
  ACTIVE: { label: 'Active', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  COMPLETED: { label: 'Closed', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  CLOSED: { label: 'Closed', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  HANDOFF: { label: 'Transferred', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  TRANSFERRED: { label: 'Transferred', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const sentimentStyle: Record<string, { label: string; style: string }> = {
  POSITIVE: { label: 'Positive', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  NEUTRAL: { label: 'Neutral', style: 'bg-slate-800 text-slate-400 border-slate-700' },
  NEGATIVE: { label: 'Negative', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function ConversationsPage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        const res = await apiClient('/conversations');
        if (Array.isArray(res)) {
          const mapped = res.map((c: any) => {
            const rawChannel = (c.channel || 'VOICE').toUpperCase();
            const channel = rawChannel.includes('WHATSAPP') ? 'WHATSAPP' : rawChannel.includes('WEB') ? 'WEB_CHAT' : 'VOICE';
            const durationSec = c.endedAt && c.startedAt 
              ? Math.round((new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000)
              : null;
            const durationStr = durationSec ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}` : undefined;

            return {
              id: c.id,
              customer: c.customer?.name || 'Inquiry Contact',
              phone: c.customer?.phone || 'N/A',
              channel,
              status: c.status || 'COMPLETED',
              lastMessage: c.messages?.[c.messages.length - 1]?.content || c.aiSummary || 'Inquiry consultation completed.',
              aiSummary: c.aiSummary || 'Patient engaged with AI Receptionist.',
              sentiment: c.sentiment || 'POSITIVE',
              duration: durationStr,
              time: new Date(c.startedAt || c.createdAt),
            };
          });
          setConversations(mapped);
        }
      } catch (err) {
        console.error('Failed to load conversations from API:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, []);

  const filtered = conversations.filter((c) => {
    if (filter !== 'ALL' && c.channel !== filter) return false;
    if (search && !c.customer.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conversations</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">All AI conversations across Voice, WhatsApp, and Web Chat</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search conversations by patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'VOICE', 'WHATSAPP', 'WEB_CHAT'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-all",
                filter === f
                  ? "bg-[var(--color-primary)] text-white border-transparent"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {f === 'ALL' ? 'All' : f === 'WEB_CHAT' ? 'Web Chat' : f === 'WHATSAPP' ? 'WhatsApp' : 'Voice'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl">
            <MessageCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
            <h3 className="font-bold text-base text-[var(--color-text)]">No Conversations Found</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
              Live patient interactions across LiveKit Voice AI, WhatsApp Engine, and WebChat will appear here automatically.
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const channel = channelConfig[c.channel] || channelConfig.VOICE;
            const ChannelIcon = channel.icon;
            const status = statusConfig[c.status] || statusConfig.COMPLETED;
            const sentiment = sentimentStyle[c.sentiment] || sentimentStyle.POSITIVE;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all"
              >
                <Avatar3D name={c.customer} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[var(--color-text)] truncate">{c.customer}</span>
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">{c.phone}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", status.style)}>
                      {status.label}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", sentiment.style)}>
                      {sentiment.label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">{c.lastMessage}</p>
                  {c.aiSummary && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1 truncate">
                      <span className="text-blue-400 font-semibold">AI Summary:</span> {c.aiSummary}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <ChannelIcon size={13} className={channel.color} />
                    <span>{channel.label}</span>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo(c.time)}</span>
                  {c.duration && (
                    <span className="text-[10px] font-mono text-[var(--color-text-muted)] flex items-center gap-0.5">
                      <Clock size={10} /> {c.duration}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

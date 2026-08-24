'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, MessageCircle, Globe, ArrowUpRight, Clock } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';

import { Avatar3D } from '@/components/ui/avatar-3d';
import { useNiche } from '@/components/providers/niche-provider';

const channelConfig: Record<string, { icon: typeof Phone; label: string; color: string }> = {
  VOICE: { icon: Phone, label: 'Voice Call', color: 'text-blue-400' },
  WHATSAPP: { icon: MessageCircle, label: 'WhatsApp', color: 'text-emerald-400' },
  WEB_CHAT: { icon: Globe, label: 'Web Chat', color: 'text-sky-400' },
};

const statusConfig: Record<string, { label: string; style: string }> = {
  ACTIVE: { label: 'Active', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CLOSED: { label: 'Closed', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  TRANSFERRED: { label: 'Transferred', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

const sentimentStyle: Record<string, { label: string; style: string }> = {
  POSITIVE: { label: 'Positive', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  NEUTRAL: { label: 'Neutral', style: 'bg-slate-800 text-slate-400 border-slate-700' },
  NEGATIVE: { label: 'Negative', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function ConversationsPage() {
  const { currentNiche } = useNiche();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const getConversations = () => {
    if (currentNiche === 'dental') {
      return [
        { id: '1', customer: 'Rajesh Kumar', phone: '+91 98765 43210', channel: 'VOICE', status: 'ACTIVE', lastMessage: 'I have severe tooth pain in my upper molar, is root canal available today?', aiSummary: 'Urgent RCT inquiry scheduled for 4 PM', sentiment: 'POSITIVE', duration: '3:45', time: new Date(Date.now() - 300000) },
        { id: '2', customer: 'Priya Sharma', phone: '+91 87654 32109', channel: 'WHATSAPP', status: 'ACTIVE', lastMessage: 'Can you send the cost comparison between metal and invisible aligners?', aiSummary: 'Sent Aligner pricing PDF via WhatsApp', sentiment: 'NEUTRAL', time: new Date(Date.now() - 900000) },
        { id: '3', customer: 'Sneha Reddy', phone: '+91 65432 10987', channel: 'VOICE', status: 'CLOSED', lastMessage: 'The doctor explained the crown fitting very clearly', aiSummary: 'Post-op crown fitting check complete', sentiment: 'POSITIVE', duration: '2:10', time: new Date(Date.now() - 3600000) },
      ];
    }
    if (currentNiche === 'realestate') {
      return [
        { id: '1', customer: 'Vikramaditya Varma', phone: '+91 98490 12345', channel: 'VOICE', status: 'ACTIVE', lastMessage: 'Are the East-facing 3BHK luxury villas still available at the Gachibowli project?', aiSummary: '3BHK villa inquiry + site visit scheduled for Saturday', sentiment: 'POSITIVE', duration: '4:15', time: new Date(Date.now() - 300000) },
        { id: '2', customer: 'Anand Rao', phone: '+91 97000 88991', channel: 'WHATSAPP', status: 'ACTIVE', lastMessage: 'Please share the RERA approval certificate and updated price sheet', aiSummary: 'Sent RERA doc + payment schedule', sentiment: 'NEUTRAL', time: new Date(Date.now() - 900000) },
      ];
    }
    if (currentNiche === 'hotel') {
      return [
        { id: '1', customer: 'Dr. Srinivas Reddy', phone: '+91 98765 11223', channel: 'VOICE', status: 'ACTIVE', lastMessage: 'I want to reserve the Presidential Ocean Suite with airport pickup for 3 nights', aiSummary: 'VIP suite booking confirmed with early check-in', sentiment: 'POSITIVE', duration: '3:20', time: new Date(Date.now() - 300000) },
        { id: '2', customer: 'Pooja Hegde', phone: '+91 87654 44332', channel: 'WHATSAPP', status: 'ACTIVE', lastMessage: 'What is the banquet capacity and catering menu for a 300-guest wedding reception?', aiSummary: 'Sent Grand Ballroom banquet brochure and dining menu', sentiment: 'NEUTRAL', time: new Date(Date.now() - 900000) },
      ];
    }
    return [
      { id: '1', customer: 'Rajesh Kumar', phone: '+91 98765 43210', channel: 'VOICE', status: 'ACTIVE', lastMessage: 'I want to book an appointment for laser skin treatment', aiSummary: 'Customer interested in laser treatment', sentiment: 'POSITIVE', duration: '4:32', time: new Date(Date.now() - 300000) },
      { id: '2', customer: 'Priya Sharma', phone: '+91 87654 32109', channel: 'WHATSAPP', status: 'ACTIVE', lastMessage: 'Can you share the price list for hair treatments and PRP?', aiSummary: 'Requested pricing for hair treatments', sentiment: 'NEUTRAL', time: new Date(Date.now() - 900000) },
      { id: '3', customer: 'Amit Patel', phone: '+91 76543 21098', channel: 'WEB_CHAT', status: 'CLOSED', lastMessage: 'Thank you, I will visit tomorrow at 11 AM', aiSummary: 'Appointment confirmed for tomorrow', sentiment: 'POSITIVE', time: new Date(Date.now() - 1800000) },
      { id: '4', customer: 'Sneha Reddy', phone: '+91 65432 10987', channel: 'VOICE', status: 'CLOSED', lastMessage: 'The doctor was very helpful with my skin routine', aiSummary: 'Follow-up call for post-treatment feedback', sentiment: 'POSITIVE', duration: '2:15', time: new Date(Date.now() - 3600000) },
    ];
  };

  const conversations = getConversations();

  const filtered = conversations.filter((c) => {
    if (filter !== 'ALL' && c.channel !== filter) return false;
    if (search && !c.customer.toLowerCase().includes(search.toLowerCase())) return false;
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
            placeholder="Search conversations..."
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
        {filtered.map((conv, i) => {
          const channel = channelConfig[conv.channel];
          const status = statusConfig[conv.status];
          const ChannelIcon = channel.icon;
          return (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl hover:bg-[var(--color-glass-hover)] hover:border-[var(--color-border-hover)] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar3D name={conv.customer} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--color-text)]">{conv.customer}</span>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{conv.phone}</span>
                      <span className={cn("px-2 py-0.5 text-[10px] rounded-full border font-medium", (sentimentStyle[conv.sentiment] || sentimentStyle.NEUTRAL).style)}>
                        {(sentimentStyle[conv.sentiment] || sentimentStyle.NEUTRAL).label}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate font-medium">{conv.lastMessage}</p>
                    <p className="text-[11px] text-blue-400 mt-1 italic flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {conv.aiSummary}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn("px-2 py-0.5 text-xs rounded-full border", status.style)}>{status.label}</span>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Clock size={12} />
                    <span>{timeAgo(conv.time)}</span>
                    {conv.duration && <span>· {conv.duration}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

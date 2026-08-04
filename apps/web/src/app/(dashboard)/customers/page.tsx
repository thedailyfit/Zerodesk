'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Phone, MessageCircle, Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, formatCurrency, timeAgo, getInitials } from '@/lib/utils';

const customers = [
  { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@email.com', leadScore: 85, sentiment: 'POSITIVE', lifetimeValue: 45000, tags: ['VIP', 'Skin Care'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 3600000), totalConversations: 12 },
  { id: '2', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@email.com', leadScore: 72, sentiment: 'NEUTRAL', lifetimeValue: 28000, tags: ['Regular', 'Hair Treatment'], lastChannel: 'WHATSAPP', lastSeen: new Date(Date.now() - 7200000), totalConversations: 8 },
  { id: '3', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@email.com', leadScore: 45, sentiment: 'NEUTRAL', lifetimeValue: 12000, tags: ['New'], lastChannel: 'WEB_CHAT', lastSeen: new Date(Date.now() - 86400000), totalConversations: 3 },
  { id: '4', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', leadScore: 92, sentiment: 'POSITIVE', lifetimeValue: 120000, tags: ['VIP', 'Premium', 'Referral'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 1800000), totalConversations: 24 },
  { id: '5', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', leadScore: 33, sentiment: 'NEGATIVE', lifetimeValue: 5000, tags: ['At Risk'], lastChannel: 'WHATSAPP', lastSeen: new Date(Date.now() - 172800000), totalConversations: 5 },
  { id: '6', name: 'Ananya Iyer', phone: '+91 43210 98765', email: 'ananya@email.com', leadScore: 67, sentiment: 'POSITIVE', lifetimeValue: 35000, tags: ['Regular', 'Wellness'], lastChannel: 'WEB_CHAT', lastSeen: new Date(Date.now() - 14400000), totalConversations: 15 },
];

const channelIcons: Record<string, { icon: typeof Phone; color: string }> = {
  VOICE: { icon: Phone, color: 'text-blue-400' },
  WHATSAPP: { icon: MessageCircle, color: 'text-green-400' },
  WEB_CHAT: { icon: Globe, color: 'text-purple-400' },
};

const sentimentIcon: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  POSITIVE: { icon: TrendingUp, color: 'text-green-400', label: 'Positive' },
  NEUTRAL: { icon: Minus, color: 'text-zinc-400', label: 'Neutral' },
  NEGATIVE: { icon: TrendingDown, color: 'text-red-400', label: 'Negative' },
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Unified customer memory across all channels</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Customer</th>
              <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Lead Score</th>
              <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Sentiment</th>
              <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">LTV</th>
              <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Tags</th>
              <th className="text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer, i) => {
              const SentimentIcon = sentimentIcon[customer.sentiment].icon;
              const LastChannelIcon = channelIcons[customer.lastChannel].icon;
              return (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-glass-hover)] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {getInitials(customer.name)}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-[var(--color-text)]">{customer.name}</div>
                        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                          <LastChannelIcon size={10} className={channelIcons[customer.lastChannel].color} />
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", customer.leadScore >= 70 ? "bg-green-500" : customer.leadScore >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${customer.leadScore}%` }} />
                      </div>
                      <span className="text-sm font-mono text-[var(--color-text-secondary)]">{customer.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={cn("flex items-center gap-1 text-sm", sentimentIcon[customer.sentiment].color)}>
                      <SentimentIcon size={14} />
                      <span>{sentimentIcon[customer.sentiment].label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-[var(--color-text-secondary)]">
                    {formatCurrency(customer.lifetimeValue)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {customer.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-light)] border border-[var(--color-primary-200)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                    {timeAgo(customer.lastSeen)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

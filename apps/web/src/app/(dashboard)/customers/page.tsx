'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Phone, MessageCircle, Globe, TrendingUp, TrendingDown, Minus, Upload, FileSpreadsheet, X, Check, Star } from 'lucide-react';
import { cn, formatCurrency, timeAgo, getInitials } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useNiche } from '@/components/providers/niche-provider';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  leadScore: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  lifetimeValue: number;
  priority: 'VIP' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  tags: string[];
  lastChannel: 'VOICE' | 'WHATSAPP' | 'WEB_CHAT';
  lastSeen: Date;
  totalConversations: number;
}

const channelIcons: Record<string, { icon: typeof Phone; color: string }> = {
  VOICE: { icon: Phone, color: 'text-blue-400' },
  WHATSAPP: { icon: MessageCircle, color: 'text-emerald-400' },
  WEB_CHAT: { icon: Globe, color: 'text-purple-400' },
};

const priorityBadges: Record<string, { label: string; style: string }> = {
  VIP: { label: 'VIP 🌟', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  HIGH: { label: 'High 🔴', style: 'bg-red-500/15 text-red-400 border-red-500/30' },
  MEDIUM: { label: 'Medium 🟡', style: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  STANDARD: { label: 'Standard ⚪', style: 'bg-slate-800 text-slate-300 border-slate-700' },
};

const sentimentIcon: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  POSITIVE: { icon: TrendingUp, color: 'text-emerald-400', label: 'Positive' },
  NEUTRAL: { icon: Minus, color: 'text-zinc-400', label: 'Neutral' },
  NEGATIVE: { icon: TrendingDown, color: 'text-red-400', label: 'Negative' },
};

export default function CustomersPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const getDefaultCustomers = (): CustomerItem[] => {
    if (currentNiche === 'dental') {
      return [
        { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@email.com', leadScore: 85, sentiment: 'POSITIVE', lifetimeValue: 45000, priority: 'VIP', tags: ['Invisalign', 'Crown'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 3600000), totalConversations: 12 },
        { id: '2', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@email.com', leadScore: 72, sentiment: 'NEUTRAL', lifetimeValue: 28000, priority: 'HIGH', tags: ['Root Canal'], lastChannel: 'WHATSAPP', lastSeen: new Date(Date.now() - 7200000), totalConversations: 8 },
        { id: '3', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', leadScore: 92, sentiment: 'POSITIVE', lifetimeValue: 120000, priority: 'VIP', tags: ['Implants', 'Full Arch'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 1800000), totalConversations: 24 },
      ];
    }
    if (currentNiche === 'realestate') {
      return [
        { id: '1', name: 'Vikramaditya Varma', phone: '+91 98490 12345', email: 'vikram.varma@hyderabad.com', leadScore: 95, sentiment: 'POSITIVE', lifetimeValue: 28500000, priority: 'VIP', tags: ['3BHK Villa', 'Jubilee Hills'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 3600000), totalConversations: 8 },
        { id: '2', name: 'Anand Rao', phone: '+91 97000 88991', email: 'anand.rao@techcorp.com', leadScore: 88, sentiment: 'POSITIVE', lifetimeValue: 45000000, priority: 'VIP', tags: ['Commercial Space'], lastChannel: 'WHATSAPP', lastSeen: new Date(Date.now() - 7200000), totalConversations: 14 },
      ];
    }
    return [
      { id: '1', name: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@email.com', leadScore: 85, sentiment: 'POSITIVE', lifetimeValue: 45000, priority: 'VIP', tags: ['Skin Care', 'Laser'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 3600000), totalConversations: 12 },
      { id: '2', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@email.com', leadScore: 72, sentiment: 'NEUTRAL', lifetimeValue: 28000, priority: 'HIGH', tags: ['Hair Care', 'PRP'], lastChannel: 'WHATSAPP', lastSeen: new Date(Date.now() - 7200000), totalConversations: 8 },
      { id: '3', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@email.com', leadScore: 45, sentiment: 'NEUTRAL', lifetimeValue: 12000, priority: 'STANDARD', tags: ['New Client'], lastChannel: 'WEB_CHAT', lastSeen: new Date(Date.now() - 86400000), totalConversations: 3 },
      { id: '4', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', leadScore: 92, sentiment: 'POSITIVE', lifetimeValue: 120000, priority: 'VIP', tags: ['VIP Treatment', 'Referral'], lastChannel: 'VOICE', lastSeen: new Date(Date.now() - 1800000), totalConversations: 24 },
    ];
  };

  const [customers, setCustomers] = useState<CustomerItem[]>(getDefaultCustomers());
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ltv, setLtv] = useState('15000');
  const [priority, setPriority] = useState<CustomerItem['priority']>('HIGH');
  const [tagInput, setTagInput] = useState('New Consultation');

  // Bulk CSV Paste State
  const [csvText, setCsvText] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newCustomer: CustomerItem = {
      id: Date.now().toString(),
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      leadScore: 75,
      sentiment: 'POSITIVE',
      lifetimeValue: parseFloat(ltv) || 10000,
      priority,
      tags: tagInput ? tagInput.split(',').map(t => t.trim()) : ['New'],
      lastChannel: 'WEB_CHAT',
      lastSeen: new Date(),
      totalConversations: 1
    };

    setCustomers([newCustomer, ...customers]);
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setLtv('15000');
  };

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.split('\n').filter(l => l.trim());
    const imported: CustomerItem[] = lines.map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      return {
        id: (Date.now() + idx).toString(),
        name: parts[0] || `Imported Client ${idx + 1}`,
        phone: parts[1] || `+91 90000 ${10000 + idx}`,
        email: parts[2] || `client${idx + 1}@imported.com`,
        leadScore: 60,
        sentiment: 'NEUTRAL',
        lifetimeValue: parseFloat(parts[3]) || 5000,
        priority: (parts[4]?.toUpperCase() as any) || 'STANDARD',
        tags: ['CSV Import'],
        lastChannel: 'WHATSAPP',
        lastSeen: new Date(),
        totalConversations: 1
      };
    });

    setCustomers([...imported, ...customers]);
    setIsImportModalOpen(false);
    setCsvText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{nicheConfig.terminology?.customers || "Customer Directory"}</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Unified {nicheConfig.terminology?.customer?.toLowerCase() || "customer"} memory across Voice, WhatsApp, and Webchat.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            Bulk CSV Import
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
          >
            <Plus size={16} />
            Add {nicheConfig.terminology?.customer || "Customer"}
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Priority Tag</th>
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lead Score</th>
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Sentiment</th>
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">LTV</th>
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Tags</th>
              <th className="px-4 py-3 text.xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer, i) => {
              const SentimentIcon = sentimentIcon[customer.sentiment].icon;
              const LastChannelIcon = channelIcons[customer.lastChannel].icon;
              const pBadge = priorityBadges[customer.priority] || priorityBadges.STANDARD;
              return (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)]/60 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar3D name={customer.name} size="md" />
                      <div>
                        <div className="font-bold text-xs text-[var(--color-text)]">{customer.name}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                          <LastChannelIcon size={12} className={channelIcons[customer.lastChannel].color} />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full font-bold border", pBadge.style)}>
                      {pBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", customer.leadScore >= 70 ? "bg-emerald-500" : customer.leadScore >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${customer.leadScore}%` }} />
                      </div>
                      <span className="text-xs font-mono text-[var(--color-text-secondary)] font-bold">{customer.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className={cn("flex items-center gap-1 text-xs font-medium", sentimentIcon[customer.sentiment].color)}>
                      <SentimentIcon size={13} />
                      <span>{sentimentIcon[customer.sentiment].label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono font-bold text-purple-300">
                    {formatCurrency(customer.lifetimeValue)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {customer.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[var(--color-text-muted)] font-mono">
                    {timeAgo(customer.lastSeen)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus size={18} className="text-purple-400" />
                  Add New Customer
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vikram@email.com"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Priority / Importance Tag *</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="VIP">VIP 🌟</option>
                      <option value="HIGH">High 🔴</option>
                      <option value="MEDIUM">Medium 🟡</option>
                      <option value="STANDARD">Standard ⚪</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Initial LTV (₹)</label>
                    <input
                      type="number"
                      value={ltv}
                      onChange={(e) => setLtv(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Skin Care, Consultation"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk CSV Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-emerald-400" />
                  Bulk Import Customers (CSV/Excel)
                </h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBulkImport} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste CSV lines below. Format: <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-300">Name, Phone, Email, LTV, Priority</code>
                </p>

                <textarea
                  rows={5}
                  required
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`Dr. Suresh Menon, +91 9876543210, suresh@email.com, 50000, VIP\nAnanya Sharma, +91 8765432109, ananya@email.com, 25000, HIGH`}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Import All Records
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

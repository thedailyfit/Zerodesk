'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Plus, 
  Search, 
  Send, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  IndianRupee,
  X,
  Check,
  Sparkles,
  Printer
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  customer: string;
  phone: string;
  email: string;
  service: string;
  amount: number;
  tax: number;
  total: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  createdDate: string;
  sentViaAi: boolean;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  { id: '1', invoiceNo: 'INV-2026-001', customer: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@email.com', service: 'Full Laser Treatment Package', amount: 40000, tax: 5000, total: 45000, dueDate: '2026-08-10', status: 'PAID', createdDate: '2026-08-01', sentViaAi: true },
  { id: '2', invoiceNo: 'INV-2026-002', customer: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@email.com', service: 'Chemical Peel & Facial Session', amount: 25000, tax: 3000, total: 28000, dueDate: '2026-08-15', status: 'PENDING', createdDate: '2026-08-02', sentViaAi: true },
  { id: '3', invoiceNo: 'INV-2026-003', customer: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', service: 'PRP Therapy & Hair Consultation', amount: 105000, tax: 15000, total: 120000, dueDate: '2026-08-05', status: 'PAID', createdDate: '2026-07-28', sentViaAi: true },
  { id: '4', invoiceNo: 'INV-2026-004', customer: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', service: 'Acne Consultation & Medication', amount: 4500, tax: 500, total: 5000, dueDate: '2026-07-25', status: 'OVERDUE', createdDate: '2026-07-15', sentViaAi: false },
  { id: '5', invoiceNo: 'INV-2026-005', customer: 'Ananya Iyer', phone: '+91 43210 98765', email: 'ananya@email.com', service: 'Wellness & Body Massage Session', amount: 30000, tax: 5000, total: 35000, dueDate: '2026-08-20', status: 'PENDING', createdDate: '2026-08-04', sentViaAi: true },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentAiId, setSentAiId] = useState<string | null>(null);

  // Modal Form State
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Laser Treatment Session');
  const [amount, setAmount] = useState('15000');
  const [dueDate, setDueDate] = useState('2026-08-20');

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    if (search && !inv.customer.toLowerCase().includes(search.toLowerCase()) && !inv.invoiceNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + i.total, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !amount) return;

    const baseAmt = parseFloat(amount) || 10000;
    const taxAmt = Math.round(baseAmt * 0.18);
    const created: InvoiceItem = {
      id: Date.now().toString(),
      invoiceNo: `INV-2026-${(invoices.length + 1).toString().padStart(3, '0')}`,
      customer,
      phone: phone || '+91 98765 00000',
      email: email || 'client@email.com',
      service,
      amount: baseAmt,
      tax: taxAmt,
      total: baseAmt + taxAmt,
      dueDate,
      status: 'PENDING',
      createdDate: new Date().toISOString().split('T')[0],
      sentViaAi: false
    };

    setInvoices([created, ...invoices]);
    setIsModalOpen(false);
    setCustomer('');
    setPhone('');
    setEmail('');
  };

  const handleSendViaAi = (id: string) => {
    setSentAiId(id);
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, sentViaAi: true } : inv));
    setTimeout(() => setSentAiId(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Invoice & Billing Management</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">WhatsApp & Email Auto-Send</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Create, manage, and automate billing receipts sent directly to your patients via AI.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shrink-0"
        >
          <Plus size={16} />
          Create New Invoice
        </button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-extrabold text-purple-300 font-mono mt-1">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Collected (Paid)</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Pending Balance</p>
          <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Overdue Payments</p>
          <p className="text-2xl font-extrabold text-red-400 font-mono mt-1">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by invoice # or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-1.5">
          {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3.5 py-1.5 text-xs rounded-xl border font-semibold transition-all",
                statusFilter === st
                  ? "bg-purple-600 text-white border-purple-500 shadow"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Invoice #</th>
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Treatment / Service</th>
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Amount</th>
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Payment Status</th>
              <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)]/60 transition-colors"
              >
                <td className="px-4 py-3.5 font-mono text-xs font-bold text-purple-300">
                  {inv.invoiceNo}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar3D name={inv.customer} size="sm" />
                    <div>
                      <p className="font-bold text-xs text-[var(--color-text)]">{inv.customer}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{inv.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-[var(--color-text-secondary)] font-medium">
                  {inv.service}
                </td>
                <td className="px-4 py-3.5 text-xs font-mono font-bold text-[var(--color-text)]">
                  {formatCurrency(inv.total)}
                </td>
                <td className="px-4 py-3.5 text-xs font-mono text-[var(--color-text-muted)]">
                  {inv.dueDate}
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn(
                    "px-2.5 py-0.5 text-[10px] rounded-full font-bold border",
                    inv.status === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    inv.status === 'PENDING' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleSendViaAi(inv.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 border",
                        sentAiId === inv.id
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30"
                      )}
                    >
                      {sentAiId === inv.id ? (
                        <>
                          <Check size={12} />
                          <span>Sent via AI!</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send via AI</span>
                        </>
                      )}
                    </button>
                    <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Receipt size={18} className="text-purple-400" />
                  Create Patient Invoice / Bill
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@email.com"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Treatment / Service Billed *</label>
                  <input
                    type="text"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300">
                  Total Payable (incl 18% GST): <strong>{formatCurrency((parseFloat(amount) || 0) * 1.18)}</strong>
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
                    Generate Invoice
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

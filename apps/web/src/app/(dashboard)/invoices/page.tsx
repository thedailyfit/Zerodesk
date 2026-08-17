'use client';

import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Plus, 
  Search, 
  Send, 
  Download, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Printer 
} from 'lucide-react';
import { useNiche } from '@/components/providers/niche-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useInvoices, type InvoiceRecord, type InvoiceLineItem } from '@/lib/invoices-store';

const DATE_PRESETS = ['Today', 'This Week', 'This Month', 'Last 30 Days', 'Last 90 Days', 'All Time', 'Custom'];

const getPresetDateRange = (preset: string) => {
  const today = new Date();
  const format = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const end = format(today);
  
  if (preset === 'Today') {
    return { start: format(today), end };
  }
  if (preset === 'This Week') {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return { start: format(d), end };
  }
  if (preset === 'This Month') {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: format(d), end };
  }
  if (preset === 'Last 30 Days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return { start: format(d), end };
  }
  if (preset === 'Last 90 Days') {
    const d = new Date(today);
    d.setDate(d.getDate() - 90);
    return { start: format(d), end };
  }
  return { start: '', end: '' }; // All Time
};

export default function InvoicesPage() {
  const { nicheConfig } = useNiche();
  const {
    invoices,
    totalInvoiced,
    totalCollected,
    totalPending,
    totalOverdue,
    addInvoice
  } = useInvoices();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [datePreset, setDatePreset] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sentAiId, setSentAiId] = useState<string | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Modal Form State
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Consultation');
  const [amount, setAmount] = useState('1000');
  const [dueDate, setDueDate] = useState(() => getPresetDateRange('Today').end);

  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'Custom') return;
    const { start, end } = getPresetDateRange(preset);
    setStartDate(start);
    setEndDate(end);
  };

  const filtered = invoices.filter(inv => {
    if (statusFilter !== 'ALL' && inv.paymentStatus !== statusFilter) return false;
    if (search && !inv.customerName.toLowerCase().includes(search.toLowerCase()) && !inv.invoiceNo.toLowerCase().includes(search.toLowerCase())) return false;
    if (startDate && inv.createdDate < startDate) return false;
    if (endDate && inv.createdDate > endDate) return false;
    return true;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !amount) return;

    const baseAmt = parseFloat(amount) || 1000;
    const taxAmt = Math.round(baseAmt * 0.18);
    const total = baseAmt + taxAmt;

    addInvoice({
      nicheId: 'skin', // useInvoices handles the actual niche in auto-generate, just passing a valid id
      customerName: customer,
      phone: phone || '+91 98765 00000',
      email: email || 'client@email.com',
      lineItems: [
        { serviceName: service, quantity: 1, unitPrice: baseAmt, gstRate: 18, gstAmount: taxAmt, totalPrice: total }
      ],
      subtotal: baseAmt,
      totalGst: taxAmt,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: total,
      paymentMethod: 'cash',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: total,
      dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      sentViaAi: false,
      isPackagePayment: false
    });

    setIsModalOpen(false);
    setCustomer('');
    setPhone('');
    setEmail('');
    setAmount('1000');
    setService('Consultation');
  };

  const handleSendViaAi = (id: string) => {
    setSentAiId(id);
    // In a real app we'd call updateInvoice here, but for UI we just show the state
    setTimeout(() => setSentAiId(null), 3000);
  };

  const handleDownloadAll = () => {
    if (!filtered.length) return;
    
    const headers = ['Invoice #', 'Customer', 'Phone', 'Service/Items', 'Subtotal', 'GST', 'Discount', 'Total', 'Status', 'Date', 'Payment Method'];
    
    const rows = filtered.map(inv => {
      const items = inv.lineItems.map(li => li.serviceName).join(' | ');
      return [
        inv.invoiceNo,
        `"${inv.customerName}"`,
        inv.phone,
        `"${items}"`,
        inv.subtotal,
        inv.totalGst,
        inv.discountAmount,
        inv.grandTotal,
        inv.paymentStatus,
        inv.createdDate,
        inv.paymentMethod
      ].join(',');
    });
    
    const csvText = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = (inv: InvoiceRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const itemsHtml = inv.lineItems.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${item.serviceName}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${item.gstRate}%</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${formatCurrency(item.totalPrice)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${inv.invoiceNo}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 32px; }
            .title { font-size: 28px; font-weight: bold; color: #111827; letter-spacing: -0.025em; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; text-align: left; }
            th { padding: 12px 8px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            .summary { margin-top: 32px; text-align: right; border-top: 2px solid #e5e7eb; padding-top: 24px; width: 300px; margin-left: auto; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #4b5563; }
            .summary-total { display: flex; justify-content: space-between; margin-top: 16px; font-size: 18px; font-weight: bold; color: #111827; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-top: 16px; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">INVOICE</div>
              <div style="color: #6b7280; margin-top: 4px;">#${inv.invoiceNo}</div>
              <div style="color: #6b7280; margin-top: 16px; font-size: 14px;"><strong>Date:</strong> ${inv.createdDate}</div>
              <div style="color: #6b7280; margin-top: 4px; font-size: 14px;"><strong>Due Date:</strong> ${inv.dueDate}</div>
            </div>
            <div style="text-align: right">
              <div style="color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Billed To:</div>
              <div style="font-weight: 600; font-size: 16px;">${inv.customerName}</div>
              <div style="color: #4b5563; font-size: 14px; margin-top: 4px;">${inv.phone}</div>
              ${inv.email ? `<div style="color: #4b5563; font-size: 14px; margin-top: 2px;">${inv.email}</div>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Service / Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(inv.subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>GST Total:</span>
              <span>${formatCurrency(inv.totalGst)}</span>
            </div>
            ${inv.discountAmount > 0 ? `
            <div class="summary-row" style="color: #ef4444;">
              <span>Discount:</span>
              <span>-${formatCurrency(inv.discountAmount)}</span>
            </div>
            ` : ''}
            <div class="summary-total">
              <span>Grand Total:</span>
              <span>${formatCurrency(inv.grandTotal)}</span>
            </div>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #e5e7eb;">
              <div class="summary-row">
                <span>Paid Amount:</span>
                <span>${formatCurrency(inv.paidAmount)}</span>
              </div>
              <div class="summary-row" style="font-weight: 600; color: #111827;">
                <span>Balance Due:</span>
                <span>${formatCurrency(inv.remainingBalance)}</span>
              </div>
            </div>
            
            <div class="status-badge" style="background: ${inv.paymentStatus === 'PAID' ? '#ecfdf5' : inv.paymentStatus === 'PENDING' ? '#fffbeb' : inv.paymentStatus === 'PARTIAL' ? '#f0fdfa' : '#fef2f2'}; color: ${inv.paymentStatus === 'PAID' ? '#059669' : inv.paymentStatus === 'PENDING' ? '#d97706' : inv.paymentStatus === 'PARTIAL' ? '#0d9488' : '#dc2626'};">
              ${inv.paymentStatus}
            </div>
          </div>
          
          <script>
            window.onload = function() { 
              setTimeout(function() {
                window.print(); 
                window.close(); 
              }, 250);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Invoice & Billing</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">WhatsApp & Email Auto-Send</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Create, manage, and automate billing receipts sent directly to your {nicheConfig.terminology?.customers?.toLowerCase() || 'patients'} via AI.
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
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-300 font-mono mt-1">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Collected</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Pending Balance</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Overdue Amount</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono mt-1">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full max-w-md relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by invoice # or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {['ALL', 'PAID', 'PENDING', 'PARTIAL', 'OVERDUE'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] rounded-xl border font-semibold transition-all shrink-0",
                  statusFilter === st
                    ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                    : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-2">Date Range:</span>
            {DATE_PRESETS.map(preset => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset)}
                className={cn(
                  "px-2.5 py-1 text-[10px] rounded-lg border font-medium transition-colors",
                  datePreset === preset
                    ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]"
                    : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                )}
              >
                {preset}
              </button>
            ))}
            
            {datePreset === 'Custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)}
                  className="px-2 py-1 text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)]"
                />
                <span className="text-[var(--color-text-muted)] text-[10px]">to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)}
                  className="px-2 py-1 text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)]"
                />
              </div>
            )}
          </div>
          
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shrink-0"
          >
            <Download size={14} />
            Download All (CSV)
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Invoice #</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Amount</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    No invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => (
                  <Fragment key={inv.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-hover)] group",
                        expandedInvoiceId === inv.id ? "bg-[var(--color-surface-hover)]" : ""
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <button 
                          onClick={() => toggleExpand(inv.id)}
                          className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-md hover:bg-[var(--color-border)]"
                        >
                          {expandedInvoiceId === inv.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                        {inv.invoiceNo}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar3D name={inv.customerName} size="sm" />
                          <div>
                            <p className="font-bold text-xs text-[var(--color-text)]">{inv.customerName}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{inv.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--color-text-secondary)] font-medium">
                        {inv.createdDate}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-[var(--color-text)]">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "px-2.5 py-1 text-[10px] rounded-full font-bold border inline-block text-center min-w-[70px]",
                          inv.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                          inv.paymentStatus === 'PENDING' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                          inv.paymentStatus === 'PARTIAL' ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" :
                          "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        )}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendViaAi(inv.id)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border",
                              sentAiId === inv.id
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-500/20"
                            )}
                          >
                            {sentAiId === inv.id ? (
                              <>
                                <Check size={12} />
                                <span>Sent!</span>
                              </>
                            ) : (
                              <>
                                <Send size={12} />
                                <span>AI Send</span>
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handlePrintInvoice(inv)}
                            title="Print / Download Invoice"
                            className="p-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    
                    <AnimatePresence>
                      {expandedInvoiceId === inv.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[var(--color-bg)] border-b border-[var(--color-border)] overflow-hidden"
                        >
                          <td colSpan={7} className="px-4 py-4">
                            <div className="pl-8 space-y-4">
                              <h4 className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Line Items</h4>
                              <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
                                <table className="w-full text-left">
                                  <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)]">
                                    <tr>
                                      <th className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">Service/Item</th>
                                      <th className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">Qty</th>
                                      <th className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">Unit Price</th>
                                      <th className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">GST</th>
                                      <th className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[var(--color-border)]">
                                    {inv.lineItems.map((item, idx) => (
                                      <tr key={idx}>
                                        <td className="px-3 py-2 text-xs text-[var(--color-text)]">{item.serviceName}</td>
                                        <td className="px-3 py-2 text-xs text-[var(--color-text-secondary)]">{item.quantity}</td>
                                        <td className="px-3 py-2 text-xs font-mono text-[var(--color-text-secondary)]">{formatCurrency(item.unitPrice)}</td>
                                        <td className="px-3 py-2 text-xs font-mono text-[var(--color-text-secondary)]">{item.gstRate}% ({formatCurrency(item.gstAmount)})</td>
                                        <td className="px-3 py-2 text-xs font-mono font-medium text-[var(--color-text)] text-right">{formatCurrency(item.totalPrice)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-[var(--color-surface-hover)] border-t border-[var(--color-border)]">
                                    <tr>
                                      <td colSpan={3} className="px-3 py-2"></td>
                                      <td className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase text-right">Subtotal</td>
                                      <td className="px-3 py-2 text-xs font-mono font-bold text-[var(--color-text)] text-right">{formatCurrency(inv.subtotal)}</td>
                                    </tr>
                                    {inv.discountAmount > 0 && (
                                      <tr>
                                        <td colSpan={3} className="px-3 py-2"></td>
                                        <td className="px-3 py-2 text-[10px] font-semibold text-red-500 uppercase text-right">Discount</td>
                                        <td className="px-3 py-2 text-xs font-mono font-bold text-red-500 text-right">-{formatCurrency(inv.discountAmount)}</td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td colSpan={3} className="px-3 py-2"></td>
                                      <td className="px-3 py-2 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase text-right">Grand Total</td>
                                      <td className="px-3 py-2 text-xs font-mono font-bold text-purple-600 dark:text-purple-400 text-right">{formatCurrency(inv.grandTotal)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 text-[var(--color-text)] space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base flex items-center gap-2 text-[var(--color-text)]">
                  <Receipt size={18} className="text-purple-500" />
                  Create {nicheConfig.terminology?.customer || 'Customer'} Invoice
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">{nicheConfig.terminology?.customer || 'Customer'} Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@email.com"
                      className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">{nicheConfig.terminology?.service || 'Service'} Billed *</label>
                  <input
                    type="text"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Base Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-700 dark:text-purple-300 flex justify-between items-center">
                  <span>Total Payable (incl 18% GST):</span>
                  <strong className="text-sm font-mono">{formatCurrency((parseFloat(amount) || 0) * 1.18)}</strong>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)] mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] text-xs rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs rounded-lg font-medium transition-all shadow-md"
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

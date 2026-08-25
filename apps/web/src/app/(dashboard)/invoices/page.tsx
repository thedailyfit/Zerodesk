'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Download, 
  X, 
  Printer,
  Sparkles,
  Upload,
  Palette,
  FileText,
  Building2,
  LayoutTemplate,
  MessageCircle,
  Mail,
  Check
} from 'lucide-react';
import { useNiche } from '@/components/providers/niche-provider';
import { cn, formatCurrency } from '@/lib/utils';
import { useInvoices, type InvoiceRecord } from '@/lib/invoices-store';
import { useInvoiceTemplate } from '@/lib/invoice-template-store';

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
  
  if (preset === 'Today') return { start: format(today), end };
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
  return { start: '', end: '' };
};

export default function InvoicesPage() {
  const { currentNiche } = useNiche();
  const {
    invoices,
    totalInvoiced,
    totalCollected,
    totalPending,
    totalOverdue,
    addInvoice
  } = useInvoices();
  const { template, updateTemplate } = useInvoiceTemplate();

  const [activeMainTab, setActiveMainTab] = useState<'list' | 'template'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [datePreset, setDatePreset] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('General Consultation');
  const [amount, setAmount] = useState('1500');
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
      nicheId: currentNiche,
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
      paidAmount: total,
      remainingBalance: 0,
      paymentStatus: 'PAID',
      paymentMethod: 'upi',
      sentViaAi: false,
      isPackagePayment: false,
      createdDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(false);
    setCustomer('');
    setPhone('');
    setEmail('');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateTemplate({ logoDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handlePrintInvoice = (inv: InvoiceRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const itemsHtml = inv.lineItems.map(item => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${item.serviceName}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">₹${item.unitPrice}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${item.gstRate}%</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600;">₹${item.totalPrice}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${inv.invoiceNo}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 780px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
            .clinic-name { font-size: 22px; font-weight: 800; color: #2563eb; }
            .meta { font-size: 12px; color: #64748b; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
            th { padding: 10px 8px; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 11px; text-transform: uppercase; }
            .summary { margin-top: 24px; width: 280px; margin-left: auto; font-size: 13px; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; }
            .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; border-top: 2px solid #2563eb; padding-top: 8px; margin-top: 8px; color: #0f172a; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="clinic-name">${template.clinicName}</div>
              <div class="meta">${template.clinicAddress}</div>
              <div class="meta">Phone: ${template.clinicPhone} | GST: ${template.clinicGST}</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 24px; color: #0f172a;">TAX INVOICE</h2>
              <div style="font-size: 13px; font-weight: 600; color: #2563eb; margin-top: 4px;">#${inv.invoiceNo}</div>
              <div class="meta" style="margin-top: 4px;">Date: ${inv.createdDate}</div>
            </div>
          </div>

          <div style="font-size: 13px; margin-bottom: 20px;">
            <strong>Billed To:</strong> ${inv.customerName} (${inv.phone})
          </div>

          <table>
            <thead>
              <tr>
                <th>Service / Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="row"><span>Subtotal:</span><span>₹${inv.subtotal}</span></div>
            <div class="row"><span>GST (18%):</span><span>₹${inv.totalGst}</span></div>
            <div class="total-row"><span>Grand Total:</span><span>₹${inv.grandTotal}</span></div>
          </div>

          <div style="margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center;">
            ${template.footerNote}
          </div>

          <script>
            window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 250); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [notifyToast, setNotifyToast] = useState<string | null>(null);

  const handleSendWhatsApp = (inv: InvoiceRecord) => {
    const text = encodeURIComponent(`Hello ${inv.customerName}, here is your invoice #${inv.invoiceNo} from ${template.clinicName} for ${formatCurrency(inv.grandTotal)}. View details or download your receipt anytime. Thank you!`);
    window.open(`https://wa.me/${inv.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
    setNotifyToast(`WhatsApp invoice notification sent to ${inv.customerName}!`);
    setTimeout(() => setNotifyToast(null), 3500);
  };

  const handleSendEmail = (inv: InvoiceRecord) => {
    const subject = encodeURIComponent(`Invoice #${inv.invoiceNo} from ${template.clinicName}`);
    const body = encodeURIComponent(`Dear ${inv.customerName},\n\nPlease find your invoice #${inv.invoiceNo} for ${formatCurrency(inv.grandTotal)}.\n\nThank you for choosing ${template.clinicName}.\n\nBest regards,\nClinic Operations`);
    window.open(`mailto:${inv.email || 'client@example.com'}?subject=${subject}&body=${body}`, '_blank');
    setNotifyToast(`Email invoice link prepared for ${inv.customerName}!`);
    setTimeout(() => setNotifyToast(null), 3500);
  };

  const handleDownloadAll = () => {
    if (!filtered.length) return;
    const headers = ['Invoice #', 'Customer', 'Phone', 'Subtotal', 'GST', 'Total', 'Status', 'Date'];
    const rows = filtered.map(inv => [inv.invoiceNo, `"${inv.customerName}"`, inv.phone, inv.subtotal, inv.totalGst, inv.grandTotal, inv.paymentStatus, inv.createdDate].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Toast feedback banner */}
      <AnimatePresence>
        {notifyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold"
          >
            <Check size={16} />
            <span>{notifyToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Invoice & Billing</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Automated Dispatch
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
            Create, manage receipts, and customize your clinic invoice branding template.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Tab Toggle: List vs Template */}
          <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] text-xs font-semibold">
            <button
              onClick={() => setActiveMainTab('list')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                activeMainTab === 'list' ? "bg-blue-600 text-white shadow-sm font-bold" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <FileText size={14} />
              <span>Invoices List</span>
            </button>
            <button
              onClick={() => setActiveMainTab('template')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                activeMainTab === 'template' ? "bg-blue-600 text-white shadow-sm font-bold" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <LayoutTemplate size={14} />
              <span>Invoice Template</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0"
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* VIEW 1: Invoices List */}
      {activeMainTab === 'list' && (
        <div className="space-y-6">
          {/* Summary KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Invoiced</p>
              <p className="text-2xl font-extrabold text-blue-400 font-mono">{formatCurrency(totalInvoiced)}</p>
            </div>
            <div className="p-4 bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Collected</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="p-4 bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Pending Balance</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">{formatCurrency(totalPending)}</p>
            </div>
            <div className="p-4 bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-1">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Overdue Amount</p>
              <p className="text-2xl font-extrabold text-rose-400 font-mono">{formatCurrency(totalOverdue)}</p>
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
                  className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide text-xs">
                {['ALL', 'PAID', 'PENDING', 'PARTIAL', 'OVERDUE'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "px-3 py-1.5 text-[11px] rounded-xl border font-bold transition-all shrink-0",
                      statusFilter === st
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[var(--color-border)]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] mr-1">Date:</span>
                {DATE_PRESETS.map(preset => (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={cn(
                      "px-2.5 py-1 text-[10px] rounded-lg border font-semibold transition-colors",
                      datePreset === preset
                        ? "bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]"
                        : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)]"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shrink-0"
              >
                <Download size={14} />
                Download CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[var(--color-surface)]/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-400">#{inv.invoiceNo}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-[var(--color-text)] block">{inv.customerName}</span>
                        <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{inv.phone}</span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{inv.createdDate}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[var(--color-text)]">{formatCurrency(inv.grandTotal)}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          inv.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          inv.paymentStatus === 'PENDING' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(inv)}
                            title="Send invoice via WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                          >
                            <MessageCircle size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendEmail(inv)}
                            title="Send invoice via Email"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer"
                          >
                            <Mail size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintInvoice(inv)}
                            title="Print / View Receipt"
                            className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] border border-[var(--color-border)] font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Printer size={12} />
                            <span>Print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Invoice Template & Custom Branding Tab */}
      {activeMainTab === 'template' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Template Settings */}
          <div className="lg:col-span-6 space-y-6">
            {/* Style Selector */}
            <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Palette size={16} className="text-blue-400" />
                Choose Template Layout Style (6 Clinic Styles)
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'modern', name: 'Modern Header', desc: 'Bold blue header with clean data grid' },
                  { id: 'classic', name: 'Classic Medical', desc: 'Formal two-column letterhead' },
                  { id: 'minimal', name: 'Clean Minimal', desc: 'Light borders and subtle mono styling' },
                  { id: 'branded', name: 'Branded Color', desc: 'Full-width custom color banner' },
                  { id: 'executive', name: 'Executive Suite', desc: 'High-contrast luxury dark accents' },
                  { id: 'compact', name: 'Compact POS', desc: 'Thermal receipt style quick format' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateTemplate({ templateStyle: s.id as any })}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all space-y-1",
                      template.templateStyle === s.id
                        ? "bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-blue-500/30"
                    )}
                  >
                    <span className="font-bold text-xs text-[var(--color-text)] block">{s.name}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clinic Info Fields */}
            <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-sm space-y-4 text-xs">
              <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-blue-400" />
                Clinic / Practice Header Details
              </h2>

              <div>
                <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Clinic / Business Name</label>
                <input
                  type="text"
                  value={template.clinicName}
                  onChange={(e) => updateTemplate({ clinicName: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Official Address</label>
                <input
                  type="text"
                  value={template.clinicAddress}
                  onChange={(e) => updateTemplate({ clinicAddress: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={template.clinicPhone}
                    onChange={(e) => updateTemplate({ clinicPhone: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">GST / Tax Reg Number</label>
                  <input
                    type="text"
                    value={template.clinicGST}
                    onChange={(e) => updateTemplate({ clinicGST: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Invoice Footer Note</label>
                <textarea
                  rows={2}
                  value={template.footerNote}
                  onChange={(e) => updateTemplate({ footerNote: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Logo Upload Option */}
              <div>
                <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Clinic Logo (Optional Image Upload)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 text-xs font-semibold cursor-pointer hover:bg-blue-500/20 transition-colors">
                    <Upload size={14} />
                    <span>Upload Logo Image</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {template.logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => updateTemplate({ logoDataUrl: null })}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Invoice Visual Preview */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              Live Template Preview
            </h2>

            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-6 text-xs font-sans">
              <div className="flex items-start justify-between border-b-2 border-blue-600 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-blue-600">{template.clinicName}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{template.clinicAddress}</p>
                  <p className="text-[11px] text-slate-500">Phone: {template.clinicPhone} • GST: {template.clinicGST}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-xl text-slate-900 block">TAX INVOICE</span>
                  <span className="font-mono text-blue-600 font-bold text-xs">#INV-2026-0042</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Date: Aug 24, 2026</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed To:</span>
                  <strong className="text-slate-800">Rajesh Kumar</strong>
                  <span className="text-slate-500 block text-[11px]">+91 98765 43210</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method:</span>
                  <span className="font-bold text-emerald-600">UPI / Online Paid</span>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-2">Service Description</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">Laser Skin Procedure</td>
                    <td className="py-2.5">1</td>
                    <td className="py-2.5 font-mono">₹4,000</td>
                    <td className="py-2.5 font-mono font-bold text-right">₹4,000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-semibold text-slate-800">Post-care Serum Pack</td>
                    <td className="py-2.5">1</td>
                    <td className="py-2.5 font-mono">₹1,500</td>
                    <td className="py-2.5 font-mono font-bold text-right">₹1,500</td>
                  </tr>
                </tbody>
              </table>

              <div className="w-56 ml-auto space-y-1 text-xs border-t-2 border-blue-600 pt-3">
                <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span className="font-mono">₹5,500</span></div>
                <div className="flex justify-between text-slate-600"><span>GST (18%):</span><span className="font-mono">₹990</span></div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total:</span>
                  <span className="font-mono text-blue-600">₹6,490</span>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                {template.footerNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create New Invoice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" />
                  Create New Invoice
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Customer / Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Base Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Service Name</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Invoice Template Style</label>
                  <select
                    value={template.templateStyle}
                    onChange={(e) => updateTemplate({ templateStyle: e.target.value as any })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="modern">Modern Header (Blue Accent)</option>
                    <option value="classic">Classic Medical (Two-Column Letterhead)</option>
                    <option value="minimal">Clean Minimalist (Light Monochrome)</option>
                    <option value="branded">Branded Full-Width Banner</option>
                    <option value="executive">Executive Suite (Dark Luxury)</option>
                    <option value="compact">Compact POS Receipt (Thermal Format)</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex justify-between items-center">
                  <span>Total Payable (incl. 18% GST):</span>
                  <strong className="text-sm font-mono text-white">{formatCurrency((parseFloat(amount) || 0) * 1.18)}</strong>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25"
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

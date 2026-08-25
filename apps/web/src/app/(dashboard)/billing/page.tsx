'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  IndianRupee, 
  Send, 
  Search, 
  Printer, 
  Check, 
  X, 
  Percent, 
  FileCheck,
  Building2
} from 'lucide-react';
import { useNiche } from '@/components/providers/niche-provider';
import { cn } from '@/lib/utils';
import { useServices, type ServiceOffering } from '@/lib/services-store';
import { usePatients } from '@/lib/patients-store';
import { useInvoices } from '@/lib/invoices-store';
import { useParkedBills } from '@/lib/billing-store';
import { PatientSearchInput } from '@/components/ui/patient-search-input';

export default function BillingPage() {
  const { currentNiche } = useNiche();
  const { activeServices } = useServices();
  const { patients } = usePatients();
  const { addInvoice } = useInvoices();
  const { parkedBills, setParkedBills, addParkedBill, removeParkedBill } = useParkedBills();

  const SERVICES = activeServices.filter(s => !s.isPackage);
  const PACKAGES = activeServices.filter(s => s.isPackage);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  // Patient is NOT auto-selected before searching
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [serviceSearch, setServiceSearch] = useState('');
  
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [discountMode, setDiscountMode] = useState<'amount' | 'percent'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [method, setMethod] = useState<'cash' | 'card' | 'upi' | 'insurance'>('card');

  // Partial Payment
  const [partialPaymentMode, setPartialPaymentMode] = useState<'FULL' | 'PER_SESSION' | 'CUSTOM'>('FULL');
  const [customPaymentAmount, setCustomPaymentAmount] = useState('');

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);

  const [customItems, setCustomItems] = useState<{ id: string; name: string; price: number; gstRate: number }[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customGst, setCustomGst] = useState('18');

  // Billing Park State is now global (useParkedBills)

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || (selectedPatientId ? { id: selectedPatientId, name: 'Patient #' + selectedPatientId, phone: '', email: '', priority: 'Standard', tags: [], registrationDate: '' } : undefined);

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const setItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setQuantities(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      setQuantities(prev => ({ ...prev, [id]: qty }));
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      price: Number(customPrice),
      gstRate: Number(customGst) || 18,
    };
    setCustomItems(prev => [...prev, newItem]);
    setQuantities(prev => ({ ...prev, [newItem.id]: 1 }));
    setCustomName('');
    setCustomPrice('');
    setCustomGst('18');
    setShowCustomItemModal(false);
  };

  const activeItemsList: Array<{ id: string; name: string; price: number; qty: number; gstRate: number; isPackage: boolean; totalSessions: number }> = [];

  SERVICES.forEach(s => {
    const key = s.id.toString();
    if (quantities[key]) activeItemsList.push({ id: key, name: s.name, price: s.price, qty: quantities[key], gstRate: s.gstRate || 0, isPackage: false, totalSessions: 1 });
  });

  PACKAGES.forEach(p => {
    if (quantities[p.id]) activeItemsList.push({ id: p.id, name: p.name, price: p.price, qty: quantities[p.id], gstRate: p.gstRate || 0, isPackage: true, totalSessions: p.totalSessions || 1 });
  });

  customItems.forEach(c => {
    if (quantities[c.id]) activeItemsList.push({ id: c.id, name: c.name, price: c.price, qty: quantities[c.id], gstRate: c.gstRate, isPackage: false, totalSessions: 1 });
  });

  const subtotal = activeItemsList.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  
  let calculatedDiscount = 0;
  let calculatedDiscountPercent = 0;

  if (discountMode === 'percent') {
    calculatedDiscountPercent = Math.min(100, Math.max(0, discountValue));
    calculatedDiscount = (subtotal * calculatedDiscountPercent) / 100;
  } else {
    calculatedDiscount = Math.min(subtotal, Math.max(0, discountValue));
    calculatedDiscountPercent = subtotal > 0 ? (calculatedDiscount / subtotal) * 100 : 0;
  }

  let totalGst = 0;
  activeItemsList.forEach(item => {
    const lineTotal = item.price * item.qty;
    const lineDiscountAmount = lineTotal * (calculatedDiscountPercent / 100);
    const lineTaxableAmount = Math.max(0, lineTotal - lineDiscountAmount);
    const lineTaxAmount = taxEnabled ? lineTaxableAmount * (item.gstRate / 100) : 0;
    totalGst += lineTaxAmount;
  });

  const grandTotal = Math.max(0, subtotal - calculatedDiscount + totalGst);

  const hasPackage = activeItemsList.some(i => i.isPackage);
  let amountToPay = grandTotal;
  
  if (hasPackage && partialPaymentMode !== 'FULL') {
    if (partialPaymentMode === 'PER_SESSION') {
      const pkg = activeItemsList.find(i => i.isPackage);
      const sessions = pkg?.totalSessions || 1;
      amountToPay = Math.round(grandTotal / (sessions > 0 ? sessions : 1));
    } else if (partialPaymentMode === 'CUSTOM') {
      amountToPay = Number(customPaymentAmount) || 0;
    }
  }

  const handleGenerateInvoice = () => {
    if (!selectedPatient) return;
    
    const lineItems = activeItemsList.map(item => {
      const lineTotal = item.price * item.qty;
      const lineDisc = lineTotal * (calculatedDiscountPercent / 100);
      const lineTaxable = Math.max(0, lineTotal - lineDisc);
      const gstAmount = taxEnabled ? lineTaxable * (item.gstRate / 100) : 0;
      
      return {
        serviceId: item.id.startsWith('custom-') ? undefined : item.id,
        serviceName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        gstRate: taxEnabled ? item.gstRate : 0,
        gstAmount: gstAmount,
        totalPrice: lineTotal
      };
    });
    
    addInvoice({
      nicheId: currentNiche,
      patientId: selectedPatient.id,
      customerName: selectedPatient.name,
      phone: selectedPatient.phone,
      email: selectedPatient.email,
      lineItems: lineItems,
      subtotal: subtotal,
      totalGst: totalGst,
      discountType: discountMode,
      discountValue: discountValue,
      discountAmount: calculatedDiscount,
      grandTotal: grandTotal,
      paymentMethod: method,
      paymentStatus: amountToPay < grandTotal ? 'PARTIAL' : 'PAID',
      paidAmount: amountToPay,
      remainingBalance: Math.max(0, grandTotal - amountToPay),
      dueDate: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      sentViaAi: false,
      isPackagePayment: hasPackage,
      notes: partialPaymentMode !== 'FULL' ? `Partial payment: ${partialPaymentMode}` : ''
    });
    
    setShowReceiptModal(true);
  };

  const filteredServices = SERVICES.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1250px] mx-auto pb-10 text-[var(--color-text)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl shadow-sm">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Quick Bill & Checkout</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Instant point-of-sale invoice generation and billing summary</p>
          </div>
        </div>

        <button
          onClick={handleGenerateInvoice}
          disabled={activeItemsList.length === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md",
            activeItemsList.length > 0
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 cursor-pointer"
              : "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
          )}
        >
          <Printer size={16} />
          <span>Receipt Print Preview</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[58%] space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm space-y-6">
            
            <div>
              <PatientSearchInput
                label="Patient Details / Search by ID or Name"
                selectedPatientId={selectedPatientId}
                onSelect={(patient) => setSelectedPatientId(patient.id)}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[var(--color-text)] text-base">Select Services & Procedures</h2>
                <button 
                  onClick={() => setShowCustomItemModal(true)}
                  className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300 transition-colors bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 cursor-pointer"
                >
                  <Plus size={14}/> Add Custom Item
                </button>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Quick search services or categories..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] text-xs rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredServices.map(service => {
                const key = service.id.toString();
                const qty = quantities[key] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={service.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      isSelected 
                        ? "bg-blue-500/10 border-blue-500/40 shadow-sm" 
                        : "border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-surface)] hover:border-blue-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => updateQty(key, isSelected ? -qty : 1)}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors shrink-0", 
                          isSelected ? "bg-blue-500 border-blue-500" : "border-[var(--color-border)] hover:border-blue-400"
                        )}
                      >
                        {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[var(--color-text)]">{service.name}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-[var(--color-border)] text-[var(--color-text-muted)] border border-[var(--color-border)]">{service.category}</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{service.duration} mins • GST: {service.gstRate}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-mono text-sm font-bold text-[var(--color-text)]">₹{service.price.toLocaleString()}</p>
                      
                      <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] overflow-hidden">
                        <button
                          onClick={() => updateQty(key, -1)}
                          className="px-2 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-[var(--color-text)] min-w-[20px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQty(key, 1)}
                          className="px-2 py-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h2 className="font-bold text-[var(--color-text)] text-base mb-3">Treatment Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PACKAGES.map(pkg => {
                  const qty = quantities[pkg.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div 
                      key={pkg.id} 
                      onClick={() => updateQty(pkg.id, isSelected ? -qty : 1)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform relative group", 
                        isSelected ? "border-2 border-blue-400 ring-2 ring-blue-500/20 bg-blue-500/10" : "border-[var(--color-border)] bg-[var(--color-bg)]"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-[var(--color-text)]">{pkg.name}</p>
                        {isSelected && <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded">Selected x{qty}</span>}
                      </div>
                      <p className="font-mono font-bold text-lg text-[var(--color-text)]">₹{pkg.price.toLocaleString()}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{pkg.totalSessions} Sessions • GST: {pkg.gstRate}%</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <div className="w-full lg:w-[42%] flex flex-col gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h2 className="font-bold text-[var(--color-text)] flex items-center gap-2 text-base">
                <Receipt size={18} className="text-blue-400" /> Invoice Breakdown
              </h2>
              <span className="text-[10px] font-mono bg-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                {activeItemsList.length} Item(s)
              </span>
            </div>
            
            <div className="space-y-3 min-h-[120px] max-h-60 overflow-y-auto pr-1">
              {activeItemsList.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
                  <p className="text-sm text-[var(--color-text-muted)] font-medium">No services selected yet</p>
                </div>
              ) : (
                activeItemsList.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)]">
                    <div className="space-y-0.5 max-w-[170px]">
                      <p className="text-xs font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-mono">₹{item.price.toLocaleString()} each (GST {item.gstRate}%)</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="px-1.5 py-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[var(--color-text)]">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="px-1.5 py-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-[var(--color-text)] w-16 text-right">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </span>

                      <button
                        onClick={() => setItemQty(item.id, 0)}
                        className="text-[var(--color-text-muted)] hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[var(--color-border)] pt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-[var(--color-text-muted)]">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-[var(--color-text)]">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text)] flex items-center gap-1.5 opacity-90">
                    <Percent size={13} className="text-blue-400" /> Discount
                  </span>
                  
                  <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      onClick={() => setDiscountMode('percent')}
                      className={cn("px-2 py-0.5 rounded transition-all", discountMode === 'percent' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)]")}
                    >
                      %
                    </button>
                    <button
                      onClick={() => setDiscountMode('amount')}
                      className={cn("px-2 py-0.5 rounded transition-all", discountMode === 'amount' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)]")}
                    >
                      ₹ Flat
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      min="0"
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 font-mono text-[var(--color-text)] text-xs focus:outline-none focus:border-blue-500" 
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-text-muted)]">
                      {discountMode === 'percent' ? '%' : '₹'}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-blue-400">-₹{calculatedDiscount.toLocaleString()}</p>
                    <p className="text-[9px] text-[var(--color-text-muted)]">({Math.round(calculatedDiscountPercent)}% OFF)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                <div>
                  <p className="font-semibold text-[var(--color-text)] opacity-90">GST Rates per Service</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{taxEnabled ? 'Tax calculated per line item' : 'Tax Exempt / Excluded'}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setTaxEnabled(!taxEnabled)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative p-0.5 border cursor-pointer",
                    taxEnabled ? "bg-blue-600 border-blue-500" : "bg-[var(--color-border)] border-[var(--color-border)]"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", taxEnabled ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>

              {taxEnabled && (
                <div className="flex justify-between items-center text-[var(--color-text-muted)] pt-1">
                  <span>Total Tax Amount</span>
                  <span className="font-mono text-[var(--color-text)] opacity-90">₹{totalGst.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-4 rounded-2xl border border-blue-500/30 shadow-lg">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Grand Total Payable</span>
                <p className="text-[10px] text-blue-200 opacity-80">Incl. all taxes & discounts</p>
              </div>
              <span className="font-mono text-3xl font-extrabold text-white flex items-center">
                <IndianRupee size={22} className="mr-1 text-blue-400"/>
                {grandTotal.toLocaleString()}
              </span>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Payment Option</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cash', icon: IndianRupee, label: 'Cash' },
                  { id: 'card', icon: CreditCard, label: 'Card' },
                  { id: 'upi', icon: QrCode, label: 'UPI' },
                  { id: 'insurance', icon: Receipt, label: 'Insurance' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-xl border text-[11px] font-bold transition-all",
                      method === m.id ? "bg-blue-600 border-blue-500 text-white shadow-md" : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    )}
                  >
                    <m.icon size={16} className="mb-1" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {hasPackage && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <h3 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Package Payment Option</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1 text-xs font-bold">
                    <button
                      onClick={() => setPartialPaymentMode('FULL')}
                      className={cn("flex-1 py-1.5 rounded transition-all", partialPaymentMode === 'FULL' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]")}
                    >
                      Full Amount
                    </button>
                    <button
                      onClick={() => setPartialPaymentMode('PER_SESSION')}
                      className={cn("flex-1 py-1.5 rounded transition-all", partialPaymentMode === 'PER_SESSION' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]")}
                    >
                      Per Session
                    </button>
                    <button
                      onClick={() => setPartialPaymentMode('CUSTOM')}
                      className={cn("flex-1 py-1.5 rounded transition-all", partialPaymentMode === 'CUSTOM' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]")}
                    >
                      Custom
                    </button>
                  </div>
                  {partialPaymentMode === 'CUSTOM' && (
                    <input 
                      type="number" 
                      value={customPaymentAmount}
                      onChange={(e) => setCustomPaymentAmount(e.target.value)}
                      placeholder="Enter amount to pay now..."
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  )}
                  
                  <div className="flex justify-between items-center bg-blue-900/20 p-3 rounded-xl border border-blue-500/20 mt-1">
                    <span className="text-xs text-blue-300 font-semibold">Amount to Pay Now:</span>
                    <span className="font-mono font-bold text-lg text-white">₹{amountToPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button 
                onClick={handleGenerateInvoice}
                disabled={activeItemsList.length === 0}
                className={cn(
                  "w-full py-3.5 font-bold rounded-xl text-xs transition-all shadow-lg flex justify-center items-center gap-2",
                  activeItemsList.length > 0 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer" 
                    : "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                )}
              >
                <FileCheck size={16} /> Generate Invoice & Print Preview
              </button>

              {/* Park Current Bill Option */}
              {activeItemsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const newPark = {
                      id: `park-${Date.now()}`,
                      patientId: selectedPatient?.id || 'WALK-IN',
                      patientName: selectedPatient?.name || 'Walk-in Guest',
                      phone: selectedPatient?.phone || '',
                      items: activeItemsList.map(i => i.name).join(', '),
                      totalAmount: grandTotal,
                      time: 'Just now',
                      tag: activeItemsList.some(i => i.name.toLowerCase().includes('consult')) ? 'Consultation Fee' : 'Service Session',
                      quantities: { ...quantities }
                    };
                    addParkedBill(newPark);
                    setQuantities({});
                    setSelectedPatientId('');
                  }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>📥 Park Current Bill to Holding Bay</span>
                </button>
              )}
            </div>

          </div>

          {/* Billing Park (Pending Billings Bay) */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  P
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                    Billing Park
                    <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold">
                      {parkedBills.length} Pending
                    </span>
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Pending consultation fees & services ready to process
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {parkedBills.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--color-text-muted)]">
                  No parked bills currently in the queue.
                </div>
              ) : (
                parkedBills.map((b) => (
                  <div key={b.id} className="p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-blue-500/40 transition-all space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--color-text)]">{b.patientName}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                            {b.patientId}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{b.items}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {b.tag}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-[var(--color-border)]/60 text-xs">
                      <span className="font-mono font-bold text-emerald-500">₹{b.totalAmount.toLocaleString()}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(b.patientId);
                            setQuantities(b.quantities);
                            removeParkedBill(b.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow-sm transition-all cursor-pointer"
                        >
                          Load to Bill &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => removeParkedBill(b.id)}
                          className="p-1 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCustomItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl text-[var(--color-text)] space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" /> Add Custom Line Item
                </h3>
                <button onClick={() => setShowCustomItemModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddCustomItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] opacity-90 mb-1">Item Description / Procedure</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Special Ointment / Custom Procedure"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[var(--color-text)] opacity-90 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-[var(--color-text)] opacity-90 mb-1">GST (%)</label>
                    <select
                      value={customGst}
                      onChange={(e) => setCustomGst(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setShowCustomItemModal(false)}
                    className="px-4 py-2 bg-[var(--color-border)] text-[var(--color-text)] opacity-90 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Add to Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-blue-400" />
                  <span className="font-bold text-sm">Official Invoice Print Preview</span>
                </div>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 bg-slate-50 font-sans text-xs text-slate-800 flex-1">
                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight">
                      <Building2 size={22} className="text-blue-600" />
                      <span>{currentNiche.toUpperCase()} CLINIC & SPA</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">102 Medical Enclave, Jubilee Hills, Hyderabad</p>
                    <p className="text-[11px] text-slate-500">Phone: +91 40 2345 6789 | GSTIN: 36AAAAA0000A1Z5</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 font-mono font-bold px-3 py-1 rounded-full text-xs border border-blue-200">
                      TAX INVOICE
                    </span>
                    <p className="text-[11px] font-mono text-slate-600 mt-2 font-bold">INV-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                    <p className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedPatient?.name}</h4>
                    <p className="text-[11px] text-slate-500">Patient ID: #{selectedPatient?.id} · {selectedPatient?.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</span>
                    <p className="font-bold text-xs uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                      {method} (Paid)
                    </p>
                    {amountToPay < grandTotal && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1">PARTIAL PAYMENT</p>
                    )}
                  </div>
                </div>

                <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Service / Description</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">GST</th>
                      <th className="py-2.5 px-4 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeItemsList.map((item, index) => {
                      const lineTotal = item.price * item.qty;
                      const lineDisc = lineTotal * (calculatedDiscountPercent / 100);
                      const lineTaxable = Math.max(0, lineTotal - lineDisc);
                      const gstAmt = taxEnabled ? lineTaxable * (item.gstRate / 100) : 0;
                      
                      return (
                        <tr key={item.id}>
                          <td className="py-2.5 px-4 font-mono text-slate-400">{index + 1}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-2.5 px-4 text-center font-mono">{item.qty}</td>
                          <td className="py-2.5 px-4 text-right font-mono">₹{item.price.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-slate-500">{taxEnabled ? `${item.gstRate}% (₹${Math.round(gstAmt)})` : '-'}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">₹{(lineTotal).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>

                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between text-blue-700 font-medium">
                        <span>Discount ({Math.round(calculatedDiscountPercent)}%)</span>
                        <span className="font-mono">-₹{calculatedDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Total GST</span>
                      <span className="font-mono">{taxEnabled ? `₹${totalGst.toLocaleString()}` : 'EXEMPT'}</span>
                    </div>

                    <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-900 pt-2">
                      <span>Grand Total</span>
                      <span className="font-mono text-blue-600">₹{grandTotal.toLocaleString()}</span>
                    </div>

                    {amountToPay < grandTotal && (
                      <div className="flex justify-between text-sm font-extrabold text-amber-700 border-t border-slate-200 pt-2">
                        <span>Amount Paid Now</span>
                        <span className="font-mono text-amber-600">₹{amountToPay.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-200">
                  <p>Thank you for choosing us. For questions, contact support@clinic.com</p>
                  <p className="font-mono mt-0.5">Computer-generated tax invoice. No signature required.</p>
                </div>
              </div>

              <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-t border-slate-800">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Close Preview
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      alert("Sending invoice PDF to WhatsApp / Email...");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Send size={14} /> Send PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Printer size={14} /> Print Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

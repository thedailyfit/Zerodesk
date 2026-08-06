'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';

interface ServiceItem {
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
}

interface PackageItem {
  id: string;
  name: string;
  price: number;
  color: string;
  border: string;
}

const SERVICES: ServiceItem[] = [
  { id: 1, name: 'General Consultation', category: 'Consultation', duration: 20, price: 500 },
  { id: 2, name: 'Chemical Peel', category: 'Aesthetics', duration: 30, price: 3500 },
  { id: 3, name: 'Laser Hair Removal', category: 'Laser', duration: 45, price: 5000 },
  { id: 4, name: 'Acne Scar Treatment', category: 'Dermatology', duration: 45, price: 6000 },
  { id: 5, name: 'Full Body Massage', category: 'Wellness', duration: 60, price: 4000 },
  { id: 6, name: 'PRP Hair Therapy', category: 'Hair Care', duration: 45, price: 8500 },
  { id: 7, name: 'Botox Anti-Aging (Per Unit)', category: 'Aesthetics', duration: 30, price: 12000 },
];

const PACKAGES: PackageItem[] = [
  { id: 'p1', name: 'Glow Package (3 Sessions)', price: 15000, color: 'from-amber-500/20 to-orange-500/5', border: 'border-amber-500/30' },
  { id: 'p2', name: 'Laser Pro (6 Sessions)', price: 45000, color: 'from-purple-500/20 to-pink-500/5', border: 'border-purple-500/30' },
  { id: 'p3', name: 'Annual Wellness Pass', price: 25000, color: 'from-emerald-500/20 to-teal-500/5', border: 'border-emerald-500/30' },
];

const PATIENTS = [
  { id: '001', name: 'Vikram Singh', phone: '+91 98765 43210' },
  { id: '002', name: 'Priya Sharma', phone: '+91 87654 32109' },
  { id: '003', name: 'Rajesh Kumar', phone: '+91 76543 21098' },
  { id: '004', name: 'Sneha Reddy', phone: '+91 65432 10987' },
];

export default function BillingPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('001');
  const [quantities, setQuantities] = useState<Record<string, number>>({ '1': 1, '2': 1 }); // service/package id -> qty
  const [serviceSearch, setServiceSearch] = useState('');
  
  // Tax & Discount State
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [discountMode, setDiscountMode] = useState<'amount' | 'percent'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10); // 10% or ₹ amount
  const [method, setMethod] = useState<'cash' | 'card' | 'upi' | 'insurance'>('card');

  // Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);

  // Custom Line Items added by user
  const [customItems, setCustomItems] = useState<{ id: string; name: string; price: number }[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Selected Patient object
  const selectedPatient = PATIENTS.find(p => p.id === selectedPatientId) || PATIENTS[0];

  // Helper logic for items
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
    };
    setCustomItems(prev => [...prev, newItem]);
    setQuantities(prev => ({ ...prev, [newItem.id]: 1 }));
    setCustomName('');
    setCustomPrice('');
    setShowCustomItemModal(false);
  };

  // Compile active cart items list
  const activeItemsList: Array<{ id: string; name: string; price: number; qty: number }> = [];

  SERVICES.forEach(s => {
    const key = s.id.toString();
    if (quantities[key]) {
      activeItemsList.push({ id: key, name: s.name, price: s.price, qty: quantities[key] });
    }
  });

  PACKAGES.forEach(p => {
    if (quantities[p.id]) {
      activeItemsList.push({ id: p.id, name: p.name, price: p.price, qty: quantities[p.id] });
    }
  });

  customItems.forEach(c => {
    if (quantities[c.id]) {
      activeItemsList.push({ id: c.id, name: c.name, price: c.price, qty: quantities[c.id] });
    }
  });

  // Calculate Subtotal, Tax, Discount, Total
  const subtotal = activeItemsList.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  
  let calculatedDiscount = 0;
  let calculatedDiscountPercent = 0;

  if (discountMode === 'percent') {
    calculatedDiscountPercent = Math.min(100, Math.max(0, discountValue));
    calculatedDiscount = (subtotal * calculatedDiscountPercent) / 100;
  } else {
    calculatedDiscount = Math.min(subtotal, Math.max(0, discountValue));
    calculatedDiscountPercent = subtotal > 0 ? Math.round((calculatedDiscount / subtotal) * 100) : 0;
  }

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const taxAmount = taxEnabled ? taxableAmount * 0.18 : 0;
  const grandTotal = Math.max(0, taxableAmount + taxAmount);

  // Filter services by search
  const filteredServices = SERVICES.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1250px] mx-auto pb-10">
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

        {/* Quick Action Preview */}
        <button
          onClick={() => setShowReceiptModal(true)}
          disabled={activeItemsList.length === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-md",
            activeItemsList.length > 0
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 cursor-pointer"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          <Printer size={16} />
          <span>Receipt Print Preview</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Services Selection */}
        <div className="w-full lg:w-[58%] space-y-6">
          <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Patient Selector */}
            <div>
              <label className="block font-bold text-sm text-white mb-2">Patient Details</label>
              <select 
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (ID: #{p.id}) - {p.phone}</option>
                ))}
              </select>
            </div>

            {/* Quick Search & Add Custom */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-base">Select Services & Procedures</h2>
                <button 
                  onClick={() => setShowCustomItemModal(true)}
                  className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300 transition-colors bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 cursor-pointer"
                >
                  <Plus size={14}/> Add Custom Item
                </button>
              </div>

              {/* Service Search Bar */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick search services or categories..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Services List with +/- Quantity controls */}
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
                        : "border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => updateQty(key, isSelected ? -qty : 1)}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors shrink-0", 
                          isSelected ? "bg-blue-500 border-blue-500" : "border-slate-600 hover:border-blue-400"
                        )}
                      >
                        {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-200">{service.name}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{service.category}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{service.duration} mins</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-mono text-sm font-bold text-white">₹{service.price.toLocaleString()}</p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                        <button
                          onClick={() => updateQty(key, -1)}
                          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-white min-w-[20px] text-center">{qty}</span>
                        <button
                          onClick={() => updateQty(key, 1)}
                          className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Treatment Packages */}
            <div>
              <h2 className="font-bold text-white text-base mb-3">Treatment Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PACKAGES.map(pkg => {
                  const qty = quantities[pkg.id] || 0;
                  const isSelected = qty > 0;
                  return (
                    <div 
                      key={pkg.id} 
                      onClick={() => updateQty(pkg.id, isSelected ? -qty : 1)}
                      className={cn(
                        "p-4 rounded-xl border bg-gradient-to-br cursor-pointer hover:scale-[1.02] transition-transform relative group", 
                        pkg.color, 
                        isSelected ? "border-2 border-blue-400 ring-2 ring-blue-500/20" : pkg.border
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-white">{pkg.name}</p>
                        {isSelected && <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded">Selected x{qty}</span>}
                      </div>
                      <p className="font-mono font-bold text-lg text-white">₹{pkg.price.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Panel - Invoice Summary */}
        <div className="w-full lg:w-[42%]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-white flex items-center gap-2 text-base">
                <Receipt size={18} className="text-blue-400" /> Invoice Breakdown
              </h2>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                {activeItemsList.length} Item(s)
              </span>
            </div>
            
            {/* Selected Line Items with Quantity Controls */}
            <div className="space-y-3 min-h-[120px] max-h-60 overflow-y-auto pr-1">
              {activeItemsList.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">No services selected yet</p>
                  <p className="text-[10px] text-slate-600">Select items from left to construct bill</p>
                </div>
              ) : (
                activeItemsList.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="space-y-0.5 max-w-[170px]">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">₹{item.price.toLocaleString()} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-800 rounded-lg bg-slate-900 overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-white w-16 text-right">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </span>

                      <button
                        onClick={() => setItemQty(item.id, 0)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Toggles */}
            <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-200">₹{subtotal.toLocaleString()}</span>
              </div>

              {/* Discount Section with % and Flat Amount auto-calculation */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Percent size={13} className="text-purple-400" /> Discount
                  </span>
                  
                  {/* Mode Selector */}
                  <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      onClick={() => setDiscountMode('percent')}
                      className={cn("px-2 py-0.5 rounded transition-all", discountMode === 'percent' ? "bg-purple-600 text-white" : "text-slate-400")}
                    >
                      %
                    </button>
                    <button
                      onClick={() => setDiscountMode('amount')}
                      className={cn("px-2 py-0.5 rounded transition-all", discountMode === 'amount' ? "bg-purple-600 text-white" : "text-slate-400")}
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
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-purple-500" 
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      {discountMode === 'percent' ? '%' : '₹'}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-bold text-purple-400">-₹{calculatedDiscount.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500">({calculatedDiscountPercent}% OFF)</p>
                  </div>
                </div>
              </div>

              {/* Tax Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <div>
                  <p className="font-semibold text-slate-300">GST (18% Tax)</p>
                  <p className="text-[10px] text-slate-500">{taxEnabled ? 'Tax added to total' : 'Tax Exempt / Excluded'}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setTaxEnabled(!taxEnabled)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative p-0.5 border cursor-pointer",
                    taxEnabled ? "bg-blue-600 border-blue-500" : "bg-slate-800 border-slate-700"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", taxEnabled ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>

              {taxEnabled && (
                <div className="flex justify-between items-center text-slate-400 pt-1">
                  <span>Tax Amount (18%)</span>
                  <span className="font-mono text-slate-300">₹{taxAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Grand Total Card */}
            <div className="flex justify-between items-end bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-4 rounded-2xl border border-blue-500/30 shadow-lg">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Grand Total Payable</span>
                <p className="text-[10px] text-slate-400">Incl. all taxes & discounts</p>
              </div>
              <span className="font-mono text-3xl font-extrabold text-white flex items-center">
                <IndianRupee size={22} className="mr-1 text-blue-400"/>
                {grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Option</h3>
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
                      method === m.id ? "bg-blue-600 border-blue-500 text-white shadow-md" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    )}
                  >
                    <m.icon size={16} className="mb-1" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => setShowReceiptModal(true)}
                disabled={activeItemsList.length === 0}
                className={cn(
                  "w-full py-3.5 font-bold rounded-xl text-xs transition-all shadow-lg flex justify-center items-center gap-2",
                  activeItemsList.length > 0 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                <FileCheck size={16} /> Generate Invoice & Print Preview
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      <AnimatePresence>
        {showCustomItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" /> Add Custom Line Item
                </h3>
                <button onClick={() => setShowCustomItemModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddCustomItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Item Description / Procedure</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Special Ointment / Custom Procedure"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCustomItemModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
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

      {/* Receipt Print Preview Modal */}
      <AnimatePresence>
        {showReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header bar inside modal */}
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

              {/* Printable Invoice Document Body */}
              <div className="p-8 overflow-y-auto space-y-6 bg-slate-50 font-sans text-xs text-slate-800 flex-1">
                {/* Clinic Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight">
                      <Building2 size={22} className="text-blue-600" />
                      <span>GLOW CLINIC & DERMATOLOGY</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">102 Medical Enclave, Jubilee Hills, Hyderabad</p>
                    <p className="text-[11px] text-slate-500">Phone: +91 40 2345 6789 | GSTIN: 36AAAAA0000A1Z5</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 font-mono font-bold px-3 py-1 rounded-full text-xs border border-blue-200">
                      TAX INVOICE
                    </span>
                    <p className="text-[11px] font-mono text-slate-600 mt-2 font-bold">INV-2026-08492</p>
                    <p className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Billed To Patient Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To</span>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{selectedPatient.name}</h4>
                    <p className="text-[11px] text-slate-500">Patient ID: #{selectedPatient.id} · {selectedPatient.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</span>
                    <p className="font-bold text-xs uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                      {method} (Paid)
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Service / Description</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeItemsList.map((item, index) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-4 text-center font-mono">{item.qty}</td>
                        <td className="py-2.5 px-4 text-right font-mono">₹{item.price.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">₹{(item.price * item.qty).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>

                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between text-purple-700 font-medium">
                        <span>Discount ({calculatedDiscountPercent}%)</span>
                        <span className="font-mono">-₹{calculatedDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>GST (18%)</span>
                      <span className="font-mono">{taxEnabled ? `₹${taxAmount.toLocaleString()}` : 'EXEMPT'}</span>
                    </div>

                    <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-900 pt-2">
                      <span>Total Paid</span>
                      <span className="font-mono text-blue-600">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 pt-6 border-t border-slate-200">
                  <p>Thank you for choosing Glow Clinic. For questions, contact support@glowclinic.com</p>
                  <p className="font-mono mt-0.5">Computer-generated tax invoice. No signature required.</p>
                </div>
              </div>

              {/* Print Action Bar */}
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

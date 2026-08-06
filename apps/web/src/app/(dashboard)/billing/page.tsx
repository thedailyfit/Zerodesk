'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Receipt, Plus, QrCode, Smartphone, IndianRupee, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const SERVICES = [
  { id: 1, name: 'General Consultation', duration: 20, price: 500 },
  { id: 2, name: 'Chemical Peel', duration: 30, price: 3500 },
  { id: 3, name: 'Laser Hair Removal', duration: 45, price: 5000 },
  { id: 4, name: 'Acne Scar Treatment', duration: 45, price: 6000 },
  { id: 5, name: 'Full Body Massage', duration: 60, price: 4000 },
];

const PACKAGES = [
  { id: 'p1', name: 'Glow Package', price: 15000, color: 'from-amber-500/20 to-orange-500/5', border: 'border-amber-500/30' },
  { id: 'p2', name: 'Laser Pro', price: 45000, color: 'from-purple-500/20 to-pink-500/5', border: 'border-purple-500/30' },
  { id: 'p3', name: 'Annual Wellness', price: 25000, color: 'from-emerald-500/20 to-teal-500/5', border: 'border-emerald-500/30' },
];

export default function BillingPage() {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState('card');

  const selectedItems = SERVICES.filter(s => selectedServices.includes(s.id));
  const subtotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax - discount;

  const toggleService = (id: number) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(prev => prev.filter(s => s !== id));
    } else {
      setSelectedServices(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Receipt className="text-blue-400" />
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Quick Bill & Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Services */}
        <div className="w-full lg:w-[60%] space-y-6">
          <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold text-white mb-4">Patient Details</h2>
            <select className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
              <option>Select Patient...</option>
              <option>Vikram Singh (ID: 001)</option>
              <option>Priya Sharma (ID: 002)</option>
              <option>Rajesh Kumar (ID: 003)</option>
            </select>

            <div className="flex justify-between items-center mb-4 mt-6">
              <h2 className="font-bold text-white">Services Rendered</h2>
              <button className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300 transition-colors"><Plus size={14}/> Add Custom Item</button>
            </div>
            
            <div className="space-y-2">
              {SERVICES.map(service => (
                <label key={service.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", selectedServices.includes(service.id) ? "bg-blue-500 border-blue-500" : "border-slate-600 group-hover:border-blue-400")}>
                      {selectedServices.includes(service.id) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-200">{service.name}</p>
                      <p className="text-[10px] text-slate-500">{service.duration} mins</p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-bold text-white">₹{service.price.toLocaleString()}</p>
                  <input type="checkbox" className="hidden" checked={selectedServices.includes(service.id)} onChange={() => toggleService(service.id)} />
                </label>
              ))}
            </div>

            <h2 className="font-bold text-white mb-4 mt-8">Treatment Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PACKAGES.map(pkg => (
                <div key={pkg.id} className={cn("p-4 rounded-xl border bg-gradient-to-br cursor-pointer hover:scale-[1.02] transition-transform", pkg.color, pkg.border)}>
                  <p className="text-xs font-bold text-white mb-2">{pkg.name}</p>
                  <p className="font-mono font-bold text-lg text-white">₹{pkg.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Invoice Summary */}
        <div className="w-full lg:w-[40%]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-6">
            <h2 className="font-bold text-white mb-6 flex items-center gap-2"><Receipt size={18} /> Invoice Summary</h2>
            
            <div className="space-y-4 mb-6 min-h-[120px]">
              {selectedItems.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No services selected</p>
              ) : (
                selectedItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">1x {item.name}</span>
                    <span className="font-mono font-bold text-white">₹{item.price.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Tax (18% GST)</span>
                <span className="font-mono">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Discount (₹)</span>
                <input 
                  type="number" 
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="flex justify-between items-end mb-8 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <span className="font-bold text-blue-400">Grand Total</span>
              <span className="font-mono text-3xl font-bold text-white flex items-center"><IndianRupee size={20} className="mr-1 text-blue-400"/>{Math.max(0, total).toLocaleString()}</span>
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[
                { id: 'cash', icon: IndianRupee, label: 'Cash' },
                { id: 'card', icon: CreditCard, label: 'Card' },
                { id: 'upi', icon: QrCode, label: 'UPI' },
                { id: 'insurance', icon: Receipt, label: 'Insurance' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                    method === m.id ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  <m.icon size={18} /> {m.label}
                </button>
              ))}
            </div>
            
            {method === 'upi' && (
              <div className="mb-6 p-4 border border-slate-800 rounded-xl flex items-center justify-center bg-slate-950">
                <div className="w-24 h-24 bg-slate-800 rounded flex items-center justify-center text-slate-500 flex-col gap-2">
                  <QrCode size={32} />
                  <span className="text-[10px]">Show QR</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex justify-center items-center gap-2">
                Generate Invoice
              </button>
              <button className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-sm transition-all flex justify-center items-center gap-2 border border-emerald-500/20">
                <Send size={14} /> Send to WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

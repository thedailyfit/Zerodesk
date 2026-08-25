"use client";

import React, { useState } from 'react';
import { UserCheck, Phone, MessageCircle, CheckCircle, Clock, AlertCircle, Search, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HandoffRequest {
  id: string;
  source: 'Voice AI' | 'WhatsApp AI' | 'Webchat AI';
  customerName: string;
  contact: string;
  summary: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  timestamp: Date;
}

export default function HumanHandoffRequestsPage() {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');

  const [requests, setRequests] = useState<HandoffRequest[]>([
    {
      id: 'REQ-001',
      source: 'Voice AI',
      customerName: 'Sarah Jenkins',
      contact: '+91 98765 43210',
      summary: 'Patient requested to speak with frontdesk coordinator regarding specialized package pricing and doctor consultation availability.',
      status: 'PENDING',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: 'REQ-002',
      source: 'WhatsApp AI',
      contact: '+91 98123 45678',
      customerName: 'Rahul Sharma',
      summary: 'Automated booking had a slot conflict at 4:30 PM; requested immediate callback to reschedule for evening slot.',
      status: 'PENDING',
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: 'REQ-003',
      source: 'Voice AI',
      customerName: 'Emily Clark',
      contact: '+91 98987 65432',
      summary: 'Caller inquired about pre-treatment preparation guidelines for laser procedure.',
      status: 'ACCEPTED',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: 'REQ-004',
      source: 'Webchat AI',
      customerName: 'Vikram Mehta',
      contact: '+91 97765 11223',
      summary: 'Customer wanted confirmation on whether their corporate health insurance is accepted.',
      status: 'COMPLETED',
      timestamp: new Date(Date.now() - 1000 * 60 * 60)
    }
  ]);

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r));
  };

  const handleComplete = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
  };

  const filtered = requests.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          r.contact.includes(search) ||
                          r.summary.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-500" />
            Human Hand-off Requests
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {pendingCount} Awaiting Callback
              </span>
            )}
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs mt-1">
            Real-time escalations from Voice AI, WhatsApp AI, and Webchat requiring frontdesk intervention.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or request reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {(['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all",
                filter === tab
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
              )}
            >
              {tab === 'ALL' ? 'All Requests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(request => (
          <div key={request.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border",
                    request.source === 'Voice AI' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    request.source === 'WhatsApp AI' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                  )}>
                    {request.source === 'Voice AI' ? <Phone className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                    {request.source}
                  </span>
                </div>
                <div className="flex items-center text-[11px] text-[var(--color-text-muted)] gap-1 font-mono">
                  <Clock className="w-3 h-3 text-blue-400" />
                  {Math.round((Date.now() - request.timestamp.getTime()) / 60000)}m ago
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[var(--color-text)]">{request.customerName}</h3>
                <p className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">{request.contact}</p>
              </div>

              <div className="bg-[var(--color-bg)] rounded-xl p-3 text-xs text-[var(--color-text)] border border-[var(--color-border)] leading-relaxed">
                <span className="font-bold flex items-center gap-1 mb-1 text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3 text-amber-500" /> Escalation Note
                </span>
                {request.summary}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1.5">
                <a 
                  href={`tel:${request.contact}`} 
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-blue-500 text-blue-500 transition-colors" 
                  title="Call Customer Now"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a 
                  href={`https://wa.me/${request.contact.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-emerald-500 text-emerald-500 transition-colors" 
                  title="Reply on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                <Link
                  href="/book-appointment"
                  className="p-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-blue-500 text-[var(--color-text-muted)] hover:text-blue-500 transition-colors"
                  title="Book Appointment for Patient"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div>
                {request.status === 'PENDING' && (
                  <button 
                    onClick={() => handleAccept(request.id)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    Accept Request
                  </button>
                )}
                {request.status === 'ACCEPTED' && (
                  <button 
                    onClick={() => handleComplete(request.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                )}
                {request.status === 'COMPLETED' && (
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-bold text-[var(--color-text)]">No hand-off requests found</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">All AI agent customer queries are currently resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
}

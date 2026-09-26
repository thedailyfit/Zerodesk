'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Sparkles,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Send,
  User,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { useSuperAdminStore } from '@/lib/superadmin-store';
import { apiClient } from '@/lib/api-client';

export interface GlobalSupportTicket {
  id: string;
  ticketNumber: string;
  tenantId?: string;
  tenantName: string;
  niche: string;
  subject: string;
  description?: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolutionNote?: string;
}


export default function SuperAdminSupportTicketsPage() {
  const { theme } = useTheme();
  const { tenants } = useSuperAdminStore();
  const [tickets, setTickets] = useState<GlobalSupportTicket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Open' | 'In Progress' | 'Resolved'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<GlobalSupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Load from database API and fallback to local storage
  const loadTickets = async () => {
    const readLocalTickets = () => {
      try {
        const globalKey = 'zerodesk_global_support_tickets';
        const stored = localStorage.getItem(globalKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTickets(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed loading global support tickets', e);
      }
      setTickets([]);
    };

    try {
      const data = await apiClient<any[]>('/admin/support/tickets');
      if (Array.isArray(data) && data.length > 0) {
        const mapped: GlobalSupportTicket[] = data.map((t) => ({
          id: t.id,
          ticketNumber: `ZD-${t.id.slice(0, 6).toUpperCase()}`,
          tenantId: t.tenantId,
          tenantName: t.tenant?.name || 'Workspace',
          niche: t.tenant?.industry || 'general',
          subject: t.subject,
          description: t.description,
          category: t.category,
          priority: (t.priority === 'HIGH' ? 'High' : t.priority === 'LOW' ? 'Low' : 'Medium'),
          status: (t.status === 'RESOLVED' ? 'Resolved' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Open'),
          createdAt: new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }));
        setTickets(mapped);
      } else {
        readLocalTickets();
      }
    } catch {
      readLocalTickets();
    }
  };

  useEffect(() => {
    loadTickets();
    const handleTicketCreated = () => loadTickets();
    window.addEventListener('zerodesk:support-ticket-created', handleTicketCreated);
    window.addEventListener('storage', handleTicketCreated);
    return () => {
      window.removeEventListener('zerodesk:support-ticket-created', handleTicketCreated);
      window.removeEventListener('storage', handleTicketCreated);
    };
  }, []);

  const handleUpdateStatus = async (ticketId: string, newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    setIsUpdating(true);
    const updated = tickets.map(t => {
      if (t.id === ticketId || t.ticketNumber === ticketId) {
        return { ...t, status: newStatus, resolutionNote: replyText ? replyText : t.resolutionNote };
      }
      return t;
    });

    setTickets(updated);
    try {
      localStorage.setItem('zerodesk_global_support_tickets', JSON.stringify(updated));
      window.dispatchEvent(new Event('zerodesk:support-ticket-updated'));
    } catch {}

    // Sync to backend DB if valid UUID
    if (ticketId.length > 10 && !ticketId.startsWith('t-')) {
      try {
        const dbStatus = newStatus === 'Resolved' ? 'RESOLVED' : newStatus === 'In Progress' ? 'IN_PROGRESS' : 'OPEN';
        await apiClient(`/admin/support/tickets/${ticketId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: dbStatus })
        });
      } catch (err) {
        console.warn('Failed to update ticket status on server:', err);
      }
    }

    if (selectedTicket && (selectedTicket.id === ticketId || selectedTicket.ticketNumber === ticketId)) {
      setSelectedTicket({ ...selectedTicket, status: newStatus, resolutionNote: replyText || selectedTicket.resolutionNote });
    }

    setReplyText('');
    setIsUpdating(false);
  };

  const filteredTickets = tickets.filter(t => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchQuery = t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
                       t.subject.toLowerCase().includes(search.toLowerCase()) ||
                       t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                       (t.category || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchQuery;
  });

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <LifeBuoy size={22} />
            </div>
            <span>Client Support Tickets Console</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              Live Client Sync
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-tenant support ticket queue created from client "Get Live Help" dashboards across all niches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Sync Tickets</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D111D] border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Active Tickets</span>
          <div className="text-2xl font-black text-white mt-1">{tickets.length}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">From all workspace accounts</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-md">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Open / Unassigned</span>
          <div className="text-2xl font-black text-amber-300 mt-1">{openCount}</div>
          <span className="text-[10px] text-amber-400/70 mt-1 block">Awaiting engineering response</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-md">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">In Progress</span>
          <div className="text-2xl font-black text-blue-300 mt-1">{inProgressCount}</div>
          <span className="text-[10px] text-blue-400/70 mt-1 block">Currently undergoing triage</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-md">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Resolved</span>
          <div className="text-2xl font-black text-emerald-300 mt-1">{resolvedCount}</div>
          <span className="text-[10px] text-emerald-400/70 mt-1 block">Successfully resolved with notes</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#0D111D] border border-slate-800 rounded-2xl">
        <div className="relative w-full sm:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets by ID, tenant, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'Open', 'In Progress', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0",
                statusFilter === st
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Ticket List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-7 bg-[#0D111D] border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
          {filteredTickets.map((t) => {
            const isSelected = selectedTicket?.id === t.id || selectedTicket?.ticketNumber === t.ticketNumber;
            return (
              <div
                key={t.id || t.ticketNumber}
                onClick={() => setSelectedTicket(t)}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:bg-slate-800/40 relative",
                  isSelected && "bg-rose-500/5 border-l-4 border-l-rose-500"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {t.ticketNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {t.niche}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded",
                        t.priority === 'High' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                        t.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      )}>
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white truncate">{t.subject}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                      <Building2 size={12} className="text-slate-500 shrink-0" />
                      <span>{t.tenantName}</span>
                      <span>•</span>
                      <span className="text-slate-500">{t.category}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block",
                      t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      t.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    )}>
                      {t.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1.5">{t.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="p-12 text-center text-slate-500 text-xs">
              No tickets found matching the search criteria.
            </div>
          )}
        </div>

        {/* Ticket Inspector Detail */}
        <div className="lg:col-span-5 bg-[#0D111D] border border-slate-800 rounded-2xl p-6 flex flex-col h-[600px] overflow-y-auto">
          {selectedTicket ? (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                    selectedTicket.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                    selectedTicket.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                    'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  )}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-3 leading-snug">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <Building2 size={13} className="text-slate-500" />
                  <span className="font-semibold text-slate-200">{selectedTicket.tenantName}</span>
                  <span>({selectedTicket.niche} niche)</span>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-2 flex-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ticket Details</span>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description || 'No additional description provided with this inquiry.'}
                </div>

                {selectedTicket.resolutionNote && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mt-3">
                    <span className="font-bold block mb-1">SuperAdmin Resolution Note:</span>
                    {selectedTicket.resolutionNote}
                  </div>
                )}
              </div>

              {/* Action & Resolution Form */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Update Status & Reply</span>
                <textarea
                  rows={2}
                  placeholder="Enter resolution notes for the client..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'Open')}
                    className="py-2 text-[11px] font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all"
                  >
                    Mark Open
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'In Progress')}
                    className="py-2 text-[11px] font-bold rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'Resolved')}
                    className="py-2 text-[11px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    Resolve Ticket
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
              <LifeBuoy size={36} className="text-slate-600 mb-2 stroke-1" />
              <span>Select any support ticket from the left list to review details and post resolutions.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRole } from '@/components/providers/role-provider';
import { useNiche } from '@/components/providers/niche-provider';
import { formatCurrency } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import {
  Lock, ShieldAlert, Users, Calendar, DollarSign,
  Activity, Clock, PhoneCall, PhoneMissed, Info, Star,
  CheckCircle2, XCircle, Bot, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function ManagerDashboardPage() {
  const { role } = useRole();
  const { currentNiche, nicheConfig } = useNiche();
  
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MANAGER';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    todayRevenue: 0,
    activeWaiting: 0,
    staffOnDuty: 0,
    totalStaff: 0,
    pendingApprovalsCount: 0,
  });
  const [staffList, setStaffList] = useState<any[]>([]);
  const [aiCallsList, setAiCallsList] = useState<any[]>([]);
  const [approvalsList, setApprovalsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadManagerData() {
      try {
        setLoading(true);
        const [apptsRes, invoicesRes, convsRes, staffRes] = await Promise.allSettled([
          apiClient('/appointments'),
          apiClient('/invoices'),
          apiClient('/conversations'),
          apiClient('/staff')
        ]);

        const appts = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value) ? apptsRes.value : [];
        const invoices = invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value) ? invoicesRes.value : [];
        const convs = convsRes.status === 'fulfilled' && Array.isArray(convsRes.value) ? convsRes.value : [];
        const staff = staffRes.status === 'fulfilled' && Array.isArray(staffRes.value) ? staffRes.value : [];

        const todayStr = new Date().toISOString().slice(0, 10);
        const todayAppts = appts.filter((a: any) => (a.scheduledAt || a.date || '').slice(0, 10) === todayStr);
        const waiting = todayAppts.filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED').length;
        const pending = appts.filter((a: any) => a.status === 'SCHEDULED' || a.status === 'PENDING');

        const todayInvoices = invoices.filter((inv: any) => (inv.createdAt || inv.date || '').slice(0, 10) === todayStr && inv.status === 'PAID');
        const revToday = todayInvoices.reduce((acc: number, inv: any) => acc + (Number(inv.amount || inv.total) || 0), 0);

        const onDuty = staff.filter((s: any) => s.status !== 'INACTIVE' && s.status !== 'OFF_DUTY').length;

        setStats({
          todayAppointments: todayAppts.length,
          todayRevenue: revToday,
          activeWaiting: waiting,
          staffOnDuty: onDuty || staff.length,
          totalStaff: staff.length,
          pendingApprovalsCount: pending.length,
        });

        // Real staff list
        setStaffList(staff.map((s: any) => ({
          id: s.id,
          name: s.name || 'Staff Member',
          role: s.role || s.specialty || 'Practitioner',
          status: s.status === 'ACTIVE' || !s.status ? 'on-duty' : 'off-duty',
          apts: appts.filter((a: any) => a.staffId === s.id && (a.scheduledAt || '').slice(0, 10) === todayStr).length,
          rating: s.rating || 4.9,
          initials: (s.name || 'SM').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
          avatarColor: 'bg-blue-600',
        })));

        // Real Voice AI Calls
        const voiceCalls = convs
          .filter((c: any) => (c.channel || '').toUpperCase() === 'VOICE')
          .slice(0, 6)
          .map((c: any) => {
            const durationSec = c.endedAt && c.startedAt 
              ? Math.round((new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000) 
              : 90;
            const mins = Math.floor(durationSec / 60);
            const secs = durationSec % 60;
            return {
              id: c.id,
              caller: c.customer?.name || c.customer?.phone || 'Inbound Patient',
              intent: c.aiSummary || 'General Inquiry & Appointment Booking',
              time: new Date(c.startedAt || c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              duration: `${mins}m ${secs}s`,
              outcome: c.status === 'COMPLETED' ? 'Booked' : c.status === 'HANDOFF' ? 'Escalated' : 'Info',
            };
          });
        setAiCallsList(voiceCalls);

        // Real Pending Approvals / Follow-ups
        setApprovalsList(pending.slice(0, 4).map((p: any) => ({
          id: p.id,
          staff: p.customer?.name || 'Inquiry Booking',
          type: 'Appointment',
          dates: p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending slot',
          reason: `Requested ${p.service?.name || 'Treatment'} with ${p.staff?.name || 'Physician'}`,
        })));

      } catch (err) {
        console.error('Error loading manager dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      loadManagerData();
    }
  }, [isAdmin]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 max-w-md w-full text-center shadow-xl flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Access Denied</h2>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            You do not have permission to view the Manager Dashboard. This area is restricted to Organization Admins and Super Admins.
          </p>
          <div className="flex items-center gap-2 text-sm bg-[var(--color-bg)] px-4 py-2 rounded-lg border border-[var(--color-border)]">
            <ShieldAlert size={16} className="text-amber-500" />
            <span className="text-[var(--color-text)]">Current Role: <span className="font-semibold">{role || 'Unknown'}</span></span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Terminology
  const customerTerm = nicheConfig?.terminology?.customer || 'Customer';
  const staffTerm = nicheConfig?.terminology?.staff || 'Staff';

  const kpis = [
    { label: "Today's Appointments", value: String(stats.todayAppointments), icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: `Active ${customerTerm}s Waiting`, value: String(stats.activeWaiting), icon: Users, color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { label: `${staffTerm} On Duty`, value: `${stats.staffOnDuty}/${stats.totalStaff}`, icon: Activity, color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: 'Pending Confirmations', value: String(stats.pendingApprovalsCount), icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 text-[var(--color-text)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Management Console</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Real-time live operational telemetry across clinic staff, schedules, and revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/appointments" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
            <Calendar size={16} /> All Appointments
          </Link>
          <Link href="/manage-team" className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-sm font-semibold flex items-center gap-2 shadow-sm transition-all">
            <Users size={16} /> Manage Team
          </Link>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        {/* KPI Strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div 
                key={idx} 
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{kpi.label}</span>
                  <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Main Grid: Staff & AI Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Staff & AI Calls */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Staff On Duty */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-blue-500" />
                  Staff On Duty
                </h2>
                <Link href="/manage-team" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors">
                  View Roster <ArrowUpRight size={16} />
                </Link>
              </div>

              {staffList.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
                  <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">No Staff Configured Yet</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Add doctors, nurses, and coordinators in Manage Team to view live shifts.</p>
                  <Link href="/manage-team" className="mt-3 inline-block text-xs font-semibold text-blue-500 hover:underline">
                    Add Team Members &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {staffList.map((s) => (
                    <div key={s.id} className="border border-[var(--color-border)] rounded-xl p-4 flex gap-4 items-center bg-[var(--color-bg)]">
                      <div className={`w-12 h-12 rounded-full ${s.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
                        {s.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{s.name}</h4>
                          <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            {s.rating}
                          </div>
                        </div>
                        <p className="text-[var(--color-text-muted)] text-sm truncate">{s.role}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-lg font-bold">{s.apts} <span className="text-xs font-normal text-[var(--color-text-muted)]">apts</span></div>
                        <div className={`text-xs px-2 py-1 rounded-full border ${
                          s.status === 'on-duty' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }`}>
                          {s.status === 'on-duty' ? 'On Duty' : 'Off Duty'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Calls Feed Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PhoneCall className="text-blue-500" />
                  Recent Voice AI Calls Feed
                </h2>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Clock size={16} /> Live
                </div>
              </div>

              {aiCallsList.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
                  <PhoneCall className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-sm">No Inbound Calls Yet</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Live voice logs from LiveKit & Plivo will appear here in real-time as patients call.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {aiCallsList.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          call.outcome === 'Booked' ? 'bg-emerald-500/10 text-emerald-500' :
                          call.outcome === 'Info' ? 'bg-blue-500/10 text-blue-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {call.outcome === 'Booked' ? <Calendar size={18} /> : 
                           call.outcome === 'Info' ? <Info size={18} /> : <PhoneMissed size={18} />}
                        </div>
                        <div>
                          <div className="font-semibold">{call.caller}</div>
                          <div className="text-sm text-[var(--color-text-muted)]">{call.intent}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{call.time}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{call.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </motion.div>

          {/* Right Column: Approvals & Telemetry */}
          <motion.div variants={itemVariants} className="flex flex-col gap-8">
            
            {/* Pending Approvals */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <AlertCircle className="text-amber-500" />
                Action Required
              </h2>

              {approvalsList.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm">All Clear</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">No pending appointment confirmations or client requests requiring escalation.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {approvalsList.map(app => (
                    <div key={app.id} className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-bg)] flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-2 inline-block text-amber-500">
                            {app.type} Request
                          </span>
                          <h4 className="font-semibold text-sm">{app.staff}</h4>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">{app.dates}</p>
                          <p className="text-sm mt-2">{app.reason}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Link href="/appointments" className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} /> Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Assistant Quick Status */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bot className="text-blue-500" />
                ZeroDesk AI Guardrails
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="font-medium">Multi-Doctor Round Robin</span>
                  <span className="text-emerald-400 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="font-medium">Client Consent Engine</span>
                  <span className="text-emerald-400 font-bold">Enforced</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <span className="font-medium">Automated WhatsApp Follow-ups</span>
                  <span className="text-emerald-400 font-bold">Active (15m Cron)</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}

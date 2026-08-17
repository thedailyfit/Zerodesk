'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRole } from '@/components/providers/role-provider';
import { useNiche } from '@/components/providers/niche-provider';
import { formatCurrency } from '@/lib/utils';
import {
  Lock, ShieldAlert, Users, Calendar, DollarSign,
  Activity, Clock, PhoneCall, PhoneMissed, Info, Star,
  CheckCircle2, XCircle, Bot, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function ManagerDashboardPage() {
  const { role } = useRole();
  const { currentNiche, nicheConfig } = useNiche();
  
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MANAGER';

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

  // Mocks
  const kpis = [
    { label: "Today's Appointments", value: '24', icon: Calendar, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: "Today's Revenue", value: formatCurrency ? formatCurrency(45600) : '₹45,600', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: `Active ${customerTerm}s Waiting`, value: '3', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: `${staffTerm} On Duty`, value: '6/8', icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Pending Approvals', value: '2', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'AI Calls Handled Today', value: '47', icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const staff = [
    { id: 1, name: 'Dr. Meenakshi', role: 'Dermatologist', initials: 'DM', apts: 12, rating: 4.8, status: 'on-duty', avatarColor: 'bg-violet-500' },
    { id: 2, name: 'Dr. Rajiv', role: 'Cosmetologist', initials: 'DR', apts: 9, rating: 4.5, status: 'on-break', avatarColor: 'bg-pink-500' },
    { id: 3, name: 'Priya S.', role: 'Wellness Expert', initials: 'PS', apts: 14, rating: 4.9, status: 'on-duty', avatarColor: 'bg-emerald-500' },
    { id: 4, name: 'Amit K.', role: 'Physiotherapist', initials: 'AK', apts: 7, rating: 4.6, status: 'off-duty', avatarColor: 'bg-gray-500' }
  ];

  const aiCalls = [
    { id: 1, caller: '+91 98765 43210', time: '10:45 AM', duration: '2m 14s', outcome: 'Booked', intent: 'New Appointment' },
    { id: 2, caller: 'Anjali Sharma', time: '10:30 AM', duration: '1m 05s', outcome: 'Info', intent: 'Business Hours' },
    { id: 3, caller: '+91 87654 32109', time: '10:15 AM', duration: '0m 45s', outcome: 'Missed', intent: 'Dropped' },
    { id: 4, caller: 'Rahul Verma', time: '09:55 AM', duration: '3m 20s', outcome: 'Booked', intent: 'Reschedule' },
    { id: 5, caller: 'Sneha Patel', time: '09:40 AM', duration: '1m 50s', outcome: 'Info', intent: 'Pricing Query' }
  ];

  const approvals = [
    { id: 1, type: 'Leave', staff: 'Dr. Rajiv', dates: 'Oct 12 - Oct 14', reason: 'Personal Leave' },
    { id: 2, type: 'Schedule', staff: 'Amit K.', dates: 'Today, 2 PM - 6 PM', reason: 'Shift Swap with Priya S.' }
  ];

  const departments = [
    { name: 'Dermatology', util: 92, color: 'bg-violet-500' },
    { name: 'Wellness', util: 85, color: 'bg-emerald-500' },
    { name: 'Cosmetology', util: 78, color: 'bg-pink-500' },
    { name: 'Front Desk', util: 65, color: 'bg-blue-500' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full text-[var(--color-text)]">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-8">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Operational Overview</h1>
            <p className="text-[var(--color-text-muted)] text-lg">Real-time pulse of your {currentNiche} business</p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2 rounded-xl text-sm font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Updates Active
          </div>
        </motion.div>

        {/* Real-Time KPIs Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ y: -4 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-[var(--color-text-muted)] text-sm font-medium mb-1 truncate">{kpi.label}</p>
                <h3 className="text-2xl font-bold truncate">{kpi.value}</h3>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Staff & AI Calls */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Staff Performance Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-violet-500" />
                  Staff On Duty
                </h2>
                <button className="text-sm text-violet-500 hover:text-violet-600 font-medium flex items-center gap-1 transition-colors">
                  View Roster <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map((s) => (
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
                        s.status === 'on-break' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {s.status === 'on-duty' ? 'On Duty' : s.status === 'on-break' ? 'On Break' : 'Off Duty'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Calls Feed Section */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PhoneCall className="text-blue-500" />
                  Recent AI Calls Feed
                </h2>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Clock size={16} /> Live
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {aiCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        call.outcome === 'Booked' ? 'bg-emerald-500/10 text-emerald-500' :
                        call.outcome === 'Info' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-red-500/10 text-red-500'
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
            </div>
            
          </motion.div>

          {/* Right Column: Approvals & Departments */}
          <motion.div variants={itemVariants} className="flex flex-col gap-8">
            
            {/* Pending Approvals */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <AlertCircle className="text-amber-500" />
                Action Required
              </h2>
              <div className="flex flex-col gap-4">
                {approvals.map(app => (
                  <div key={app.id} className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-bg)] flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-2 inline-block">
                          {app.type} Request
                        </span>
                        <h4 className="font-semibold text-sm">{app.staff}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{app.dates}</p>
                        <p className="text-sm mt-2">{app.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> Approve
                      </button>
                      <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Utilization */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Activity className="text-pink-500" />
                Dept. Utilization
              </h2>
              <div className="flex flex-col gap-5">
                {departments.map(dept => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>{dept.name}</span>
                      <span>{dept.util}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.util}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${dept.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}

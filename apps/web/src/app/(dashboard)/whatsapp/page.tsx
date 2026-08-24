'use client';

import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle2, XCircle, Clock, Send, Image, FileText, Mic, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Messages Today', value: 128, icon: MessageCircle, color: 'text-green-400' },
  { label: 'AI Resolved', value: '92%', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Avg Response', value: '0.8s', icon: Clock, color: 'text-blue-400' },
  { label: 'Templates Sent', value: 34, icon: Send, color: 'text-indigo-400' },
];

const recentMessages = [
  { id: '1', customer: 'Priya Sharma', message: 'Can I book an appointment for tomorrow?', response: 'Of course! I have slots available at 10 AM, 2 PM, and 4 PM. Which one works best for you?', time: '2 min ago', resolved: true },
  { id: '2', customer: 'Vikram Singh', message: 'What is the cost of laser treatment?', response: 'Our laser treatment starts at ₹3,000 per session for small areas. Would you like me to share our detailed price list?', time: '15 min ago', resolved: true },
  { id: '3', customer: 'Ananya Iyer', message: 'I have a complaint about my last visit', response: 'I\'m sorry to hear that. Let me connect you with our manager right away to resolve this.', time: '30 min ago', resolved: false },
  { id: '4', customer: 'Deepak Menon', message: '[Voice Note - 0:15]', response: 'Thank you for your voice message. I understood that you want to reschedule your appointment. Let me check available slots.', time: '1h ago', resolved: true },
];

const templates = [
  { name: 'Appointment Confirmation', category: 'Utility', status: 'APPROVED' },
  { name: 'Appointment Reminder', category: 'Utility', status: 'APPROVED' },
  { name: 'Welcome Message', category: 'Marketing', status: 'APPROVED' },
  { name: 'Review Request', category: 'Marketing', status: 'PENDING' },
  { name: 'Payment Reminder', category: 'Utility', status: 'APPROVED' },
  { name: 'Seasonal Offer', category: 'Marketing', status: 'REJECTED' },
];

const statusConfig: Record<string, { style: string; label: string }> = {
  APPROVED: { style: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Approved' },
  PENDING: { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pending' },
  REJECTED: { style: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Rejected' },
};

export default function WhatsappPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WhatsApp</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your WhatsApp Business AI integration</p>
      </div>

      {/* Connection Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text)]">WhatsApp Connected</p>
              <p className="text-xs text-[var(--color-text-muted)]">+91 40 1234 5678 · Glow Skin Clinic</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-400">Active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
            <stat.icon size={16} className={stat.color} />
            <p className="text-xl font-bold mt-2 text-[var(--color-text)]">{stat.value}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--color-text)]">{msg.customer}</span>
                  <div className="flex items-center gap-2">
                    {msg.resolved ? <CheckCircle2 size={12} className="text-green-400" /> : <XCircle size={12} className="text-amber-400" />}
                    <span className="text-[10px] text-[var(--color-text-muted)]">{msg.time}</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">👤 {msg.message}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">🤖 {msg.response}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Message Templates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Message Templates</h3>
          <div className="space-y-2">
            {templates.map((tpl) => {
              const status = statusConfig[tpl.status];
              return (
                <div key={tpl.name} className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                  <div>
                    <p className="text-sm text-[var(--color-text)]">{tpl.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{tpl.category}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 text-[10px] rounded-full border", status.style)}>{status.label}</span>
                </div>
              );
            })}
          </div>

          <h3 className="text-sm font-semibold text-[var(--color-text)] mt-6 mb-3">Supported Media</h3>
          <div className="flex gap-2 flex-wrap">
            {[
              { icon: Image, label: 'Images' },
              { icon: FileText, label: 'PDFs' },
              { icon: Mic, label: 'Voice Notes' },
              { icon: MapPin, label: 'Location' },
            ].map((media) => (
              <div key={media.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-secondary)]">
                <media.icon size={12} />
                {media.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

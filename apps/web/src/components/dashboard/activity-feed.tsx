'use client';

import { motion } from 'framer-motion';
import { Phone, MessageCircle, Globe, CheckCircle2 } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

const mockActivities = [
  { id: 1, type: 'call', user: 'Rahul Sharma', action: 'completed an AI screening call', status: 'Booked', time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), icon: Phone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 2, type: 'whatsapp', user: 'Priya Patel', action: 'sent a WhatsApp message', status: 'Resolved', time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 3, type: 'web', user: 'Amit Kumar', action: 'booked appointment via web', status: 'Confirmed', time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 4, type: 'system', user: 'System', action: 'synced 15 CRM records', status: 'Success', time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {mockActivities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass)] hover:bg-[var(--color-glass-hover)] transition-colors group"
        >
          <div className={`p-2 rounded-full ${activity.bg} ${activity.color} shrink-0`}>
            <activity.icon size={16} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--color-text)]">
              <span className="font-medium">{activity.user}</span> {activity.action}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--color-text-muted)]">{timeAgo(activity.time)}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">•</span>
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">{activity.status}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

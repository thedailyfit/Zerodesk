'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Calendar, CheckCircle2, Activity } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface ActivityItem {
  id: string;
  type: 'call' | 'whatsapp' | 'appointment' | 'system';
  user: string;
  action: string;
  status: string;
  time: string;
  icon: any;
  color: string;
  bg: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecentActivity() {
      try {
        setLoading(true);
        const [convsRes, apptsRes] = await Promise.allSettled([
          apiClient<any[]>('/conversations'),
          apiClient<any[]>('/appointments'),
        ]);

        const convs = convsRes.status === 'fulfilled' && Array.isArray(convsRes.value) ? convsRes.value : [];
        const appts = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value) ? apptsRes.value : [];

        const items: ActivityItem[] = [];

        // Add real appointment events
        appts.slice(0, 5).forEach((a: any) => {
          items.push({
            id: `appt-${a.id}`,
            type: 'appointment',
            user: a.customer?.name || a.customerName || 'Patient / Client',
            action: `booked ${a.service?.name || a.serviceName || 'an appointment'}`,
            status: a.status || 'Confirmed',
            time: a.createdAt || a.scheduledAt || new Date().toISOString(),
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          });
        });

        // Add real conversation / call events
        convs.slice(0, 5).forEach((c: any) => {
          const isVoice = (c.channel || '').toUpperCase() === 'VOICE';
          items.push({
            id: `conv-${c.id}`,
            type: isVoice ? 'call' : 'whatsapp',
            user: c.customer?.name || c.callerPhone || 'Caller',
            action: isVoice ? 'inbound voice AI call' : 'sent a messaging inquiry',
            status: c.status === 'COMPLETED' ? 'Resolved' : c.status || 'Active',
            time: c.createdAt || c.updatedAt || new Date().toISOString(),
            icon: isVoice ? Phone : MessageCircle,
            color: isVoice ? 'text-sky-500' : 'text-emerald-500',
            bg: isVoice ? 'bg-sky-500/10' : 'bg-emerald-500/10',
          });
        });

        // Sort by time descending
        items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setActivities(items.slice(0, 6));
      } catch (err) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecentActivity();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-[var(--color-text-muted)] animate-pulse">
        Loading live feed...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 flex flex-col items-center justify-center gap-2">
        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-1">
          <Activity size={20} />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text)]">All Systems Operational</p>
        <p className="text-xs text-[var(--color-text-muted)] max-w-sm">
          No live activity recorded yet. Inbound voice calls, WhatsApp messages, and appointment bookings will stream here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
          className="flex items-start gap-3.5 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)] transition-colors group"
        >
          <div className={`p-2 rounded-lg ${activity.bg} ${activity.color} shrink-0`}>
            <activity.icon size={15} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--color-text)] leading-relaxed">
              <span className="font-semibold">{activity.user}</span> {activity.action}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-[var(--color-text-muted)]">{timeAgo(activity.time)}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">•</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                {activity.status}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

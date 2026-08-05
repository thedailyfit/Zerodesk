'use client';

import { KPICard } from '@/components/dashboard/kpi-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { Phone, MessageSquare, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const chartData = [
  { name: 'Mon', calls: 140, messages: 240 },
  { name: 'Tue', calls: 230, messages: 139 },
  { name: 'Wed', calls: 200, messages: 380 },
  { name: 'Thu', calls: 278, messages: 390 },
  { name: 'Fri', calls: 189, messages: 480 },
  { name: 'Sat', calls: 239, messages: 380 },
  { name: 'Sun', calls: 349, messages: 430 },
];

const pieData = [
  { name: 'AI Resolved', value: 75, color: 'var(--color-primary)' },
  { name: 'Human Handoff', value: 25, color: 'var(--color-border)' },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Overview</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Today's Calls" 
          value="1,245" 
          numericValue={1245} 
          trend={12.5} 
          icon={Phone} 
          delay={0.1} 
        />
        <KPICard 
          title="WhatsApp Msgs" 
          value="8,432" 
          numericValue={8432} 
          trend={18.2} 
          icon={MessageSquare} 
          delay={0.2} 
        />
        <KPICard 
          title="Appointments" 
          value="142" 
          numericValue={142} 
          trend={-4.5} 
          icon={CalendarIcon} 
          delay={0.3} 
        />
        <KPICard 
          title="Revenue (Est)" 
          value="124k" 
          numericValue={124000} 
          trend={24.8} 
          icon={IndianRupee} 
          delay={0.4} 
          prefix="₹"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Volume Trend</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
                <span className="text-[var(--color-text-muted)]">Calls</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[var(--color-text-muted)]">Messages</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Area type="monotone" dataKey="calls" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMsgs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col"
        >
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6">AI Resolution Rate</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-bold text-[var(--color-text)]">75%</span>
              <span className="text-xs text-[var(--color-text-muted)]">Resolved by AI</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
        >
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6">Recent Activity</h2>
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  );
}

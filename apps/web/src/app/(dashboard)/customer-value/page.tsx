'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartHandshake,
  TrendingUp,
  AlertOctagon,
  Users,
  Search,
  Filter,
  DollarSign,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useNiche } from '@/components/providers/niche-provider';
import { formatCurrency, cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

const TOP_CUSTOMERS = [
  { name: 'Ananya Sharma', totalSpend: 145000, visits: 12, avgSpend: 12083, lastActive: '2 days ago', tier: 'Platinum VIP', risk: 'Low' },
  { name: 'Vikram Malhotra', totalSpend: 112500, visits: 8, avgSpend: 14062, lastActive: '5 days ago', tier: 'Gold', risk: 'Low' },
  { name: 'Meera Reddy', totalSpend: 98000, visits: 15, avgSpend: 6533, lastActive: '3 weeks ago', tier: 'Gold', risk: 'Medium' },
  { name: 'Rahul Kapoor', totalSpend: 85000, visits: 4, avgSpend: 21250, lastActive: '2 months ago', tier: 'Silver', risk: 'High' },
  { name: 'Snehil Verma', totalSpend: 76500, visits: 10, avgSpend: 7650, lastActive: '1 week ago', tier: 'Silver', risk: 'Low' },
  { name: 'Kavita Iyer', totalSpend: 65000, visits: 6, avgSpend: 10833, lastActive: '4 months ago', tier: 'Bronze', risk: 'High' }
];

const LTV_DISTRIBUTION = [
  { name: '< ₹15K (Entry)', count: 45, value: 450000, color: '#94a3b8' },
  { name: '₹15K - ₹50K (Core)', count: 120, value: 3600000, color: '#3b82f6' },
  { name: '₹50K - ₹1.5L (High Value)', count: 68, value: 5440000, color: '#4f46e5' },
  { name: '₹1.5L+ (VIP / Key Account)', count: 24, value: 4800000, color: '#0ea5e9' }
];

export default function CustomerValuePage() {
  const { nicheConfig } = useNiche();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const customerSingular = nicheConfig?.terminology.customer || 'Customer';
  const customerPlural = nicheConfig?.terminology.customers || 'Customers';
  const pageTitle = nicheConfig?.id === 'realestate' ? 'Pipeline & Deal Value (LTV)' : `${customerSingular} Lifetime Value (LTV)`;

  const filteredCustomers = TOP_CUSTOMERS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = selectedRisk === 'ALL' || c.risk === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              {pageTitle}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Retention & Equity
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Predictive customer equity, retention health, churn mitigation, and top-tier spending cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Avg LTV: ₹34,200
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>Total Cumulative Equity</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">₹1.42 Cr</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last quarter</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>Repeat Transaction Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">64.8%</p>
          <p className="text-xs text-[var(--color-text-secondary)]">2.8x higher than industry avg</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>High Risk / Churn Alert</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500">12 Accounts</p>
          <p className="text-xs text-[var(--color-text-secondary)]">No booking/visit in 90+ days</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>VIP Cohort ({'>'}₹1L)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-500">28 {customerPlural}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Drives 42% of total revenue</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: LTV Bracket Breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--color-text)]">Value Distribution Cohorts</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Accounts segmented by lifetime spend value</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LTV_DISTRIBUTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={11} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={11} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: 12 }}
                  formatter={(val: number) => [`₹${(val / 100000).toFixed(1)} Lakhs`, 'Total Value']}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Distribution */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Cohort Share of Revenue</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Proportion of business driven by each segment</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LTV_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {LTV_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: 12 }}
                  formatter={(val: number) => [`${val} ${customerPlural}`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Customer / Client Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Top {customerPlural} by Value</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Detailed breakdown of key accounts, visit frequency, and retention status</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Filter ${customerPlural.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="Low">Low Risk (Active)</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk (At Risk)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4">{customerSingular}</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Total Frequency</th>
                <th className="py-3 px-4">Avg Ticket Size</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Retention Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-xs">
              {filteredCustomers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar3D name={customer.name} className="w-8 h-8 text-xs font-bold shrink-0" />
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{customer.name}</p>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">ID: VIP-{100 + idx}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {customer.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[var(--color-text)]">
                    {formatCurrency(customer.totalSpend)}
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-semibold">
                    {customer.visits} times
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--color-text)]">
                    {formatCurrency(customer.avgSpend)}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                    {customer.lastActive}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-semibold",
                      customer.risk === 'Low' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                      customer.risk === 'Medium' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    )}>
                      {customer.risk} Churn Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

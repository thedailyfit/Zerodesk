'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
  Receipt,
  Clock,
  X,
  ChevronRight,
  Download,
  AlertTriangle,
  Send,
  Calendar,
  Layers
} from 'lucide-react';
import Link from 'next/link';
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
import { useMemo } from 'react';
import { usePatients } from '@/lib/patients-store';
import { useInvoices } from '@/lib/invoices-store';
import { calculateAggregateLTV, CustomerRFMResult, RfmSegment, RiskLevel, LtvTier } from '@/lib/ltv-engine';

const SEGMENT_BADGE_STYLES: Record<RfmSegment, string> = {
  'Champions & VIP': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Loyal Core': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Promising & New': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  'Needs Attention': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'At Risk / Churn Alert': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'Lost': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
};

const TIER_BADGE_STYLES: Record<LtvTier, string> = {
  'Platinum VIP': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'Gold': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Silver': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Bronze': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
};

export default function CustomerValuePage() {
  const { nicheConfig, currentNiche } = useNiche();
  const { patients } = usePatients();
  const { invoices } = useInvoices();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRFMResult | null>(null);

  const customerSingular = nicheConfig?.terminology.customer || 'Customer';
  const customerPlural = nicheConfig?.terminology.customers || 'Customers';
  const pageTitle = nicheConfig?.id === 'realestate' 
    ? 'Pipeline & Deal Value (LTV)' 
    : `${customerSingular} Lifetime Value (LTV)`;

  // Compute live RFM & LTV metrics
  const {
    totalEquity,
    avgLtv,
    avgTicketSize,
    repeatRate,
    highRiskCount,
    atRiskRevenue,
    vipCount,
    vipRevenueShare,
    topCustomers,
    distribution,
    segmentCounts
  } = useMemo(() => {
    return calculateAggregateLTV(patients, invoices, currentNiche);
  }, [patients, invoices, currentNiche]);

  const filteredCustomers = useMemo(() => {
    return topCustomers.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.patientId.toLowerCase().includes(q);

      const matchesRisk = selectedRisk === 'ALL' || c.risk === selectedRisk;
      const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
      const matchesSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;

      return matchesSearch && matchesRisk && matchesTier && matchesSegment;
    });
  }, [topCustomers, searchTerm, selectedRisk, selectedTier, selectedSegment]);

  const handleExportCSV = () => {
    if (!filteredCustomers.length) return;
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Tier', 'Segment', 'Lifetime Spend (INR)', 'Visits', 'Avg Ticket (INR)', 'Last Active', 'Risk Level', 'RFM Score'];
    const rows = filteredCustomers.map(c => [
      c.patientId,
      `"${c.name}"`,
      c.phone || '',
      c.email || '',
      c.tier,
      `"${c.segment}"`,
      c.totalSpend,
      c.visits,
      c.avgSpend,
      c.lastActive,
      c.risk,
      c.rfmScore.composite
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${nicheConfig?.id || 'zerodesk'}_ltv_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] tracking-tight">
              {pageTitle}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              RFM Equity Engine
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Real-time customer equity, RFM behavioral segmentation, churn risk intelligence, and high-value client retention.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Avg LTV: {formatCurrency(avgLtv)}
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Receipt className="w-3.5 h-3.5 text-emerald-500" />
            Avg Ticket: {formatCurrency(avgTicketSize)}
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Export filtered customer LTV data to CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Churn Alert Opportunity Banner */}
      {highRiskCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">
                {highRiskCount} {customerPlural} at Churn Risk ({formatCurrency(atRiskRevenue)} Revenue Exposure)
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                These accounts have exceeded their expected visit cadence. Automated re-engagement or personal outreach is recommended.
              </p>
            </div>
          </div>
          <Link
            href="/outbound-campaigns"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Trigger Win-Back Campaign
          </Link>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>Total Cumulative Equity</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">{formatCurrency(totalEquity)}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Live aggregated spend</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>Repeat Retention Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[var(--color-text)]">{repeatRate}%</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Multi-visit customer proportion</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>At-Risk Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-500">{formatCurrency(atRiskRevenue)}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{highRiskCount} overdue accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-medium">
            <span>VIP Revenue Share</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-500">{vipRevenueShare}%</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Driven by {vipCount} Platinum VIP accounts</p>
        </div>
      </div>

      {/* Segment Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider px-1">
          <span>Behavioral RFM Segments</span>
          <span>{filteredCustomers.length} of {topCustomers.length} {customerPlural}</span>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
          <button
            onClick={() => setSelectedSegment('ALL')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border cursor-pointer",
              selectedSegment === 'ALL'
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-blue-500/40"
            )}
          >
            All Segments ({topCustomers.length})
          </button>
          {(Object.keys(segmentCounts) as RfmSegment[]).map(seg => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(selectedSegment === seg ? 'ALL' : seg)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border flex items-center gap-1.5 cursor-pointer",
                selectedSegment === seg
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : cn("bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-blue-500/40", SEGMENT_BADGE_STYLES[seg])
              )}
            >
              <span>{seg}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                selectedSegment === seg ? "bg-white/20 text-white" : "bg-black/10 dark:bg-white/10"
              )}>
                {segmentCounts[seg]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: LTV Bracket Breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--color-text)]">Value Distribution Cohorts</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Accounts segmented by cumulative lifetime spend value</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" fontSize={10} />
                <YAxis stroke="var(--color-text-secondary)" fontSize={10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: 12 }}
                  formatter={(val: number) => [formatCurrency(val), 'Total Value']}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Distribution */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Cohort Account Breakdown</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Proportion of client base across spending tiers</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
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
      <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Top {customerPlural} by Value</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Click on any row to view complete RFM score breakdown and linked invoice records.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search by name, ID, phone...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 w-52"
              />
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="Platinum VIP">Platinum VIP</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="Low">Low Risk (Healthy)</option>
              <option value="Medium">Medium Risk (Slipping)</option>
              <option value="High">High Risk (At Risk)</option>
              <option value="Lost">Lost / Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="py-3 px-4">{customerSingular}</th>
                <th className="py-3 px-4">Tier & Segment</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Avg Ticket</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Retention Health</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--color-text-secondary)]">
                    No {customerPlural.toLowerCase()} match your current search/filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.patientId} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-[var(--color-bg)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar3D name={customer.name} className="w-8 h-8 text-xs font-bold shrink-0" />
                        <div>
                          <p className="font-semibold text-[var(--color-text)] group-hover:text-blue-500 transition-colors">
                            {customer.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--color-text-secondary)]">{customer.patientId}</span>
                            {customer.phone && (
                              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{customer.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold border w-fit", TIER_BADGE_STYLES[customer.tier])}>
                          {customer.tier}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-medium border w-fit", SEGMENT_BADGE_STYLES[customer.segment])}>
                          {customer.segment}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[var(--color-text)]">
                      {formatCurrency(customer.totalSpend)}
                    </td>
                    <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-semibold">
                      {customer.visits} {customer.visits === 1 ? 'visit' : 'visits'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[var(--color-text)]">
                      {formatCurrency(customer.avgSpend)}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                      {customer.lastActive}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-semibold border w-fit",
                          customer.risk === 'Low' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                          customer.risk === 'Medium' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        )}>
                          {customer.risk} Churn Risk
                        </span>
                        <span className="text-[9px] text-[var(--color-text-muted)]">
                          RFM Index: {customer.rfmScore.composite}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="p-1.5 text-[var(--color-text-muted)] group-hover:text-blue-600 group-hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="View detailed RFM & Invoice Breakdown"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer RFM & Invoices Detail Slide-over Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-start justify-between pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <Avatar3D name={selectedCustomer.name} className="w-12 h-12 text-sm font-bold shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text)]">{selectedCustomer.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-0.5">
                        <span className="font-mono">{selectedCustomer.patientId}</span>
                        {selectedCustomer.phone && <span>• {selectedCustomer.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Badges Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("px-3 py-1 rounded-xl text-xs font-semibold border", TIER_BADGE_STYLES[selectedCustomer.tier])}>
                    {selectedCustomer.tier}
                  </span>
                  <span className={cn("px-3 py-1 rounded-xl text-xs font-semibold border", SEGMENT_BADGE_STYLES[selectedCustomer.segment])}>
                    {selectedCustomer.segment}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-xl text-xs font-semibold border",
                    selectedCustomer.risk === 'Low' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                    selectedCustomer.risk === 'Medium' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  )}>
                    {selectedCustomer.risk} Churn Risk
                  </span>
                </div>

                {/* RFM Score Card */}
                <div className="p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Composite RFM Health Score
                    </span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                      {selectedCustomer.rfmScore.composite}/100
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-border)] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${selectedCustomer.rfmScore.composite}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)]">Recency (R)</p>
                      <p className="font-bold text-[var(--color-text)]">{selectedCustomer.rfmScore.r} / 5</p>
                      <p className="text-[9px] text-[var(--color-text-secondary)]">{selectedCustomer.lastActive}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)]">Frequency (F)</p>
                      <p className="font-bold text-[var(--color-text)]">{selectedCustomer.rfmScore.f} / 5</p>
                      <p className="text-[9px] text-[var(--color-text-secondary)]">{selectedCustomer.visits} visits</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <p className="text-[10px] text-[var(--color-text-muted)]">Monetary (M)</p>
                      <p className="font-bold text-[var(--color-text)]">{selectedCustomer.rfmScore.m} / 5</p>
                      <p className="text-[9px] text-[var(--color-text-secondary)]">{formatCurrency(selectedCustomer.totalSpend)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Financial Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1">
                    <p className="text-xs text-[var(--color-text-secondary)]">Total Realized Equity</p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(selectedCustomer.totalSpend)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1">
                    <p className="text-xs text-[var(--color-text-secondary)]">Average Ticket Size</p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{formatCurrency(selectedCustomer.avgSpend)}</p>
                  </div>
                </div>

                {/* Linked Invoice Records */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    <span>Transaction History ({selectedCustomer.invoices.length})</span>
                    <Link href="/invoices" className="text-blue-500 hover:underline flex items-center gap-1 text-[11px] font-normal">
                      All Invoices <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  
                  {selectedCustomer.invoices.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[var(--color-bg)] text-center text-xs text-[var(--color-text-muted)]">
                      No standalone invoice items generated yet. Base equity loaded from customer profile.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedCustomer.invoices.map(inv => (
                        <div key={inv.id} className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-[var(--color-text)] font-mono">{inv.invoiceNo}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">{inv.createdDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[var(--color-text)]">{formatCurrency(inv.grandTotal)}</p>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-semibold",
                              inv.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-600" :
                              inv.paymentStatus === 'PENDING' ? "bg-amber-500/10 text-amber-600" :
                              "bg-rose-500/10 text-rose-600"
                            )}>
                              {inv.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center gap-3">
                {selectedCustomer.phone && (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
                {selectedCustomer.phone && (
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

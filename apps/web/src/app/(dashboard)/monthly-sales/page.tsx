"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target,
  TrendingUp,
  Users,
  Award,
  Crown,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Check
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { formatCurrency, cn } from "@/lib/utils";

const monthlyData = [
  { month: "June", revenue: 2200000, target: 2500000 },
  { month: "July", revenue: 2450000, target: 2800000 },
  { month: "August", revenue: 2580000, target: 3000000 }
];

const categoryData = [
  { name: "Laser Treatments", value: 950000 },
  { name: "Cosmetology", value: 680000 },
  { name: "Hair Restoration", value: 520000 },
  { name: "Clinical Derm", value: 280000 },
  { name: "Products", value: 150000 }
];

const topTreatments = [
  { name: "Full Body Laser Hair Reduction", count: 124, revenue: "₹6,20,000", growth: "+12%" },
  { name: "PRP Hair Treatment", count: 98, revenue: "₹4,90,000", growth: "+8%" },
  { name: "Q-Switch Laser", count: 85, revenue: "₹3,40,000", growth: "+15%" },
  { name: "Glutathione IV", count: 62, revenue: "₹3,10,000", growth: "-2%" },
  { name: "Chemical Peel (Salicylic)", count: 145, revenue: "₹2,90,000", growth: "+5%" }
];

export default function MonthlySalesPage() {
  const [monthlyTarget, setMonthlyTarget] = useState<number>(3000000);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(750000);
  const [currentAugustRevenue, setCurrentAugustRevenue] = useState<number>(2580000);
  const [isSaved, setIsSaved] = useState(false);

  const progressPercent = Math.min(100, Math.round((currentAugustRevenue / monthlyTarget) * 100));

  const weeklyBreakdown = [
    { week: "Week 1 (Aug 1 - 7)", revenue: 680000, target: weeklyTarget, status: "Behind" },
    { week: "Week 2 (Aug 8 - 14)", revenue: 810000, target: weeklyTarget, status: "Achieved" },
    { week: "Week 3 (Aug 15 - 21)", revenue: 790000, target: weeklyTarget, status: "Achieved" },
    { week: "Week 4 (Aug 22 - 31)", revenue: 300000, target: weeklyTarget, status: "In Progress" },
  ];

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Monthly Sales & Goal Tracker</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              August 2026
            </span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Track business target achievement, weekly pace, and treatment category revenue.
          </p>
        </div>
      </div>

      {/* Main Grid: Left = Analytics & Breakdown, Right = Set Monthly Goals Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Charts & Performance Tables */}
        <div className="lg:col-span-8 space-y-6">
          {/* August Target Progress Card */}
          <div className="p-6 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">August Target Achievement Pace</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-extrabold text-[var(--color-text)] font-mono">
                    {formatCurrency(currentAugustRevenue)}
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">
                    / {formatCurrency(monthlyTarget)} Target
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-400 font-mono">{progressPercent}%</span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">Achieved</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-[var(--color-bg)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border)]">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-md shadow-blue-500/20"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-1">
              <span>Remaining: <strong className="text-[var(--color-text)] font-mono">{formatCurrency(monthlyTarget - currentAugustRevenue)}</strong></span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp size={14} /> On pace to reach {formatCurrency(monthlyTarget)} by Aug 31
              </span>
            </div>
          </div>

          {/* Historical Revenue vs Target Bar Chart */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Quarterly Revenue vs Goals</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Target</span>
              </div>
            </div>

            <div className="h-[240px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                    formatter={(val: any) => formatCurrency(Number(val))}
                  />
                  <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Treatments Revenue Table */}
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Top Performing Procedures & Services</h3>
            <div className="divide-y divide-[var(--color-border)] text-xs">
              {topTreatments.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[var(--color-text)]">{item.name}</p>
                      <span className="text-[11px] text-[var(--color-text-muted)]">{item.count} sessions completed</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text)] font-mono">{item.revenue}</p>
                    <span className={cn("text-[10px] font-semibold", item.growth.startsWith('+') ? "text-emerald-400" : "text-rose-400")}>
                      {item.growth} vs last month
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Set Monthly Goals Options Panel (As Requested) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-3">
              <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Set Business Goals</h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">Configure monthly & weekly revenue quotas</p>
              </div>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Monthly Revenue Target (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="50000"
                    value={monthlyTarget}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMonthlyTarget(val);
                      setWeeklyTarget(Math.round(val / 4));
                    }}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-8 pr-3 py-2.5 text-xs font-mono font-bold text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">Formatted: {formatCurrency(monthlyTarget)}</span>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Minimum Weekly Sales Target (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="10000"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-8 pr-3 py-2.5 text-xs font-mono font-bold text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">Auto-calculated: ~25% of monthly goal</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <Check size={14} className="text-white" />
                    <span>Goals Updated Successfully</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save & Update Targets</span>
                  </>
                )}
              </button>
            </form>

            {/* Weekly Target Breakdown Status */}
            <div className="pt-3 border-t border-[var(--color-border)] space-y-2.5">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider block">
                Weekly Target Pace
              </span>

              {weeklyBreakdown.map((w, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[var(--color-text)]">{w.week.split(' (')[0]}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded",
                      w.status === 'Achieved' ? "bg-emerald-500/10 text-emerald-400" :
                      w.status === 'Behind' ? "bg-rose-500/10 text-rose-400" :
                      "bg-blue-500/10 text-blue-400"
                    )}>
                      {w.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] font-mono">
                    <span>{formatCurrency(w.revenue)}</span>
                    <span>Target: {formatCurrency(w.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

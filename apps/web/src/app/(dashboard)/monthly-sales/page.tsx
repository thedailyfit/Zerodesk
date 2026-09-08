"use client";

import { useState, useEffect } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

export default function MonthlySalesPage() {
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500000);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(125000);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topTreatments, setTopTreatments] = useState<any[]>([]);

  useEffect(() => {
    async function loadSales() {
      try {
        setLoading(true);
        const [invoicesRes, servicesRes] = await Promise.allSettled([
          apiClient('/invoices'),
          apiClient('/services')
        ]);

        const invoices = invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value) ? invoicesRes.value : [];
        const services = servicesRes.status === 'fulfilled' && Array.isArray(servicesRes.value) ? servicesRes.value : [];

        const now = new Date();
        const currentMonthIdx = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter paid invoices
        const paid = invoices.filter((i: any) => i.status === 'PAID');
        
        // Current month revenue
        const thisMonthInvoices = paid.filter((i: any) => {
          const d = new Date(i.createdAt || i.date);
          return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
        });

        const totalThisMonth = thisMonthInvoices.reduce((acc: number, inv: any) => acc + (Number(inv.amount || inv.total) || 0), 0);
        setCurrentMonthRevenue(totalThisMonth);

        // Group last 3 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last3Months = [2, 1, 0].map(offset => {
          const d = new Date(currentYear, currentMonthIdx - offset, 1);
          const mIdx = d.getMonth();
          const y = d.getFullYear();
          const mName = monthNames[mIdx];
          const mTotal = paid
            .filter((i: any) => {
              const id = new Date(i.createdAt || i.date);
              return id.getMonth() === mIdx && id.getFullYear() === y;
            })
            .reduce((acc: number, inv: any) => acc + (Number(inv.amount || inv.total) || 0), 0);

          return {
            month: mName,
            revenue: mTotal,
            target: monthlyTarget
          };
        });
        setMonthlyData(last3Months);

        // Top services/treatments
        const serviceCounts: Record<string, { count: number; total: number }> = {};
        invoices.forEach((inv: any) => {
          const name = inv.service?.name || inv.description || 'Clinical Consultation';
          const amt = Number(inv.amount || inv.total) || 0;
          if (!serviceCounts[name]) serviceCounts[name] = { count: 0, total: 0 };
          serviceCounts[name].count++;
          serviceCounts[name].total += amt;
        });

        const sortedServices = Object.entries(serviceCounts)
          .map(([name, data]) => ({
            name,
            count: data.count,
            revenue: `₹${data.total.toLocaleString('en-IN')}`,
            growth: '+10%'
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopTreatments(sortedServices);

        // Categories
        if (sortedServices.length > 0) {
          setCategoryData(sortedServices.map(s => ({
            name: s.name,
            value: parseInt(s.revenue.replace(/[^0-9]/g, '')) || 1000
          })));
        } else {
          setCategoryData([]);
        }

      } catch (err) {
        console.error('Failed to load monthly sales:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, [monthlyTarget]);

  const progressPercent = monthlyTarget > 0 ? Math.min(100, Math.round((currentMonthRevenue / monthlyTarget) * 100)) : 0;

  const weeklyBreakdown = [
    { week: "Week 1 (Days 1 - 7)", revenue: Math.round(currentMonthRevenue * 0.3), target: weeklyTarget, status: currentMonthRevenue * 0.3 >= weeklyTarget ? "Achieved" : "In Progress" },
    { week: "Week 2 (Days 8 - 14)", revenue: Math.round(currentMonthRevenue * 0.3), target: weeklyTarget, status: currentMonthRevenue * 0.3 >= weeklyTarget ? "Achieved" : "In Progress" },
    { week: "Week 3 (Days 15 - 21)", revenue: Math.round(currentMonthRevenue * 0.25), target: weeklyTarget, status: "In Progress" },
    { week: "Week 4 (Days 22 - End)", revenue: Math.round(currentMonthRevenue * 0.15), target: weeklyTarget, status: "In Progress" },
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
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Real-time revenue attribution, target pacing, and treatment profitability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/invoices" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all">
            <IndianRupee size={14} /> View All Invoices
          </Link>
        </div>
      </div>

      {/* Hero Goal Pacing Banner */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
              Current Month Target Pace
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[var(--color-text)] tracking-tight">
                ₹{currentMonthRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-[var(--color-text-muted)] font-medium">
                / ₹{monthlyTarget.toLocaleString('en-IN')} Target
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400 font-mono">{progressPercent}%</span>
              <span className="text-xs text-[var(--color-text-muted)] block">Month Target Met</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--color-bg)] rounded-full h-3 mt-6 p-0.5 border border-[var(--color-border)]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full"
          />
        </div>
      </div>

      {/* Grid: 3-Month Trend & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-6">3-Month Revenue Trend vs Target</h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', color: 'var(--color-text)' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services Table */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
          <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-4">Top Revenue Services</h2>
          {topTreatments.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)]">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No invoiced services logged yet this month.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topTreatments.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[var(--color-text)] truncate max-w-[150px]">{t.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{t.count} sittings</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">{t.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

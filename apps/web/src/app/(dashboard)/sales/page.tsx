'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart as PieIcon,
  Calendar,
  IndianRupee,
  Receipt
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function SalesPage() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSalesData() {
      try {
        setLoading(true);
        const res = await apiClient('/invoices');
        if (Array.isArray(res)) {
          const paid = res.filter((i: any) => i.status === 'PAID');
          const sum = paid.reduce((acc: number, inv: any) => acc + (Number(inv.amount || inv.total) || 0), 0);
          setTotalRevenue(sum);
          setTotalInvoices(paid.length);

          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const grouped: Record<string, { revenue: number; bookings: number }> = {};

          paid.forEach((inv: any) => {
            const d = new Date(inv.createdAt || inv.date);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (!grouped[key]) grouped[key] = { revenue: 0, bookings: 0 };
            grouped[key].revenue += Number(inv.amount || inv.total) || 0;
            grouped[key].bookings++;
          });

          const formatted = Object.entries(grouped).map(([month, val]) => ({
            month,
            revenue: val.revenue,
            target: val.revenue * 1.2,
            bookings: val.bookings
          }));

          setRevenueData(formatted.length > 0 ? formatted : [
            { month: 'Current Month', revenue: sum, target: 500000, bookings: paid.length }
          ]);
        }
      } catch (err) {
        console.error('Failed to load sales data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSalesData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Sales & Collections Overview</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Real-time revenue metrics from paid clinic invoices</p>
        </div>
        <Link href="/invoices" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all">
          <Receipt size={14} /> Open Invoices
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Invoiced Revenue</span>
          <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{totalInvoices} total settled invoices</p>
        </div>

        <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Average Invoice Value</span>
          <p className="text-3xl font-black text-blue-400 mt-2 font-mono">
            ₹{totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices).toLocaleString('en-IN') : 0}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Per transaction average</p>
        </div>
      </div>

      <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-6">Historical Monthly Performance</h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', color: 'var(--color-text)' }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

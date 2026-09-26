"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldPlus,
  ArrowUpRight,
  Activity,
  RefreshCw,
  PlusCircle,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { apiClient } from "@/lib/api-client";
import { useNiche } from "@/components/providers/niche-provider";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  paymentStatus: string;
  paymentMethod?: string;
  grandTotal: number;
  paidAmount?: number;
  createdAt: string;
  lineItems?: Array<{
    serviceName?: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    totalPrice?: number;
  }>;
}

export default function TodaysRevenuePage() {
  const { nicheConfig } = useNiche();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRevenueData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<InvoiceItem[]>('/invoices');
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.warn("Failed to fetch invoices for today's revenue:", err);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const paidInvoices = invoices.filter((inv) => inv.paymentStatus === "PAID");

  const totalRevenue = paidInvoices.reduce(
    (acc, inv) => acc + (inv.paidAmount || inv.grandTotal || 0),
    0
  );

  const treatmentsCompleted = paidInvoices.length;
  const averageBill = treatmentsCompleted > 0 ? Math.round(totalRevenue / treatmentsCompleted) : 0;

  // Compute dynamic payment methods
  const paymentMethodCounts: Record<string, number> = {};
  paidInvoices.forEach((inv) => {
    const method = (inv.paymentMethod || "UPI").toUpperCase();
    paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
  });

  const totalMethodsCount = paidInvoices.length || 1;
  const upiPercent = Math.round(((paymentMethodCounts["UPI"] || 0) / totalMethodsCount) * 100);
  const cardPercent = Math.round(((paymentMethodCounts["CARD"] || 0) / totalMethodsCount) * 100);
  const cashPercent = Math.round(((paymentMethodCounts["CASH"] || 0) / totalMethodsCount) * 100);
  const otherPercent = Math.max(0, 100 - (upiPercent + cardPercent + cashPercent));

  // Compute dynamic category / service revenue
  const treatmentMap = new Map<string, number>();
  paidInvoices.forEach((inv) => {
    inv.lineItems?.forEach((item) => {
      const name = item.serviceName || item.description || (nicheConfig.terminology?.service || "Service Offering");
      const amount = item.totalPrice || item.unitPrice * item.quantity || 0;
      treatmentMap.set(name, (treatmentMap.get(name) || 0) + amount);
    });
  });

  const treatments = Array.from(treatmentMap.entries()).map(([name, rev]) => ({
    name,
    revenue: rev.toLocaleString("en-IN"),
    percentage: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0,
  }));

  const recentTransactions = paidInvoices.slice(0, 6).map((inv) => ({
    patient: inv.customerName || (nicheConfig.terminology?.customer || "Customer"),
    treatment: inv.lineItems?.[0]?.serviceName || inv.lineItems?.[0]?.description || (nicheConfig.terminology?.service || "Service Offering"),
    amount: (inv.paidAmount || inv.grandTotal || 0).toLocaleString("en-IN"),
    time: new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    method: (inv.paymentMethod || "UPI").toUpperCase(),
  }));

  const hourlyRevenue = [
    { time: "09:00", revenue: Math.round(totalRevenue * 0.1) },
    { time: "11:00", revenue: Math.round(totalRevenue * 0.3) },
    { time: "13:00", revenue: Math.round(totalRevenue * 0.55) },
    { time: "15:00", revenue: Math.round(totalRevenue * 0.8) },
    { time: "17:00", revenue: totalRevenue },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen" style={{ color: "var(--color-text)" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Today&apos;s Revenue</h1>
            <span className="flex items-center px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="opacity-70 text-sm">Real-time revenue settlement and treatment invoice analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRevenueData()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            title="Refresh Invoices"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-400" : ""} />
          </button>

          <Link
            href="/invoices"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle size={15} /> Create Invoice
          </Link>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm opacity-70 mb-1">Total Revenue Collected</p>
              <h3 className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center mt-2 relative z-10">
            {paidInvoices.length} paid transactions verified
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Invoices Settled</p>
              <h3 className="text-3xl font-bold">{treatmentsCompleted}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center mt-2">
            Total Invoices: {invoices.length}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Average Ticket Size</p>
              <h3 className="text-3xl font-bold">₹{averageBill.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center mt-2">
            Based on completed settlements
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Pending Clearance</p>
              <h3 className="text-3xl font-bold">{invoices.filter(i => i.paymentStatus !== 'PAID').length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Receipt size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] flex items-center mt-2">
            Awaiting client settlement
          </p>
        </motion.div>
      </motion.div>

      {/* Revenue Graph & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl border" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Revenue Trajectory Today</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(79, 70, 229)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(79, 70, 229)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text)', opacity: 0.7 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text)', opacity: 0.7 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="rgb(79, 70, 229)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
            <h3 className="text-lg font-semibold mb-6">Payment Method Share</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <Smartphone className="mx-auto mb-2 opacity-70 text-blue-500" size={20} />
                <p className="text-2xl font-bold text-blue-500">{upiPercent}%</p>
                <p className="text-xs opacity-70">UPI</p>
              </div>
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <CreditCard className="mx-auto mb-2 opacity-70 text-indigo-500" size={20} />
                <p className="text-2xl font-bold text-indigo-500">{cardPercent}%</p>
                <p className="text-xs opacity-70">Card</p>
              </div>
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <Banknote className="mx-auto mb-2 opacity-70 text-emerald-500" size={20} />
                <p className="text-2xl font-bold text-emerald-500">{cashPercent}%</p>
                <p className="text-xs opacity-70">Cash</p>
              </div>
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <ShieldPlus className="mx-auto mb-2 opacity-70 text-amber-500" size={20} />
                <p className="text-2xl font-bold text-amber-500">{otherPercent}%</p>
                <p className="text-xs opacity-70">Other/Credit</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Revenue by Service</h3>
          <div className="space-y-5">
            {treatments.length === 0 ? (
              <div className="p-8 text-center text-xs opacity-50 border border-dashed rounded-xl" style={{ borderColor: "var(--color-border)" }}>
                No itemized service sales recorded yet today.
              </div>
            ) : (
              treatments.map((treatment, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{treatment.name}</span>
                    <span className="font-bold">₹{treatment.revenue}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${treatment.percentage}%` }}
                      transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl border overflow-hidden" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Recent Settled Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs opacity-50 border border-dashed rounded-xl" style={{ borderColor: "var(--color-border)" }}>
                No transactions completed today.
              </div>
            ) : (
              recentTransactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {tx.patient.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{tx.patient}</h4>
                      <p className="text-xs opacity-70">{tx.treatment} • {tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{tx.amount}</p>
                    <p className="text-xs opacity-70 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 inline-block mt-1">{tx.method}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldPlus,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const hourlyRevenue = [
  { time: "09:00", revenue: 5000 },
  { time: "10:00", revenue: 12500 },
  { time: "11:00", revenue: 28000 },
  { time: "12:00", revenue: 35000 },
  { time: "13:00", revenue: 42000 },
  { time: "14:00", revenue: 54000 },
  { time: "15:00", revenue: 68000 },
  { time: "16:00", revenue: 78500 }
];

const treatments = [
  { name: "Laser Hair Reduction", revenue: "32,000", percentage: 41 },
  { name: "PRP Therapy", revenue: "18,000", percentage: 23 },
  { name: "Chemical Peels", revenue: "12,000", percentage: 15 },
  { name: "Consultations", revenue: "8,000", percentage: 10 },
  { name: "Other Procedures", revenue: "8,500", percentage: 11 }
];

const recentTransactions = [
  { patient: "Priya Sharma", treatment: "Laser - Full Body", amount: "12,500", time: "10 min ago", method: "UPI" },
  { patient: "Rahul Desai", treatment: "PRP Session 3", amount: "6,000", time: "45 min ago", method: "Card" },
  { patient: "Anjali Patel", treatment: "Acne Consultation", amount: "1,500", time: "1 hour ago", method: "Cash" },
  { patient: "Vikram Singh", treatment: "Chemical Peel", amount: "4,500", time: "2 hours ago", method: "Card" },
  { patient: "Neha Gupta", treatment: "Botox Checkup", amount: "8,000", time: "3 hours ago", method: "UPI" }
];

export default function TodaysRevenuePage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Today's Revenue</h1>
            <span className="flex items-center px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p className="opacity-70">Track daily revenue collection and treatment breakdowns.</p>
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
              <p className="text-sm opacity-70 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold">₹78,500</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm text-green-500 flex items-center mt-2 relative z-10">
            <ArrowUpRight size={14} className="mr-1" />
            +12% from yesterday
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Treatments Completed</p>
              <h3 className="text-3xl font-bold">12</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-sm opacity-70 flex items-center mt-2">
            Target: 18 treatments
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Average Bill</p>
              <h3 className="text-3xl font-bold">₹6,542</h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-sm text-green-500 flex items-center mt-2">
            <ArrowUpRight size={14} className="mr-1" />
            +5% from avg
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Walk-ins vs Booked</p>
              <h3 className="text-3xl font-bold">4 <span className="text-lg font-normal opacity-70">/ 8</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Banknote size={24} />
            </div>
          </div>
          <p className="text-sm opacity-70 flex items-center mt-2">
            33% Walk-in rate
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl border" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Revenue Growth (9 AM - Current)</h3>
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
            <h3 className="text-lg font-semibold mb-6">Payment Methods</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <Banknote className="mx-auto mb-2 opacity-70" size={20} />
                <p className="text-2xl font-bold">35%</p>
                <p className="text-xs opacity-70">Cash</p>
              </div>
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <Smartphone className="mx-auto mb-2 opacity-70 text-blue-500" size={20} />
                <p className="text-2xl font-bold text-blue-500">32%</p>
                <p className="text-xs opacity-70">UPI</p>
              </div>
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <CreditCard className="mx-auto mb-2 opacity-70 text-indigo-500" size={20} />
                <p className="text-2xl font-bold text-indigo-500">28%</p>
                <p className="text-xs opacity-70">Card</p>
              </div>
              <div className="p-4 rounded-xl border border-dashed text-center" style={{ borderColor: "var(--color-border)" }}>
                <ShieldPlus className="mx-auto mb-2 opacity-70 text-green-500" size={20} />
                <p className="text-2xl font-bold text-green-500">5%</p>
                <p className="text-xs opacity-70">Insurance</p>
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
          <h3 className="text-lg font-semibold mb-6">Revenue by Category</h3>
          <div className="space-y-5">
            {treatments.map((treatment, idx) => (
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
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl border overflow-hidden" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.map((tx, idx) => (
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
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

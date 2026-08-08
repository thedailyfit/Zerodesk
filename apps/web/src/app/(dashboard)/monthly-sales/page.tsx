"use client";

import { motion } from "framer-motion";
import { 
  Target,
  TrendingUp,
  Users,
  Award,
  Crown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from "recharts";

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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Monthly Sales Performance</h1>
          <p className="opacity-70">Analyze revenue trends, targets, and top-performing categories for August.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="md:col-span-2 p-6 rounded-2xl border relative overflow-hidden" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-70 mb-1">August Target Progress</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-4xl font-bold text-primary">₹25.8L</h3>
                  <span className="text-lg opacity-70">/ ₹30L</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Target size={32} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>86% Achieved</span>
                <span>14% Remaining</span>
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '86%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                </motion.div>
              </div>
              <p className="text-xs opacity-70 text-right mt-1">4 days remaining in month</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border flex flex-col justify-center" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Users size={18} className="mr-2 text-blue-500" />
            Patient Revenue Split
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-blue-500">Returning Patients</span>
                <span className="font-bold">65% (₹16.7L)</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-green-500">New Patients</span>
                <span className="font-bold">35% (₹9.1L)</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-green-500 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">3-Month Comparison</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text)', opacity: 0.7 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/100000}L`} tick={{ fill: 'var(--color-text)', opacity: 0.7 }} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-border)', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  formatter={(value: number) => [`₹${(value/100000).toFixed(1)}L`]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Actual Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="target" name="Target" fill="#94a3b8" fillOpacity={0.3} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Revenue by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" opacity={0.4} />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/100000}L`} tick={{ fill: 'var(--color-text)', opacity: 0.7 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text)', fontWeight: 500 }} width={120} />
                <Tooltip 
                  cursor={{ fill: 'var(--color-border)', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  formatter={(value: number) => [`₹${(value/100000).toFixed(1)}L`, 'Revenue']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--color-primary-h, 221), 83%, ${53 + index * 8}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl border" 
        style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Award className="mr-2 text-yellow-500" size={20} />
            Top Performing Treatments
          </h3>
          <button className="text-sm text-primary hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <th className="pb-3 font-medium opacity-70">Treatment Name</th>
                <th className="pb-3 font-medium opacity-70">Sessions Completed</th>
                <th className="pb-3 font-medium opacity-70">Revenue Generated</th>
                <th className="pb-3 font-medium opacity-70">MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {topTreatments.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors" style={{ borderColor: "var(--color-border)" }}>
                  <td className="py-4 flex items-center font-medium">
                    {idx === 0 && <Crown size={16} className="text-yellow-500 mr-2" />}
                    {idx === 1 && <Crown size={16} className="text-gray-400 mr-2" />}
                    {idx === 2 && <Crown size={16} className="text-amber-700 mr-2" />}
                    {idx > 2 && <span className="w-4 mr-2"></span>}
                    {item.name}
                  </td>
                  <td className="py-4">{item.count}</td>
                  <td className="py-4 font-bold">{item.revenue}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${item.growth.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {item.growth.startsWith('+') ? <TrendingUp size={12} className="mr-1" /> : null}
                      {item.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

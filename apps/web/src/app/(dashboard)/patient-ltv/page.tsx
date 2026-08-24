"use client";

import { motion } from "framer-motion";
import { 
  HeartHandshake,
  TrendingUp,
  AlertOctagon,
  Users,
  Search,
  Filter
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell,
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

const topPatients = [
  { name: "Ananya Sharma", totalSpend: "₹1,45,000", visits: 12, avgVisit: "₹12,083", lastVisit: "2 days ago", risk: "Low" },
  { name: "Vikram Malhotra", totalSpend: "₹1,12,500", visits: 8, avgVisit: "₹14,062", lastVisit: "5 days ago", risk: "Low" },
  { name: "Meera Reddy", totalSpend: "₹98,000", visits: 15, avgVisit: "₹6,533", lastVisit: "3 weeks ago", risk: "Medium" },
  { name: "Rahul Kapoor", totalSpend: "₹85,000", visits: 4, avgVisit: "₹21,250", lastVisit: "2 months ago", risk: "High" },
  { name: "Snehil Verma", totalSpend: "₹76,500", visits: 10, avgVisit: "₹7,650", lastVisit: "1 week ago", risk: "Low" },
  { name: "Kavita Iyer", totalSpend: "₹65,000", visits: 6, avgVisit: "₹10,833", lastVisit: "4 months ago", risk: "High" }
];

const ltvDistribution = [
  { name: "< ₹5K", value: 45, color: "#94a3b8" },
  { name: "₹5K - ₹15K", value: 120, color: "#3b82f6" },
  { name: "₹15K - ₹50K", value: 145, color: "#8b5cf6" },
  { name: "₹50K+", value: 32, color: "#ec4899" }
];

const categoryLTV = [
  { name: "Laser Treatments", value: 65 },
  { name: "Cosmetology", value: 20 },
  { name: "Hair Therapy", value: 10 },
  { name: "Dermatology", value: 5 }
];

export default function PatientLTVPage() {
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

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low': return <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">Low Risk</span>;
      case 'Medium': return <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold">Medium Risk</span>;
      case 'High': return <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-semibold">High Risk</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen" style={{ color: "var(--color-text)" }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Patient Lifetime Value</h1>
          <p className="opacity-70">Monitor patient loyalty, average spend, and retention metrics.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Average LTV</p>
              <h3 className="text-3xl font-bold">₹24,500</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <HeartHandshake size={24} />
            </div>
          </div>
          <p className="text-sm text-green-500 flex items-center mt-2">
            <TrendingUp size={14} className="mr-1" />
            +8% YoY
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Highest LTV</p>
              <h3 className="text-3xl font-bold">₹1.45L</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm opacity-70 flex items-center mt-2">
            Ananya Sharma
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Active Patients</p>
              <h3 className="text-3xl font-bold">342</h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm text-green-500 flex items-center mt-2">
            +12 this month
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">At-Risk Patients</p>
              <h3 className="text-3xl font-bold text-orange-500">28</h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <AlertOctagon size={24} />
            </div>
          </div>
          <p className="text-sm opacity-70 flex items-center mt-2">
            No visits in 3+ months
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border flex flex-col" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">LTV Distribution</h3>
          <div className="flex-grow flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ltvDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ltvDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border flex flex-col" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Treatment Category LTV Contribution</h3>
          <div className="flex-grow flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryLTV}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryLTV.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--color-primary-h, 221), ${60 + index * 10}%, ${50 + index * 10}%)`} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                />
              </PieChart>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold">High-Value Patient Directory</h3>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" size={16} />
              <input 
                type="text" 
                placeholder="Search patients..." 
                className="pl-9 pr-4 py-2 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ borderColor: "var(--color-border)" }}
              />
            </div>
            <button className="p-2 rounded-xl border flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" style={{ borderColor: "var(--color-border)" }}>
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                <th className="pb-3 font-medium opacity-70">Patient Name</th>
                <th className="pb-3 font-medium opacity-70">Total Spend</th>
                <th className="pb-3 font-medium opacity-70">Visits</th>
                <th className="pb-3 font-medium opacity-70">Avg Per Visit</th>
                <th className="pb-3 font-medium opacity-70">Last Visit</th>
                <th className="pb-3 font-medium opacity-70">Churn Risk</th>
              </tr>
            </thead>
            <tbody>
              {topPatients.map((patient, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors" style={{ borderColor: "var(--color-border)" }}>
                  <td className="py-4 flex items-center font-medium">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold mr-3 shadow-md">
                      {patient.name.charAt(0)}
                    </div>
                    {patient.name}
                  </td>
                  <td className="py-4 font-bold">{patient.totalSpend}</td>
                  <td className="py-4">{patient.visits}</td>
                  <td className="py-4">{patient.avgVisit}</td>
                  <td className="py-4 opacity-70">{patient.lastVisit}</td>
                  <td className="py-4">
                    {getRiskBadge(patient.risk)}
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

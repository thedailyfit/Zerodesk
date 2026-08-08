"use client";

import { motion } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  Activity, 
  Users, 
  Stethoscope, 
  Syringe, 
  Scissors, 
  PhoneCall 
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

const hourlyData = [
  { time: "09:00", delay: 5 },
  { time: "10:00", delay: 12 },
  { time: "11:00", delay: 25 },
  { time: "12:00", delay: 18 },
  { time: "13:00", delay: 8 },
  { time: "14:00", delay: 35 },
  { time: "15:00", delay: 22 },
  { time: "16:00", delay: 15 },
  { time: "17:00", delay: 10 },
  { time: "18:00", delay: 4 }
];

const bottlenecks = [
  { name: "Dermatology", icon: Stethoscope, delay: "15 min avg", severity: "medium", color: "var(--color-primary)" },
  { name: "Cosmetology", icon: Syringe, delay: "25 min avg", severity: "high", color: "var(--color-danger)" },
  { name: "Hair Restoration", icon: Scissors, delay: "10 min avg", severity: "low", color: "var(--color-success)" },
  { name: "Front Desk", icon: PhoneCall, delay: "5 min avg", severity: "low", color: "var(--color-success)" }
];

const topCauses = [
  { cause: "Late Patient Arrivals", percentage: 45 },
  { cause: "Extended Consultation Times", percentage: 30 },
  { cause: "Room Preparation Delay", percentage: 15 },
  { cause: "Equipment Setup", percentage: 7 },
  { cause: "Staff Breaks", percentage: 3 }
];

export default function OperationalDelaysPage() {
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Operational Delays & Bottlenecks</h1>
          <p className="opacity-70">Monitor real-time clinic efficiency and identify workflow issues.</p>
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
              <p className="text-sm opacity-70 mb-1">Avg Wait Time</p>
              <h3 className="text-3xl font-bold">18 <span className="text-lg font-normal opacity-70">min</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-sm text-orange-500 flex items-center mt-2">
            <AlertTriangle size={14} className="mr-1" />
            +3 min from yesterday
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Avg Treatment Delay</p>
              <h3 className="text-3xl font-bold">8 <span className="text-lg font-normal opacity-70">min</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-sm text-green-500 flex items-center mt-2">
            -2 min from yesterday
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Staff Response Time</p>
              <h3 className="text-3xl font-bold">3 <span className="text-lg font-normal opacity-70">min</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm text-green-500 flex items-center mt-2">
            On target
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-70 mb-1">Patient Turnaround</p>
              <h3 className="text-3xl font-bold">52 <span className="text-lg font-normal opacity-70">min</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-sm text-orange-500 flex items-center mt-2">
            <AlertTriangle size={14} className="mr-1" />
            Slightly above avg
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
          <h3 className="text-lg font-semibold mb-6">Hourly Delay Timeline (9 AM - 6 PM)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-border)', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.delay > 20 ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl border h-full" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
            <h3 className="text-lg font-semibold mb-6">Top 5 Delay Causes</h3>
            <div className="space-y-5">
              {topCauses.map((cause, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{cause.cause}</span>
                    <span className="opacity-70">{cause.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cause.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className="h-full bg-orange-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4 mt-8">Department Bottlenecks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bottlenecks.map((dept, idx) => (
            <div key={idx} className="p-5 rounded-2xl border flex items-center space-x-4" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
              <div className={`p-3 rounded-full ${dept.severity === 'high' ? 'bg-red-500/10 text-red-500' : dept.severity === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                <dept.icon size={24} />
              </div>
              <div>
                <h4 className="font-semibold">{dept.name}</h4>
                <p className="text-sm opacity-70">{dept.delay}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

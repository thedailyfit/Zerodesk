"use client";

import { motion } from "framer-motion";
import { 
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Star,
  Sparkles
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
} from "recharts";

const sentimentData = [
  { name: "Positive", value: 78, color: "#22c55e" },
  { name: "Neutral", value: 15, color: "#eab308" },
  { name: "Negative", value: 7, color: "#ef4444" }
];

const staffScores = [
  { name: "Dr. Meenakshi", role: "Senior Dermatologist", score: 4.8 },
  { name: "Dr. Arun", role: "Cosmetologist", score: 4.5 },
  { name: "Kavita", role: "Head Therapist", score: 4.7 },
  { name: "Rekha", role: "Front Desk Executive", score: 4.3 }
];

const keywords = [
  { text: "Clean Facility", type: "positive" },
  { text: "Professional", type: "positive" },
  { text: "Long Waiting", type: "negative" },
  { text: "Friendly Staff", type: "positive" },
  { text: "Expensive", type: "negative" },
  { text: "Painless Laser", type: "positive" },
  { text: "Good Results", type: "positive" },
  { text: "Rush Hour", type: "neutral" }
];

const recentFeedback = [
  { patient: "Shruti M.", rating: 5, time: "2 hours ago", text: "Dr. Meenakshi was excellent. The clinic is very clean and the laser treatment was surprisingly painless.", sentiment: "positive" },
  { patient: "Aditya R.", rating: 4, time: "5 hours ago", text: "Good consultation, but had to wait 20 minutes past my appointment time.", sentiment: "neutral" },
  { patient: "Pallavi S.", rating: 5, time: "Yesterday", text: "Kavita is the best! My skin feels amazing after the chemical peel. Highly recommend ZeroDesk.", sentiment: "positive" },
  { patient: "Rohan J.", rating: 2, time: "Yesterday", text: "Treatment is too expensive compared to others. Front desk seemed a bit confused about billing.", sentiment: "negative" },
  { patient: "Nisha K.", rating: 5, time: "2 days ago", text: "Very professional staff and state-of-the-art equipment. Worth the price.", sentiment: "positive" }
];

export default function PatientSentimentPage() {
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
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            Patient Sentiment & Satisfaction
            <span className="ml-3 inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold border border-blue-500/20">
              <Sparkles size={12} className="mr-1" />
              AI Analyzed
            </span>
          </h1>
          <p className="opacity-70">Monitor patient feedback, reviews, and overall clinic reputation.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="p-6 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent z-0"></div>
          <h3 className="text-lg font-semibold mb-2 relative z-10 w-full text-left">Overall Score</h3>
          <div className="relative w-48 h-48 flex items-center justify-center z-10 mt-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-border)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${(4.6/5) * 251.2} 251.2`} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-bold">4.6</span>
              <span className="text-sm opacity-70">out of 5.0</span>
            </div>
          </div>
          <div className="flex text-yellow-500 mt-4 relative z-10">
            {[1,2,3,4,5].map((star) => (
              <Star key={star} size={24} fill={star <= 4 ? "currentColor" : "transparent"} className={star === 5 ? "opacity-50" : ""} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border flex flex-col" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <div className="flex-grow flex items-center justify-center h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-4">
            {sentimentData.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="font-semibold text-lg">{item.value}%</span>
                </div>
                <p className="text-xs opacity-70">{item.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}>
          <h3 className="text-lg font-semibold mb-6">Staff Satisfaction Scores</h3>
          <div className="space-y-5">
            {staffScores.map((staff, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <div>
                    <span className="font-medium">{staff.name}</span>
                    <span className="text-xs opacity-50 ml-2">{staff.role}</span>
                  </div>
                  <span className="font-bold">{staff.score}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(staff.score / 5) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                    className={`h-full rounded-full ${staff.score >= 4.7 ? 'bg-green-500' : staff.score >= 4.5 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 p-6 rounded-2xl border h-full" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <MessageCircle size={18} className="mr-2 text-primary" />
            Trending AI Keywords
          </h3>
          <div className="flex flex-wrap gap-3">
            {keywords.map((kw, idx) => (
              <span 
                key={idx} 
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${
                  kw.type === 'positive' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                  kw.type === 'negative' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                  'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                }`}
              >
                {kw.text}
              </span>
            ))}
          </div>
          <p className="text-xs opacity-50 mt-6 mt-auto">Keywords extracted automatically from recent reviews and feedback forms.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 p-6 rounded-2xl border" 
          style={{ backgroundColor: "var(--color-glass)", borderColor: "var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-6">Recent Feedback Timeline</h3>
          <div className="space-y-6">
            {recentFeedback.map((fb, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {idx !== recentFeedback.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-[-24px] w-px bg-gray-200 dark:bg-gray-800"></div>
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-[var(--color-background)] ${
                  fb.sentiment === 'positive' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                  fb.sentiment === 'negative' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                }`}>
                  {fb.sentiment === 'positive' ? <ThumbsUp size={20} /> : 
                   fb.sentiment === 'negative' ? <ThumbsDown size={20} /> : 
                   <Minus size={20} />}
                </div>
                <div className="flex-grow p-4 rounded-xl border bg-gray-50/50 dark:bg-gray-800/20" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{fb.patient}</h4>
                      <p className="text-xs opacity-50">{fb.time}</p>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < fb.rating ? "currentColor" : "transparent"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm opacity-80">{fb.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

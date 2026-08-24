'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Star,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { useNiche } from '@/components/providers/niche-provider';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

const SENTIMENT_DISTRIBUTION = [
  { name: 'Positive', value: 82, color: '#22c55e' },
  { name: 'Neutral', value: 12, color: '#eab308' },
  { name: 'Needs Attention', value: 6, color: '#ef4444' }
];

const STAFF_RATINGS = [
  { name: 'Senior Consultant', role: 'Clinical / Service Lead', rating: 4.9, count: 142 },
  { name: 'Lead Associate', role: 'Operations & Execution', rating: 4.8, count: 98 },
  { name: 'Relationship Manager', role: 'Frontdesk & Concierge', rating: 4.7, count: 215 },
  { name: 'Support Specialist', role: 'Aftercare & Follow-ups', rating: 4.6, count: 76 }
];

const KEYWORDS = [
  { text: 'Prompt & Clean', type: 'positive' },
  { text: 'Extremely Professional', type: 'positive' },
  { text: 'Great AI Assistant', type: 'positive' },
  { text: 'Slight Peak Waiting', type: 'neutral' },
  { text: 'Friendly Team', type: 'positive' },
  { text: 'Transparent Pricing', type: 'positive' },
  { text: 'Detailed Consultation', type: 'positive' },
  { text: 'Seamless WhatsApp Booking', type: 'positive' }
];

const RECENT_FEEDBACK = [
  { author: 'Shruti M.', rating: 5, time: '2 hours ago', text: 'Exceptional service and extremely clean environment. The consultation was thorough and detailed.', sentiment: 'positive' },
  { author: 'Aditya R.', rating: 4, time: '5 hours ago', text: 'Great experience overall. Handled all queries politely, slight 10 min wait during afternoon rush.', sentiment: 'neutral' },
  { author: 'Pallavi S.', rating: 5, time: 'Yesterday', text: 'Love the quick WhatsApp confirmation and AI reminders! Super smooth workflow.', sentiment: 'positive' },
  { author: 'Rohan J.', rating: 3, time: 'Yesterday', text: 'Service was good, would appreciate clearer parking guidance before arrival.', sentiment: 'neutral' },
  { author: 'Nisha K.', rating: 5, time: '2 days ago', text: 'State of the art technology and friendly staff. Highly recommend.', sentiment: 'positive' }
];

export default function SentimentPage() {
  const { nicheConfig } = useNiche();
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');

  const customerSingular = nicheConfig?.terminology.customer || 'Customer';
  const customerPlural = nicheConfig?.terminology.customers || 'Customers';

  const filteredReviews = RECENT_FEEDBACK.filter(r => 
    filterSentiment === 'ALL' || r.sentiment === filterSentiment
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              AI Sentiment & Experience Intelligence
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Real-Time NLP Analysis
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Automated sentiment categorization from calls, WhatsApp chats, post-visit surveys, and reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            4.85 / 5.0 Average CSAT
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Positive Sentiment</span>
            <h3 className="text-2xl font-black text-emerald-500">82%</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Based on 340+ interactions</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Minus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Neutral Inquiries</span>
            <h3 className="text-2xl font-black text-amber-500">12%</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Standard scheduling & queries</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <ThumbsDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">Friction / Escalations</span>
            <h3 className="text-2xl font-black text-rose-500">6%</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Promptly resolved by manager</p>
          </div>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sentiment Share Pie Chart */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Sentiment Share</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Distribution across all communication channels</p>
          </div>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SENTIMENT_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SENTIMENT_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', borderRadius: 12 }}
                  formatter={(val: number) => [`${val}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive</span>
            <span className="flex items-center gap-1.5 text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-500" /> Neutral</span>
            <span className="flex items-center gap-1.5 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500" /> Action</span>
          </div>
        </div>

        {/* Center: Key Sentiment Triggers */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Key Sentiment Drivers</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Frequently recurring topics detected by AI</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {KEYWORDS.map((k, idx) => (
              <span
                key={idx}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border",
                  k.type === 'positive' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                  k.type === 'negative' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
                  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                )}
              >
                {k.type === 'positive' && <Sparkles className="w-3 h-3 text-emerald-500" />}
                {k.text}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Team CSAT Scores */}
        <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Team Performance CSAT</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Direct satisfaction scores per role</p>
          </div>

          <div className="space-y-3 pt-1">
            {STAFF_RATINGS.map((staff, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text)]">{staff.name}</p>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">{staff.role}</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                  {staff.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Feedback Feed */}
      <div className="p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)]">Live {customerSingular} Feedback Feed</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Direct transcripts & feedback analyzed by AI</p>
          </div>

          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="positive">Positive Only</option>
            <option value="neutral">Neutral Only</option>
            <option value="negative">Escalations Only</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredReviews.map((review, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar3D name={review.author} className="w-7 h-7 text-xs font-bold" />
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text)]">{review.author}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] ml-2">{review.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[var(--color-text)] leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

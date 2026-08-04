'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  numericValue: number;
  trend: number;
  icon: React.ElementType;
  delay?: number;
  prefix?: string;
  suffix?: string;
}

export function KPICard({ title, value, numericValue, trend, icon: Icon, delay = 0, prefix = '', suffix = '' }: KPICardProps) {
  const [count, setCount] = useState(0);
  const isPositive = trend >= 0;

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutQuart)
      const ease = 1 - Math.pow(1 - percentage, 4);
      setCount(numericValue * ease);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(numericValue);
      }
    };

    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay * 1000 + 100);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [numericValue, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-glow)] hover:border-[var(--color-primary-light)] transition-all duration-300 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">{title}</h3>
          <div className="p-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:border-[var(--color-primary-200)] transition-colors">
            <Icon size={18} />
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              {prefix}{count === numericValue ? value : Math.round(count).toLocaleString()}{suffix}
            </div>
            <div className={cn("flex items-center gap-1 mt-2 text-sm", isPositive ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="font-medium">{Math.abs(trend)}%</span>
              <span className="text-[var(--color-text-muted)] ml-1">vs last month</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface Avatar3DProps {
  name: string;
  gender?: 'male' | 'female';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar3D({ name, gender = 'female', size = 'md', className }: Avatar3DProps) {
  // Determine gender based on name if not provided
  const isFemale = gender === 'female' || /priya|sneha|ananya|kavita|rekha|meera|ritu|meenakshi/i.test(name);
  
  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  }[size];

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24,
  }[size];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shadow-lg border border-white/20 shrink-0 relative overflow-hidden group transition-all",
        isFemale
          ? "bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 shadow-blue-500/25"
          : "bg-gradient-to-tr from-blue-800 via-blue-600 to-indigo-600 shadow-blue-500/25",
        sizeClasses,
        className
      )}
      title={name}
    >
      {/* 3D Highlight Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20 pointer-events-none" />

      {/* 3D Character Avatar Silhouette SVG */}
      {isFemale ? (
        <svg className="w-3/5 h-3/5 text-white drop-shadow relative z-10" viewBox="0 0 24 24" fill="currentColor">
          {/* 3D Female Character Head & Hair */}
          <path d="M12 2C9.24 2 7 4.24 7 7v1c0 2.21 1.79 4 4 4s4-1.79 4-4V7c0-2.76-2.24-5-5-5zm0 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          <circle cx="12" cy="7" r="3.5" fill="rgba(255,255,255,0.9)" />
          <path d="M7 6c0-2.2 2.24-4 5-4s5 1.8 5 4v3c0 .5-.2 1-.5 1.4C15.8 9 14 8 12 8s-3.8 1-4.5 2.4C7.2 10 7 9.5 7 9V6z" fill="rgba(255,230,240,0.95)" />
        </svg>
      ) : (
        <svg className="w-3/5 h-3/5 text-white drop-shadow relative z-10" viewBox="0 0 24 24" fill="currentColor">
          {/* 3D Male Character Head */}
          <path d="M12 2C9.24 2 7 4.24 7 7v1c0 2.21 1.79 4 4 4s4-1.79 4-4V7c0-2.76-2.24-5-5-5zm0 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          <circle cx="12" cy="7" r="3.5" fill="rgba(255,255,255,0.9)" />
          <path d="M8 5.5C8 4.1 9.8 3 12 3s4 1.1 4 2.5v1.5H8V5.5z" fill="rgba(210,235,255,0.95)" />
        </svg>
      )}
    </div>
  );
}

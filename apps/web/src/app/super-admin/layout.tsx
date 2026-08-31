'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Building2, 
  Mic2, 
  Cpu, 
  Server, 
  ArrowLeft, 
  Activity, 
  Radio, 
  Sliders, 
  Lock,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminStore } from '@/lib/superadmin-store';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenants, voices, llmModels, globalFailoverEnabled } = useSuperAdminStore();

  const navItems = [
    { name: 'Command Overview', href: '/super-admin', icon: LayoutDashboard, exact: true },
    { name: 'Tenants & Clients', href: '/super-admin/tenants', icon: Building2, count: tenants.length },
    { name: 'Voice AI Fleet', href: '/super-admin/voice-fleet', icon: Mic2, count: voices.filter((v: any) => v.isActive).length },
    { name: 'LLM Engine Router', href: '/super-admin/llm-router', icon: Cpu, count: llmModels.filter((m: any) => m.isActive).length },
    { name: 'Infrastructure & RAG', href: '/super-admin/infrastructure', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col antialiased selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Super Admin Banner */}
      <header className="h-14 border-b border-rose-500/20 bg-rose-950/20 px-6 flex items-center justify-between backdrop-blur-xl shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-rose-400">ZERODESK</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 uppercase font-semibold">
              Super Admin Control Plane
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LiveKit Cluster: <strong className="text-slate-200">Active (14 streams)</strong></span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>LLM Failover: <strong className="text-slate-200">{globalFailoverEnabled ? 'Auto-Armed' : 'Manual'}</strong></span>
            </div>
          </div>

          <Link 
            href="/" 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Client View</span>
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Isolated Super Admin Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-[#0B0E17] flex flex-col justify-between shrink-0 p-4">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase px-3 mb-2 font-semibold">
                Control Plane Navigation
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group',
                        isActive 
                          ? 'bg-gradient-to-r from-rose-500/20 to-red-500/10 text-rose-300 border border-rose-500/30 shadow-md shadow-rose-950/50' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-rose-400' : 'text-slate-500')} />
                        <span>{item.name}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold',
                          isActive ? 'bg-rose-500/30 text-rose-200' : 'bg-slate-800 text-slate-400'
                        )}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Fleet Metrics Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
              <p className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Real-Time Fleet</span>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              </p>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Active Tenants:</span>
                  <span className="font-mono text-slate-200 font-semibold">{tenants.filter((t: any) => t.status === 'Active').length} / {tenants.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voice Personas:</span>
                  <span className="font-mono text-slate-200 font-semibold">{voices.length} deployed</span>
                </div>
                <div className="flex justify-between">
                  <span>LLM Routers:</span>
                  <span className="font-mono text-slate-200 font-semibold">{llmModels.length} models</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-mono">v3.4-PROD</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Protected SuperAdmin
            </span>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#07090E] p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

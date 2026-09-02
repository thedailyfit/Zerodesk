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
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminStore } from '@/lib/superadmin-store';
import { useTheme } from '@/components/providers/theme-provider';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { tenants, voices, llmModels, globalFailoverEnabled } = useSuperAdminStore();

  const navItems = [
    { name: 'Command Overview', href: '/super-admin', icon: LayoutDashboard, exact: true },
    { name: 'Tenants & Clients', href: '/super-admin/tenants', icon: Building2, count: tenants.length },
    { name: 'Voice AI Fleet', href: '/super-admin/voice-fleet', icon: Mic2, count: voices.filter((v: any) => v.isActive).length },
    { name: 'LLM Engine Router', href: '/super-admin/llm-router', icon: Cpu, count: llmModels.filter((m: any) => m.isActive).length },
    { name: 'Infrastructure & RAG', href: '/super-admin/infrastructure', icon: Server },
  ];

  return (
    <div className={cn(
      "min-h-screen flex flex-col antialiased selection:bg-rose-500/30 selection:text-rose-200 transition-colors duration-200",
      theme === 'light' 
        ? "bg-slate-100 text-slate-900" 
        : "bg-[#07090E] text-slate-100"
    )}>
      {/* Top Super Admin Banner */}
      <header className={cn(
        "h-14 border-b px-6 flex items-center justify-between backdrop-blur-xl shrink-0 z-30 transition-colors",
        theme === 'light'
          ? "bg-rose-500/10 border-rose-200 text-slate-900"
          : "bg-rose-950/20 border-rose-500/20 text-slate-100"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-rose-500 dark:text-rose-400">ZERODESK</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded font-mono uppercase font-semibold border",
              theme === 'light'
                ? "bg-rose-100 text-rose-700 border-rose-300"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            )}>
              Super Admin Control Plane
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LiveKit Cluster: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>Active (14 streams)</strong></span>
            </div>
            <div className={cn("h-3 w-px", theme === 'light' ? "bg-slate-300" : "bg-slate-800")} />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>LLM Failover: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{globalFailoverEnabled ? 'Auto-Armed' : 'Manual'}</strong></span>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg border transition-all flex items-center gap-1.5 font-medium text-xs shadow-sm",
              theme === 'light'
                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
            )}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <>
                <Moon size={14} className="text-indigo-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium",
              theme === 'light'
                ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Client View</span>
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Isolated Super Admin Sidebar */}
        <aside className={cn(
          "w-64 border-r flex flex-col justify-between shrink-0 p-4 transition-colors",
          theme === 'light'
            ? "border-slate-200 bg-white"
            : "border-slate-800/80 bg-[#0B0E17]"
        )}>
          <div className="space-y-6">
            <div>
              <p className={cn(
                "text-[10px] font-mono tracking-widest uppercase px-3 mb-2 font-semibold",
                theme === 'light' ? "text-slate-400" : "text-slate-500"
              )}>
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
                          ? (theme === 'light' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm' 
                              : 'bg-gradient-to-r from-rose-500/20 to-red-500/10 text-rose-300 border border-rose-500/30 shadow-md shadow-rose-950/50')
                          : (theme === 'light'
                              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent')
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? (theme === 'light' ? 'text-rose-600' : 'text-rose-400') : 'text-slate-400')} />
                        <span>{item.name}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold',
                          isActive 
                            ? (theme === 'light' ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/30 text-rose-200')
                            : (theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400')
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
            <div className={cn(
              "p-3.5 rounded-xl border space-y-2.5 transition-colors",
              theme === 'light'
                ? "bg-slate-50 border-slate-200"
                : "bg-slate-900/60 border-slate-800/80"
            )}>
              <p className={cn(
                "text-[11px] font-semibold flex items-center justify-between",
                theme === 'light' ? "text-slate-800" : "text-slate-300"
              )}>
                <span>Real-Time Fleet</span>
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              </p>
              <div className={cn(
                "space-y-1.5 text-[11px]",
                theme === 'light' ? "text-slate-600" : "text-slate-400"
              )}>
                <div className="flex justify-between">
                  <span>Active Tenants:</span>
                  <span className={cn("font-mono font-semibold", theme === 'light' ? "text-slate-900" : "text-slate-200")}>
                    {tenants.filter((t: any) => t.status === 'Active').length} / {tenants.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Voice Personas:</span>
                  <span className={cn("font-mono font-semibold", theme === 'light' ? "text-slate-900" : "text-slate-200")}>
                    {voices.length} deployed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>LLM Routers:</span>
                  <span className={cn("font-mono font-semibold", theme === 'light' ? "text-slate-900" : "text-slate-200")}>
                    {llmModels.length} models
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className={cn(
            "pt-4 border-t text-[11px] flex items-center justify-between transition-colors",
            theme === 'light' ? "border-slate-200 text-slate-500" : "border-slate-800/80 text-slate-500"
          )}>
            <span className="font-mono">v3.4-PROD</span>
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Protected SuperAdmin
            </span>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className={cn(
          "flex-1 overflow-y-auto p-8 transition-colors",
          theme === 'light' ? "bg-slate-100" : "bg-[#07090E]"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

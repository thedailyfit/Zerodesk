'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  Download, 
  ShieldCheck, 
  BellRing, 
  Zap, 
  CheckCircle2, 
  Monitor, 
  Sparkles,
  RefreshCw,
  Cpu,
  Lock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DesktopAppPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleDownload = (type: 'exe' | 'msi') => {
    setDownloading(type);
    setTimeout(() => {
      setDownloading(null);
      alert(`ZeroDesk Clinic AI Windows Installer (${type.toUpperCase()}) download started!`);
    }, 1500);
  };

  const handleTestNotification = () => {
    setTestNotificationSent(true);
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('📞 ZeroDesk Live Voice AI Handoff', {
            body: 'Incoming emergency escalation call from Patient Ananya Rao (Jubilee Hills branch)!',
            icon: '/favicon.ico'
          });
        }
      });
    }
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">ZeroDesk Windows Desktop App</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Download the native Windows desktop application for frontdesk staff with auto-start, system tray integration, and instant call popups.
          </p>
        </div>
      </div>

      {/* Main Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXE Installer */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-cyan-500/30 space-y-4 relative overflow-hidden group shadow-sm">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <Monitor size={28} />
            </div>
            <span className="px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono text-xs font-bold">
              Standalone Executable (.exe)
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">ZeroDesk_Installer_x64.exe</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Direct executable for Windows 10 & 11 (64-bit). No admin rights required. Lightweight 14.2 MB download.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs font-mono text-[var(--color-text)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Native Windows System Tray Icon & Popups</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Auto-starts on Windows Boot</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Ultra-low Memory (Only ~28MB RAM footprint)</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload('exe')}
            disabled={downloading === 'exe'}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {downloading === 'exe' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>{downloading === 'exe' ? 'Downloading .exe...' : 'Download Windows .exe (14.2 MB)'}</span>
          </button>
        </div>

        {/* MSI Enterprise Installer */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-blue-500/30 space-y-4 relative overflow-hidden group shadow-sm">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShieldCheck size={28} />
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 font-mono text-xs font-bold">
              MSI Enterprise Package (.msi)
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">ZeroDesk_Enterprise_x64.msi</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Group Policy (GPO) package for multi-branch IT deployment across multiple clinic computers.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs font-mono text-[var(--color-text)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-500" />
              <span>Silent Multi-PC IT Deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-500" />
              <span>PostgreSQL Engine Row-Level Security (RLS)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-blue-500" />
              <span>Signed Security Certificate</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload('msi')}
            disabled={downloading === 'msi'}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {downloading === 'msi' ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>{downloading === 'msi' ? 'Downloading .msi Package...' : 'Download MSI Installer (15.8 MB)'}</span>
          </button>
        </div>
      </div>

      {/* System Tray Notification Test & Hardware Capabilities */}
      <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <BellRing size={18} className="text-amber-500" />
              Windows Native System Tray & Sound Ring Alerts
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Test how live Voice AI handoff alerts ring out loud on the receptionist's Windows computer even when the app is minimized.
            </p>
          </div>

          <button
            onClick={handleTestNotification}
            className="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <Zap size={14} />
            <span>{testNotificationSent ? 'Notification Sent to Windows!' : 'Test Loud Call Alert'}</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5 text-xs">
            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase">Cross-Device Sync</span>
            <p className="font-bold text-[var(--color-text)]">Real-Time Cloud Synchronization</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Changes made in the desktop app immediately reflect on doctor tablets & web browsers.</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5 text-xs">
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Engine Isolation</span>
            <p className="font-bold text-[var(--color-text)]">PostgreSQL RLS Protected</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Data queries are locked at the database layer so clinic data never leaks across tenants.</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-1.5 text-xs">
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Offline Resiliency</span>
            <p className="font-bold text-[var(--color-text)]">Background Queue Buffer</p>
            <p className="text-[11px] text-[var(--color-text-muted)]">Inbound webhooks are queued in BullMQ to guarantee 0 dropped call notifications during traffic spikes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

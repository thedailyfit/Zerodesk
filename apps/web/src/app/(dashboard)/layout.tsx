'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, OrganizationSwitcher, useClerk } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Target, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Phone, 
  MessageCircle, 
  Workflow, 
  Settings,
  Bell,
  Sun,
  Moon,
  Search,
  Menu,
  ChevronLeft,
  FileText,
  Rocket,
  Receipt,
  TrendingUp,
  CreditCard,
  CalendarDays,
  Clock,
  Shield,
  ChevronDown,
  LogOut,
  AlertTriangle,
  IndianRupee,
  Heart,
  SmilePlus,
  Cpu,
  PhoneIncoming,
  Megaphone,
  Activity,
  Laptop
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

const NICHE_OPTIONS: { id: NicheId; name: string; emoji: string; tag: string }[] = [
  { id: 'skin', name: 'Skin & Dermatology', emoji: '🏥', tag: 'Dermatology' },
  { id: 'dental', name: 'Dental Clinic', emoji: '🦷', tag: 'Dental Care' },
  { id: 'spa', name: 'Spa & Wellness', emoji: '🧖', tag: 'Wellness' },
  { id: 'salon', name: 'Luxury Salon', emoji: '💇', tag: 'Beauty & Style' },
  { id: 'realestate', name: 'Real Estate & Property', emoji: '🏢', tag: 'Property OS' },
  { id: 'hotel', name: 'Hotel & Resort', emoji: '🏨', tag: 'Hospitality' },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-500',
  MANAGER: 'bg-amber-500',
  STAFF: 'bg-emerald-500',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const { currentNiche, setNiche, nicheConfig } = useNiche();
  const [demoRole, setDemoRole] = useState<string>('ADMIN');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const nicheNavItems = useMemo(() => nicheConfig?.navItems || [], [nicheConfig]);

  const filteredNavItems = useMemo(() => {
    if (!nicheNavItems || nicheNavItems.length === 0) return [];
    if (demoRole === 'ADMIN') return nicheNavItems;
    return nicheNavItems.filter(item => 
      !item.roles || item.roles.length === 0 || item.roles.includes(demoRole) || item.roles.includes('ADMIN')
    );
  }, [demoRole, nicheNavItems]);

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-full border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] relative z-20"
      >
        <div className="p-4 flex items-center justify-between h-16 border-b border-[var(--color-border)]">
          {isSidebarOpen ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-xl tracking-tight text-[var(--color-text)] flex items-center gap-2.5">
              <svg className={cn("w-7 h-7 shrink-0", theme === 'dark' ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-indigo-600")} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="200 40" strokeLinecap="round" />
                <path d="M32 50L45 63L68 37" stroke={theme === 'dark' ? "url(#gradDark)" : "url(#gradLight)"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="gradDark" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22d3ee" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="gradLight" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={cn("bg-clip-text text-transparent font-extrabold tracking-wider", theme === 'dark' ? "bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-700")}>
                ZERODESK
              </span>
            </motion.div>
          ) : (
            <svg className={cn("w-7 h-7 mx-auto shrink-0", theme === 'dark' ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-indigo-600")} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="200 40" strokeLinecap="round" />
              <path d="M32 50L45 63L68 37" stroke={theme === 'dark' ? "url(#gradDarkMini)" : "url(#gradLightMini)"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="gradDarkMini" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradLightMini" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="p-1 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} className="mx-auto" />}
          </button>
        </div>

        {/* Dynamic Niche / Dashboard Switcher Widget (For Fast Testing & Recording) */}
        <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40 relative">
          <button
            onClick={() => setNicheDropdownOpen(!nicheDropdownOpen)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary-light)] bg-[var(--color-bg)] transition-all group shadow-sm",
              isSidebarOpen ? "px-3 py-2" : "px-2 py-2 justify-center"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg shrink-0">
                {NICHE_OPTIONS.find(n => n.id === currentNiche)?.emoji || '🏥'}
              </span>
              {isSidebarOpen && (
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {NICHE_OPTIONS.find(n => n.id === currentNiche)?.name || nicheConfig.label}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-primary-light)] tracking-wide uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    Switch Dashboard
                  </span>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <ChevronDown size={14} className={cn("text-[var(--color-text-muted)] transition-transform shrink-0", nicheDropdownOpen && "rotate-180")} />
            )}
          </button>

          {/* Niche Selector Dropdown Popover */}
          <AnimatePresence>
            {nicheDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "absolute top-full left-2 right-2 mt-1.5 bg-[var(--color-bg-elevated)] backdrop-blur-xl border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden z-50 p-1.5 space-y-1",
                  !isSidebarOpen && "w-60 left-12"
                )}
              >
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border)] mb-1 flex items-center justify-between">
                  <span>Select Niche OS</span>
                  <span className="text-[9px] bg-[var(--color-primary-100)] text-[var(--color-primary-light)] px-1.5 py-0.5 rounded font-mono">Instant Test</span>
                </div>
                {NICHE_OPTIONS.map((niche) => {
                  const isSelected = currentNiche === niche.id;
                  return (
                    <button
                      key={niche.id}
                      onClick={() => {
                        setNiche(niche.id);
                        setNicheDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium transition-all text-left group",
                        isSelected 
                          ? "bg-[var(--color-primary)] text-white shadow-md font-bold" 
                          : "text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{niche.emoji}</span>
                        <span className="truncate">{niche.name}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-1",
                        isSelected ? "bg-white/20 text-white" : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                      )}>
                        {niche.tag}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {filteredNavItems.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={`div-${idx}`} className={cn("pt-4 pb-1", isSidebarOpen ? "px-3" : "px-0 text-center")}>
                  {isSidebarOpen ? (
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{item.name}</span>
                  ) : (
                    <div className="w-4 h-px bg-[var(--color-border)] mx-auto" />
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href;
            const Icon = item.icon as any;
            return (
              <Link key={item.name} href={item.href || '#'}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all relative group",
                  isActive 
                    ? "text-white bg-[var(--color-primary-200)]" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute left-0 w-1 h-full bg-[var(--color-primary)] rounded-r-full shadow-[var(--shadow-glow)]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  {Icon && <Icon size={20} className={cn("shrink-0", isActive ? "text-[var(--color-primary-light)]" : "")} />}
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                  {!isSidebarOpen && (
                    <div className="absolute left-14 px-2 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 backdrop-blur-md">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-[var(--color-border)] flex flex-col gap-4">
          <div className={cn("flex items-center", isSidebarOpen ? "justify-between" : "justify-center")}>
            <OrganizationSwitcher 
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "w-full",
                  organizationSwitcherTrigger: cn("w-full hover:bg-[var(--color-surface)] p-1 rounded transition-colors", !isSidebarOpen && "justify-center")
                }
              }}
            />
          </div>
          <div className={cn("flex items-center", isSidebarOpen ? "justify-between" : "justify-center")}>
            <UserButton appearance={{ elements: { rootBox: cn(!isSidebarOpen && "mx-auto") } }} />
            {isSidebarOpen ? (
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                aria-label="Logout"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                title="Logout"
                aria-label="Logout"
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={() => setIsCmdkOpen(true)}
              className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-md px-3 py-1.5 w-64 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <Search size={16} />
              <span>Search...</span>
              <kbd className="ml-auto text-xs border border-[var(--color-border)] rounded px-1.5 bg-[var(--color-bg)]">⌘K</kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Demo Role Switcher */}
            <div className="relative">
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-md transition-colors text-xs font-semibold text-[var(--color-text)]"
              >
                <div className={cn("w-2 h-2 rounded-full shadow-[var(--shadow-glow)]", ROLE_COLORS[demoRole] || 'bg-purple-500')} />
                {nicheConfig.roles.find(r => r.id === demoRole)?.label || demoRole}
                <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
              </button>
              
              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-bg-elevated)] backdrop-blur-md border border-[var(--color-border)] rounded-md shadow-lg overflow-hidden z-50"
                  >
                    {nicheConfig.roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setDemoRole(role.id);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface)] text-[var(--color-text)] transition-colors"
                      >
                        <div className={cn("w-2 h-2 rounded-full", ROLE_COLORS[role.id] || 'bg-purple-500')} />
                        {role.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              aria-label="Notifications"
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="h-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <CommandPalette open={isCmdkOpen} onOpenChange={setIsCmdkOpen} />
    </div>
  );
}

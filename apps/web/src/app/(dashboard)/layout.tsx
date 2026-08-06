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
  LogOut
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { cn } from '@/lib/utils';

type Role = 'STAFF' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Lead Management', href: '/crm', icon: Target, roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Appointments', href: '/appointments', icon: Calendar, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Invoices & Billing', href: '/invoices', icon: Receipt, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Sales & Revenue', href: '/sales', icon: TrendingUp, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Templates', href: '/templates', icon: FileText, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Voice AI', href: '/voice', icon: Phone, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Teams', href: '/teams', icon: Users, roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN', 'SUPER_ADMIN'] },
  { name: 'Ready to Scale', href: '/scale', icon: Rocket, roles: ['ADMIN', 'SUPER_ADMIN'] },
  
  { divider: true, name: 'CLINICAL', roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Doctor Slots', href: '/calendar', icon: CalendarDays, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Staff Calendar', href: '/staff-calendar', icon: Calendar, roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Patient Files', href: '/patient-files', icon: FileText, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Waiting Room', href: '/waiting-room', icon: Clock, roles: ['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  { name: 'Quick Bill', href: '/billing', icon: CreditCard, roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },

  { name: 'Super Admin', href: '/super-admin', icon: Shield, roles: ['SUPER_ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN', 'SUPER_ADMIN'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const [demoRole, setDemoRole] = useState<Role>('ADMIN');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => item.roles.includes(demoRole));
  }, [demoRole]);

  const roleColors = {
    STAFF: 'bg-blue-500',
    MANAGER: 'bg-amber-500',
    ADMIN: 'bg-purple-500',
    SUPER_ADMIN: 'bg-red-500'
  };

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
            className="p-1 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} className="mx-auto" />}
          </button>
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                title="Logout"
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
                <div className={cn("w-2 h-2 rounded-full shadow-[var(--shadow-glow)]", roleColors[demoRole])} />
                {demoRole}
                <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
              </button>
              
              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-bg-elevated)] backdrop-blur-md border border-[var(--color-border)] rounded-md shadow-lg overflow-hidden z-50"
                  >
                    {(['STAFF', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] as Role[]).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          setDemoRole(role);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-[var(--color-surface)] text-[var(--color-text)] transition-colors"
                      >
                        <div className={cn("w-2 h-2 rounded-full", roleColors[role])} />
                        {role}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette open={isCmdkOpen} onOpenChange={setIsCmdkOpen} />
    </div>
  );
}

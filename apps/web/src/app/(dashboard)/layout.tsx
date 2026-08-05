'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';
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
  UserCog, 
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
  Info,
  Receipt,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'CRM', href: '/crm', icon: Target },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Invoices & Billing', href: '/invoices', icon: Receipt },
  { name: 'Sales & Revenue', href: '/sales', icon: TrendingUp },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Voice AI', href: '/voice', icon: Phone },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { name: 'Staff', href: '/staff', icon: UserCog },
  { name: 'Automations', href: '/automations', icon: Workflow },
  { name: 'Ready to Scale', href: '/scale', icon: Rocket },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
              <svg className="w-7 h-7 text-cyan-400 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="200 40" strokeLinecap="round" />
                <path d="M32 50L45 63L68 37" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent font-extrabold tracking-wider">
                ZERODESK
              </span>
            </motion.div>
          ) : (
            <svg className="w-7 h-7 text-cyan-400 mx-auto shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="200 40" strokeLinecap="round" />
              <path d="M32 50L45 63L68 37" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
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
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
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
                  <item.icon size={20} className={cn("shrink-0", isActive ? "text-[var(--color-primary-light)]" : "")} />
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
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex-1 flex items-center">
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

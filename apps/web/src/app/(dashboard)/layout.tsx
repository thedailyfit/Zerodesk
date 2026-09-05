'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useClerk, useUser } from '@clerk/nextjs';
import { 
  Bell,
  Sun,
  Moon,
  Search,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LogOut,
  Sparkles,
  Users,
  Headphones,
  Volume2,
  Sliders,
  Check,
  X,
  Laptop,
  Settings,
  Rocket,
  Shield,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';
import { useRole } from '@/components/providers/role-provider';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { ApiAuthSync } from '@/components/providers/api-auth-sync';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';
import { useNotifications } from '@/lib/notifications-store';
import { useSuperAdminStore } from '@/lib/superadmin-store';
import type { NicheId, ActiveNicheId, NicheNavItem } from '@/config/niches/types';

const NICHE_OPTIONS: { id: ActiveNicheId; name: string; tag: string }[] = [
  { id: 'skin', name: 'Skin Clinic', tag: 'Dermatology' },
  { id: 'dental', name: 'Dental Clinic', tag: 'Dental Care' },
  { id: 'spa', name: 'Spa & Wellness', tag: 'Wellness' },
  { id: 'realestate', name: 'Real Estate', tag: 'Property OS' },
  { id: 'hotel', name: 'Hotel', tag: 'Hospitality' },
];

const SYSTEM_MENU_ITEMS = [
  { name: 'Manage Team', href: '/manage-team', icon: Users, badge: 'Admin', desc: 'Roles & Permissions', roles: ['ADMIN'] },
  { name: 'Get Live Help', href: '/get-live-help', icon: Headphones, badge: 'Live 24/7', desc: 'Support & Tickets', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { name: 'Windows Desktop App', href: '/desktop-app', icon: Laptop, badge: 'v2.4', desc: 'Download Client', roles: ['ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null, desc: 'Preferences & System', roles: ['ADMIN'] },
  { name: 'Ready to Scale', href: '/scale', icon: Rocket, badge: 'Pro', desc: 'Multi-location Growth', roles: ['ADMIN'] },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-blue-600',
  MANAGER: 'bg-amber-500',
  STAFF: 'bg-emerald-500',
};

function SidebarNavItemRow({
  item,
  isSidebarOpen,
  pathname,
}: {
  item: NicheNavItem;
  isSidebarOpen: boolean;
  pathname: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  
  const Icon = item.icon as any;
  const hasChildren = Boolean(item.children && item.children.length > 0);

  const isChildActive = hasChildren && item.children!.some((c) => pathname === c.href);
  const isActive = pathname === item.href || isChildActive;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (itemRef.current) {
      setRect(itemRef.current.getBoundingClientRect());
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  if (!hasChildren) {
    return (
      <Link key={item.name} href={item.href || '#'}>
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl transition-all relative group text-xs font-medium',
            isActive
              ? 'text-white bg-blue-600 shadow-md shadow-blue-600/20 font-bold'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
          )}
        >
          {Icon && <Icon size={18} className={cn('shrink-0', isActive ? 'text-white' : '')} />}
          {isSidebarOpen && <span className="truncate">{item.name}</span>}
          {!isSidebarOpen && (
            <div className="absolute left-14 px-2.5 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[999] backdrop-blur-md shadow-lg">
              {item.name}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div
      ref={itemRef}
      className="relative group/parent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={item.children![0].href}>
        <div
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-xl transition-all relative text-xs font-medium cursor-pointer',
            isActive
              ? 'text-white bg-blue-600 shadow-md shadow-blue-600/20 font-bold'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
          )}
        >
          <div className="flex items-center gap-3 truncate">
            {Icon && <Icon size={18} className={cn('shrink-0', isActive ? 'text-white' : '')} />}
            {isSidebarOpen && <span className="truncate">{item.name}</span>}
          </div>
          {isSidebarOpen && (
            <ChevronRight
              size={13}
              className={cn(
                'shrink-0 opacity-60 transition-transform duration-200',
                isHovered ? 'translate-x-0.5 opacity-100' : ''
              )}
            />
          )}
          {!isSidebarOpen && (
            <div className="absolute left-14 px-2.5 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-md text-xs opacity-0 invisible group-hover/parent:opacity-100 group-hover/parent:visible transition-all whitespace-nowrap z-[999] backdrop-blur-md shadow-lg">
              {item.name}
            </div>
          )}
        </div>
      </Link>

      {/* Floating Side View Flyout Sub-menu (Fixed Position to break out of overflow bounds) */}
      <AnimatePresence>
        {isHovered && rect && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: rect.top,
              left: isSidebarOpen ? 256 + 8 : 80 + 8,
            }}
            className="z-[9999] w-56 p-2 rounded-xl bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl border border-[var(--color-border)] shadow-2xl shadow-black/20"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="space-y-1">
              {item.children!.map((child) => {
                const isCurrent = pathname === child.href;
                return (
                  <Link
                    key={child.name}
                    href={child.href}
                    onClick={() => setIsHovered(false)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group/item',
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
                    )}
                  >
                    <span className="truncate">{child.name}</span>
                    <ChevronRight
                      size={12}
                      className={cn(
                        'shrink-0 transition-opacity',
                        isCurrent ? 'opacity-100 text-white' : 'opacity-0 group-hover/item:opacity-100 text-[var(--color-text-muted)]'
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCmdkOpen, setIsCmdkOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { currentNiche, setNiche, nicheConfig } = useNiche();
  const { settings, updateSetting } = useNotifications();
  const { role: globalRole, setRole: setGlobalRole } = useRole();
  const [demoRole, setDemoRole] = useState<string>(globalRole || 'ADMIN');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [nicheDropdownOpen, setNicheDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { tenants, impersonatedTenantId, impersonateTenant } = useSuperAdminStore();

  const impersonatedTenant = useMemo(() => {
    if (!impersonatedTenantId) return null;
    return tenants.find((t: any) => t.id === impersonatedTenantId) || null;
  }, [tenants, impersonatedTenantId]);

  const nicheNavItems = useMemo(() => nicheConfig?.navItems || [], [nicheConfig]);

  const filteredNavItems = useMemo(() => {
    if (!nicheNavItems || nicheNavItems.length === 0) return [];
    if (demoRole === 'ADMIN') return nicheNavItems;
    return nicheNavItems.filter(item => {
      if (item.divider) {
        return !item.roles || item.roles.length === 0 || item.roles.includes(demoRole);
      }
      return item.roles && item.roles.includes(demoRole);
    });
  }, [demoRole, nicheNavItems]);

  const filteredSystemItems = useMemo(() => {
    if (demoRole === 'ADMIN') return SYSTEM_MENU_ITEMS;
    return SYSTEM_MENU_ITEMS.filter((item) => item.roles.includes(demoRole) || item.name === 'Get Live Help');
  }, [demoRole]);

  return (
    <div className="flex h-screen bg-[var(--color-bg)] overflow-hidden">
      <ApiAuthSync />
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
              <svg className={cn("w-7 h-7 shrink-0", theme === 'dark' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "text-blue-600")} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="200 40" strokeLinecap="round" />
                <path d="M32 50L45 63L68 37" stroke={theme === 'dark' ? "url(#gradDark)" : "url(#gradLight)"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="gradDark" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="gradLight" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563eb" />
                    <stop offset="1" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={cn("bg-clip-text text-transparent font-extrabold tracking-wider", theme === 'dark' ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800")}>
                ZERODESK
              </span>
            </motion.div>
          ) : (
            <svg className={cn("w-7 h-7 mx-auto shrink-0", theme === 'dark' ? "text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "text-blue-600")} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" strokeDasharray="200 40" strokeLinecap="round" />
              <path d="M32 50L45 63L68 37" stroke={theme === 'dark' ? "url(#gradDarkMini)" : "url(#gradLightMini)"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="gradDarkMini" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="gradLightMini" x1="32" y1="50" x2="68" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2563eb" />
                  <stop offset="1" stopColor="#1d4ed8" />
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

        {/* Dynamic Niche / Dashboard Switcher Widget */}
        <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40 relative">
          <button
            onClick={() => setNicheDropdownOpen(!nicheDropdownOpen)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-xl border border-[var(--color-border)] hover:border-blue-500/50 bg-[var(--color-bg)] transition-all group shadow-sm",
              isSidebarOpen ? "px-3 py-2" : "px-2 py-2 justify-center"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSidebarOpen ? (
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {NICHE_OPTIONS.find(n => n.id === currentNiche)?.name || nicheConfig.label}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-400 tracking-wide uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                    Switch Dashboard
                  </span>
                </div>
              ) : (
                <span className="text-xs font-extrabold text-blue-400">
                  {currentNiche.slice(0, 2).toUpperCase()}
                </span>
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
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono">Instant Switch</span>
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
                          ? "bg-blue-600 text-white shadow-md font-bold" 
                          : "text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                      )}
                    >
                      <span className="truncate">{niche.name}</span>
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

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-hide">
          {filteredNavItems.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={`div-${idx}`} className={cn("pt-3 pb-1", isSidebarOpen ? "px-3" : "px-0 text-center")}>
                  {isSidebarOpen ? (
                    <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{item.name}</span>
                  ) : (
                    <div className="w-4 h-px bg-[var(--color-border)] mx-auto" />
                  )}
                </div>
              );
            }

            return (
              <SidebarNavItemRow 
                key={item.name}
                item={item}
                isSidebarOpen={isSidebarOpen}
                pathname={pathname}
              />
            );
          })}
        </div>

        {/* User Footer & System Menu Popover Trigger */}
        <div 
          className="p-3 border-t border-[var(--color-border)] relative bg-[var(--color-surface)]/40"
          onMouseEnter={() => {
            if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
            setIsProfileMenuOpen(true);
          }}
          onMouseLeave={() => {
            profileTimeoutRef.current = setTimeout(() => {
              setIsProfileMenuOpen(false);
            }, 250);
          }}
        >
          {/* System & Profile Popover Menu */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={cn(
                  "absolute z-50 bg-[var(--color-bg-elevated)] backdrop-blur-2xl border border-[var(--color-border)] rounded-2xl shadow-2xl p-2 space-y-1.5",
                  isSidebarOpen 
                    ? "bottom-full left-2.5 right-2.5 mb-2" 
                    : "bottom-2 left-20 w-64"
                )}
              >
                {/* Account Profile Header */}
                <div className="p-2.5 rounded-xl bg-[var(--color-surface)]/70 border border-[var(--color-border)]/60 flex items-center gap-3">
                  <div className="relative shrink-0">
                    <UserButton />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[var(--color-text)] truncate">
                        {user?.fullName || 'Business Owner'}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-blue-500/15 text-blue-500 shrink-0">
                        {demoRole}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                      {user?.primaryEmailAddress?.emailAddress || 'admin@zerodesk.app'}
                    </p>
                  </div>
                </div>

                {/* System Pages List */}
                <div className="space-y-0.5 pt-1">
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">
                    System & Operations
                  </div>
                  {filteredSystemItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <div className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all group",
                          isActive 
                            ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20" 
                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                        )}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={16} className={cn("shrink-0", isActive ? "text-white" : "text-blue-500 group-hover:text-blue-400")} />
                            <div className="truncate text-left">
                              <span className="block truncate font-semibold">{item.name}</span>
                              <span className={cn("block text-[10px] truncate", isActive ? "text-blue-100" : "text-[var(--color-text-muted)]")}>
                                {item.desc}
                              </span>
                            </div>
                          </div>
                          {item.badge && (
                            <span className={cn(
                              "text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ml-1",
                              isActive 
                                ? "bg-white/20 text-white" 
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--color-border)] my-1" />

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    signOut({ redirectUrl: '/' });
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut size={16} className="shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span>Sign Out</span>
                  </div>
                  <span className="text-[10px] text-rose-400/80 font-mono">End session</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Account Trigger Card */}
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-xl border border-[var(--color-border)] hover:border-blue-500/50 bg-[var(--color-bg)] transition-all group shadow-sm",
              isSidebarOpen ? "px-2.5 py-2" : "px-2 py-2 justify-center"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0">
                <UserButton appearance={{ elements: { rootBox: cn(!isSidebarOpen && "mx-auto") } }} />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold text-[var(--color-text)] truncate">
                    {user?.fullName || 'Business Owner'}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)] truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse shrink-0" />
                    {nicheConfig?.label || 'ZeroDesk OS'}
                  </span>
                </div>
              )}
            </div>
            {isSidebarOpen && (
              <ChevronUp size={14} className={cn("text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-transform shrink-0", isProfileMenuOpen && "rotate-180 text-blue-500")} />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Ghost Mode Live Banner */}
        {impersonatedTenant && (
          <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between z-30 shadow-xl text-xs sticky top-0 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-rose-200 tracking-wider uppercase text-[10px] bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  Ghost Mode Active
                </span>
                <span className="text-white font-medium">
                  Viewing Live as: <strong className="text-rose-200 font-bold underline decoration-rose-500 underline-offset-2">{impersonatedTenant.name}</strong>
                </span>
                <span className="text-rose-300/80 font-mono text-[11px] hidden md:inline">
                  • {impersonatedTenant.industry} • {impersonatedTenant.plan} Plan • ({impersonatedTenant.voiceMinutesUsed}/{impersonatedTenant.voiceMinutesLimit} Voice Mins Used)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/super-admin/tenants"
                onClick={() => impersonateTenant(null)}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-900/50 flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Exit Ghost Mode</span>
              </Link>
            </div>
          </div>
        )}

        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex-1 flex items-center gap-4">
            <button
              onClick={() => setIsCmdkOpen(true)}
              className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 w-64 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Search size={16} />
              <span className="text-xs">Search...</span>
              <kbd className="ml-auto text-[10px] border border-[var(--color-border)] rounded px-1.5 bg-[var(--color-bg)] font-mono">⌘K</kbd>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Demo Role Switcher */}
            <div className="relative">
              <button 
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 border border-[var(--color-border)] hover:bg-[var(--color-surface)] rounded-xl transition-colors text-xs font-semibold text-[var(--color-text)]"
              >
                <div className={cn("w-2 h-2 rounded-full", ROLE_COLORS[demoRole] || 'bg-blue-600')} />
                {nicheConfig.roles.find(r => r.id === demoRole)?.label || demoRole}
                <ChevronDown size={12} className="text-[var(--color-text-muted)]" />
              </button>
              
              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-bg-elevated)] backdrop-blur-md border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden z-50 p-1 space-y-1"
                  >
                    {nicheConfig.roles.map(role => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setDemoRole(role.id);
                          setGlobalRole(role.id as any);
                          setRoleDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text)] transition-colors"
                      >
                        <div className={cn("w-2 h-2 rounded-full", ROLE_COLORS[role.id] || 'bg-blue-600')} />
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

            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Notifications"
                className={cn(
                  "p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface)] transition-colors relative",
                  isNotifOpen && "bg-[var(--color-surface)] text-[var(--color-text)]"
                )}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              {/* Notification Settings Modal */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-[var(--color-bg-elevated)] backdrop-blur-2xl border border-[var(--color-border)] rounded-3xl shadow-2xl p-5 z-50 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                          <Bell size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[var(--color-text)]">Notifications</h3>
                          <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                            You get a popup and sound for new calls, messages, bookings, and tickets.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsNotifOpen(false)}
                        className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-2.5 divide-y divide-[var(--color-border)]/50">
                      {/* In-app popups */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--color-text)]">In-app popups</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">Show a popup in the dashboard when something arrives.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.inAppPopups}
                          onChange={(e) => updateSetting('inAppPopups', e.target.checked)}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Sound */}
                      <div className="flex items-center justify-between pt-2.5">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--color-text)]">Sound</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">Play a sound with each notification alert.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.sound}
                          onChange={(e) => updateSetting('sound', e.target.checked)}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Notification sound selector */}
                      <div className="flex items-center justify-between pt-2.5">
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text)]">Notification sound</p>
                        </div>
                        <select
                          value={settings.soundChoice}
                          onChange={(e) => updateSetting('soundChoice', e.target.value as any)}
                          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Bird Chirp">Bird Chirp</option>
                          <option value="Chime">Chime</option>
                          <option value="Ping">Ping</option>
                          <option value="Soft Bell">Soft Bell</option>
                        </select>
                      </div>

                      {/* Desktop notifications */}
                      <div className="flex items-center justify-between pt-2.5">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--color-text)]">Desktop notifications</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">Get an alert on screen when tab is in background.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.desktopNotifications}
                          onChange={(e) => updateSetting('desktopNotifications', e.target.checked)}
                          className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function CommandPalette({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] sm:pt-[15vh]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-50 w-full max-w-lg mx-4 rounded-xl shadow-2xl border border-[var(--color-glass-border)] bg-[var(--color-bg)] overflow-hidden"
      >
        <Command className="w-full bg-transparent flex flex-col" label="Global Command Menu">
          <div className="flex items-center border-b border-[var(--color-border)] px-3">
            <Search className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
            <Command.Input 
              autoFocus 
              className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] h-12 outline-none border-none px-3 text-sm" 
              placeholder="Type a command or search..." 
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
            <Command.Empty className="py-6 text-center text-sm text-[var(--color-text-muted)]">
              No results found.
            </Command.Empty>

            <Command.Group heading="Suggestions" className="text-xs font-medium text-[var(--color-text-muted)] px-2 py-1 mb-2">
              <Command.Item onSelect={() => { router.push('/customers'); onOpenChange(false); }} className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--color-text)] rounded-md hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] cursor-pointer aria-selected:bg-[var(--color-surface)] aria-selected:text-[var(--color-primary)]">
                <User size={16} />
                Search Customers
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/appointments'); onOpenChange(false); }} className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--color-text)] rounded-md hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] cursor-pointer aria-selected:bg-[var(--color-surface)] aria-selected:text-[var(--color-primary)]">
                <Calendar size={16} />
                Book Appointment
              </Command.Item>
            </Command.Group>
            
            <Command.Separator className="h-px bg-[var(--color-border)] my-1" />
            
            <Command.Group heading="Settings" className="text-xs font-medium text-[var(--color-text-muted)] px-2 py-1">
              <Command.Item onSelect={() => { router.push('/settings'); onOpenChange(false); }} className="flex items-center gap-2 px-2 py-2 text-sm text-[var(--color-text)] rounded-md hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] cursor-pointer aria-selected:bg-[var(--color-surface)] aria-selected:text-[var(--color-primary)]">
                <Settings size={16} />
                General Settings
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </motion.div>
    </div>
  );
}

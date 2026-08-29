'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { NicheId, ActiveNicheId, NicheConfig } from '@/config/niches/types';
import { NICHE_REGISTRY } from '@/config/niches';

interface NicheContextType {
  currentNiche: ActiveNicheId;
  nicheConfig: NicheConfig;
  setNiche: (id: ActiveNicheId) => void;
  getTerminology: (key: string) => string;
}

const NicheContext = createContext<NicheContextType | undefined>(undefined);

export function NicheProvider({ children }: { children: ReactNode }) {
  const [currentNiche, setCurrentNicheState] = useState<ActiveNicheId>('skin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check URL params
      const params = new URLSearchParams(window.location.search);
      const nicheParam = params.get('niche') as ActiveNicheId;
      
      if (nicheParam && NICHE_REGISTRY && NICHE_REGISTRY[nicheParam]) {
        setCurrentNicheState(nicheParam);
        localStorage.setItem('zerodesk-niche', nicheParam);
        return;
      }
      
      // 2. Check localStorage
      const saved = localStorage.getItem('zerodesk-niche') as ActiveNicheId;
      if (saved && NICHE_REGISTRY && NICHE_REGISTRY[saved]) {
        setCurrentNicheState(saved);
      } else {
        setCurrentNicheState('skin');
        localStorage.setItem('zerodesk-niche', 'skin');
      }
    }
  }, []);

  const setNiche = (id: ActiveNicheId) => {
    if (NICHE_REGISTRY && NICHE_REGISTRY[id]) {
      setCurrentNicheState(id);
      localStorage.setItem('zerodesk-niche', id);
    }
  };

  const getTerminology = (key: string) => {
    if (!NICHE_REGISTRY) return key;
    const config = NICHE_REGISTRY[currentNiche];
    return (config?.terminology as unknown as Record<string, string>)?.[key] || key;
  };

  // Provide a safe fallback if registry isn't fully loaded
  const nicheConfig = NICHE_REGISTRY ? (NICHE_REGISTRY[currentNiche] || NICHE_REGISTRY['skin']) : {} as NicheConfig;

  return (
    <NicheContext.Provider value={{ currentNiche, nicheConfig, setNiche, getTerminology }}>
      {children}
    </NicheContext.Provider>
  );
}

export function useNiche() {
  const ctx = useContext(NicheContext);
  if (!ctx) throw new Error('useNiche must be used within NicheProvider');
  return ctx;
}

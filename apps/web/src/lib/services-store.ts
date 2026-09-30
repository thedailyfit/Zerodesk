'use client';

import { tenantStorage } from '@/lib/tenant-storage';
import { useState, useEffect, useCallback } from 'react';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';
import { api } from '@/lib/api-client';

export interface ServiceOffering {
  id: string;
  nicheId: NicheId;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  staffRole?: string;
  isActive: boolean;
  // New fields
  gstEnabled: boolean;
  gstRate: number; // 0, 5, 12, 18, or 28
  isPackage: boolean;
  totalSessions?: number;
  sessionDuration?: number;
  packageValidityDays?: number;
  packageDiscount?: number;
}

export const SERVICE_CATEGORIES_BY_NICHE: Record<NicheId, string[]> = {
  skin: ['Laser', 'Aesthetics', 'Dermatology', 'Medi-Facial', 'Hair Care', 'Consultation', 'Registration', 'Package'],
  dental: ['Endodontics', 'Prosthodontics', 'Orthodontics', 'Preventive', 'Cosmetic', 'Implantology', 'Oral Surgery', 'Registration', 'Package'],
  spa: ['Massage', 'Body Treatment', 'Facial', 'Hydrotherapy', 'Aromatherapy', 'Couples', 'Detox', 'Package'],
  salon: ['Haircut', 'Hair Color', 'Hair Treatment', 'Facial', 'Bridal', 'Makeup', 'Nail Art', 'Waxing', 'Package'],
  realestate: ['Site Visit', 'Legal Consultation', 'Home Loan', 'Interior Design', 'Property Valuation', 'Documentation', 'Package'],
  hotel: ['Room Booking', 'Luxury Stay', 'Events & Weddings', 'Concierge', 'Dining', 'Hospitality Package', 'Package'],
};

export const DEFAULT_SERVICES_BY_NICHE: Record<NicheId, ServiceOffering[]> = {
  skin: [],
  dental: [],
  spa: [],
  salon: [],
  realestate: [],
  hotel: []
};

export const SERVICES_STORAGE_KEY_PREFIX = 'zerodesk_services_';
const SERVICES_EVENT = 'zerodesk_services_changed';

export function useServices() {
  const { currentNiche } = useNiche();
  const [services, setServices] = useState<ServiceOffering[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SERVICES_BY_NICHE[currentNiche] || [];
    try {
      const saved = tenantStorage.getItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((s: any) => !/^(skin|dental|spa|salon|realestate|hotel)-(pkg-)?\d+$/.test(s.id));
          return valid;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Reload when currentNiche changes
  useEffect(() => {
    try {
      const saved = tenantStorage.getItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((s: any) => !/^(skin|dental|spa|salon|realestate|hotel)-(pkg-)?\d+$/.test(s.id));
          setServices(valid);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setServices([]);

    // Background sync with NestJS /v1/services
    api.get<any[]>('/services').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        const mapped: ServiceOffering[] = res.map((s: any) => ({
          id: s.id,
          nicheId: currentNiche,
          name: s.name,
          category: s.category || 'General',
          duration: s.durationMins || 30,
          price: Number(s.price || 0),
          description: s.description || '',
          staffRole: s.staffRole || 'Specialist',
          isActive: s.isActive ?? true,
          gstEnabled: true,
          gstRate: 18,
          isPackage: false,
        }));
        setServices(mapped);
        if (typeof window !== 'undefined') {
          tenantStorage.setItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`, JSON.stringify(mapped));
        }
      }
    }).catch(() => {});
  }, [currentNiche]);

  // Listen to custom sync events across components
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = tenantStorage.getItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setServices(parsed);
          }
        }
      } catch {
        // Fallback
      }
    };
    window.addEventListener(SERVICES_EVENT, handleUpdate);
    return () => window.removeEventListener(SERVICES_EVENT, handleUpdate);
  }, [currentNiche]);

  const saveServices = useCallback((newServices: ServiceOffering[]) => {
    setServices(newServices);
    if (typeof window !== 'undefined') {
      try {
        tenantStorage.setItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`, JSON.stringify(newServices));
        window.dispatchEvent(new Event(SERVICES_EVENT));
      } catch (err) {
        console.error('Failed to save services to localStorage', err);
      }
    }
  }, [currentNiche]);

  const addService = useCallback((service: Omit<ServiceOffering, 'id' | 'nicheId'>) => {
    const newService: ServiceOffering = {
      ...service,
      id: `${currentNiche}-${Date.now()}`,
      nicheId: currentNiche,
    };
    const updated = [newService, ...services];
    saveServices(updated);

    // Background sync to backend
    api.post('/services', {
      name: newService.name,
      category: newService.category,
      price: newService.price,
      durationMins: newService.duration,
      description: newService.description,
      isActive: newService.isActive,
    }).catch(() => {});

    return newService;
  }, [currentNiche, services, saveServices]);

  const updateService = useCallback((id: string, patch: Partial<ServiceOffering>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...patch } : s);
    saveServices(updated);

    api.put(`/services/${id}`, patch).catch(() => {});
  }, [services, saveServices]);

  const deleteService = useCallback((id: string) => {
    const updated = services.filter(s => s.id !== id);
    saveServices(updated);

    api.delete(`/services/${id}`).catch(() => {});
  }, [services, saveServices]);

  const toggleServiceStatus = useCallback((id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    saveServices(updated);
  }, [services, saveServices]);

  const resetToDefaults = useCallback(() => {
    const defaultList = DEFAULT_SERVICES_BY_NICHE[currentNiche] || [];
    saveServices(defaultList);
  }, [currentNiche, saveServices]);

  return {
    services,
    activeServices: services.filter(s => s.isActive),
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    resetToDefaults,
  };
}

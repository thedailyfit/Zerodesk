'use client';

import { useState, useEffect } from 'react';

export interface BookingLinkConfig {
  slug: string;
  businessName: string;
  doctorEmail: string;
  coverImage?: string;
  enabledServiceIds: string[];
  slotDuration: 15 | 30 | 45 | 60;
  workingHoursStart: number;
  workingHoursEnd: number;
  otpChannel: 'phone' | 'email';
  reminderOptions: ('1day' | '1hour' | '10min')[];
  reminderChannels: ('email' | 'sms')[];
  confirmationChannels: ('email' | 'sms')[];
  webhookEnabled: boolean;
  webhookUrl: string;
  webhookLabel?: string;
  isActive: boolean;
}

const DEFAULT_CONFIG: BookingLinkConfig = {
  slug: 'sanctuary-booking',
  businessName: 'Sanctuary Clinic',
  doctorEmail: 'dr.sanctuary@zerodesk.pro',
  enabledServiceIds: [],
  slotDuration: 30,
  workingHoursStart: 9,
  workingHoursEnd: 18,
  otpChannel: 'phone',
  reminderOptions: ['1day', '1hour', '10min'],
  reminderChannels: ['email', 'sms'],
  confirmationChannels: ['email'],
  webhookEnabled: false,
  webhookUrl: '',
  webhookLabel: '',
  isActive: true,
};

export function useBookingLink() {
  const [config, setConfig] = useState<BookingLinkConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_booking_link_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const effectiveSlug = (parsed.slug && typeof parsed.slug === 'string' && parsed.slug.trim())
            ? parsed.slug.trim()
            : 'sanctuary-booking';
          setConfig({ ...DEFAULT_CONFIG, ...parsed, slug: effectiveSlug });
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load booking link config', e);
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (updates: Partial<BookingLinkConfig>) => {
    setConfig((prev) => {
      const effectiveSlug = updates.slug !== undefined
        ? (updates.slug.trim() ? updates.slug.trim() : 'sanctuary-booking')
        : (prev.slug?.trim() || 'sanctuary-booking');
      const next = { ...prev, ...updates, slug: effectiveSlug };
      try {
        localStorage.setItem('zerodesk_booking_link_config', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save booking link config', e);
      }
      return next;
    });
  };

  return {
    config,
    isLoaded,
    updateConfig,
  };
}

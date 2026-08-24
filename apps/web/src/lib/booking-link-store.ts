'use client';

import { useState, useEffect } from 'react';

export interface BookingLinkConfig {
  slug: string;
  businessName: string;
  doctorEmail: string;
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
  slug: 'dr-appointment',
  businessName: 'ZeroDesk Clinic',
  doctorEmail: 'doctor@zerodesk.in',
  enabledServiceIds: ['1', '2', '3', '4'],
  slotDuration: 30,
  workingHoursStart: 9,
  workingHoursEnd: 18,
  otpChannel: 'phone',
  reminderOptions: ['1day', '1hour', '10min'],
  reminderChannels: ['email', 'sms'],
  confirmationChannels: ['email'],
  webhookEnabled: true,
  webhookUrl: 'https://api.zerodesk.in/v1/frontdesk/bookings',
  webhookLabel: 'Ops workflow',
  isActive: true,
};

export function useBookingLink() {
  const [config, setConfig] = useState<BookingLinkConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_booking_link_config');
      if (saved) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load booking link config', e);
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (updates: Partial<BookingLinkConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
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

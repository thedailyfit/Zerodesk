'use client';

import { useState, useEffect } from 'react';

export interface NotificationSettings {
  inAppPopups: boolean;
  sound: boolean;
  soundChoice: 'Bird Chirp' | 'Chime' | 'Ping' | 'Soft Bell';
  desktopNotifications: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  inAppPopups: true,
  sound: true,
  soundChoice: 'Bird Chirp',
  desktopNotifications: false,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('zerodesk_notification_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load notification settings', e);
    }
    setIsLoaded(true);
  }, []);

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('zerodesk_notification_settings', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save notification settings', e);
      }
      return next;
    });
  };

  return {
    settings,
    isLoaded,
    updateSetting,
  };
}

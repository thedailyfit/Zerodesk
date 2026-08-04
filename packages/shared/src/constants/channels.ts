export const Channel = {
  VOICE: 'VOICE',
  WHATSAPP: 'WHATSAPP',
  WEB_CHAT: 'WEB_CHAT',
} as const;

export type ChannelType = (typeof Channel)[keyof typeof Channel];

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  VOICE: 'Voice Call',
  WHATSAPP: 'WhatsApp',
  WEB_CHAT: 'Website Chat',
};

export const CHANNEL_ICONS: Record<ChannelType, string> = {
  VOICE: '📞',
  WHATSAPP: '💬',
  WEB_CHAT: '🌐',
};

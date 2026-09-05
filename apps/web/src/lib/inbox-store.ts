'use client';

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api-client';

export interface UnifiedMessage {
  id: string;
  sender: 'ai' | 'customer' | 'staff' | 'system';
  channel: 'voice' | 'whatsapp' | 'webchat';
  content: string;
  time: string;
  duration?: string;
  audioUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
  metadata?: Record<string, any>;
}

export interface UnifiedContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  leadScore: number;
  sentiment: 'SATISFIED' | 'NEUTRAL' | 'ESCALATED';
  lastChannel: 'voice' | 'whatsapp' | 'webchat';
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
  tags: string[];
  appointment?: string;
  messages: UnifiedMessage[];
}

interface InboxState {
  contacts: UnifiedContact[];
  selectedContactId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  activeLiveCalls: Record<string, { callId: string; phone: string; liveTranscript: string }>;
  fetchConversations: () => Promise<void>;
  selectContact: (id: string) => Promise<void>;
  sendMessage: (contactId: string, content: string, channel?: 'whatsapp' | 'webchat') => Promise<void>;
  initSocket: (token?: string, tenantId?: string) => () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export const useInboxStore = create<InboxState>((set, get) => {
  let socket: Socket | null = null;

  return {
    contacts: [],
    selectedContactId: null,
    isConnected: false,
    isLoading: false,
    activeLiveCalls: {},

    fetchConversations: async () => {
      set({ isLoading: true });
      try {
        const convos = await api.get<any[]>('/conversations');
        if (Array.isArray(convos) && convos.length > 0) {
          const mapped: UnifiedContact[] = convos.map((c) => ({
            id: c.id,
            name: c.customer?.name || 'Inquiry Contact',
            phone: c.customer?.phone || '',
            email: c.customer?.email || '',
            leadScore: c.customer?.leadScore || 50,
            sentiment: (c.sentiment as any) || 'NEUTRAL',
            lastChannel: (c.channel?.toLowerCase() as any) || 'whatsapp',
            lastMessage: c.aiSummary || 'Active conversation',
            lastActive: new Date(c.updatedAt || c.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            unreadCount: 0,
            tags: c.customer?.tags || [],
            messages: [],
          }));
          set({ contacts: mapped, isLoading: false });
          if (mapped[0]?.id && !get().selectedContactId) {
            get().selectContact(mapped[0].id);
          }
        } else {
          set({ isLoading: false });
        }
      } catch (err) {
        console.warn('Could not fetch conversations from server, using local store:', err);
        set({ isLoading: false });
      }
    },

    selectContact: async (id: string) => {
      set({ selectedContactId: id });
      try {
        const messages = await api.get<any[]>(`/conversations/${id}/messages`);
        if (Array.isArray(messages)) {
          const mappedMsgs: UnifiedMessage[] = messages.map((m) => ({
            id: m.id,
            sender:
              m.role?.toLowerCase() === 'customer'
                ? 'customer'
                : m.role?.toLowerCase() === 'staff'
                ? 'staff'
                : 'ai',
            channel: 'whatsapp',
            content: m.content || '',
            time: new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            metadata: m.metadata,
          }));

          set((state) => ({
            contacts: state.contacts.map((c) => (c.id === id ? { ...c, messages: mappedMsgs } : c)),
          }));
        }
      } catch (err) {
        console.warn('Could not load messages for conversation:', err);
      }
    },

    sendMessage: async (contactId: string, content: string, channel: 'whatsapp' | 'webchat' = 'whatsapp') => {
      const contact = get().contacts.find((c) => c.id === contactId);
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: UnifiedMessage = {
        id: tempId,
        sender: 'staff',
        channel,
        content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };

      // Optimistic update
      set((state) => ({
        contacts: state.contacts.map((c) =>
          c.id === contactId
            ? { ...c, lastMessage: content, messages: [...c.messages, optimisticMsg] }
            : c
        ),
      }));

      try {
        if (contact?.phone) {
          await api.post('/whatsapp/send', {
            to: contact.phone,
            message: content,
          });
        }

        if (socket && socket.connected) {
          socket.emit('sendMessage', {
            conversationId: contactId,
            content,
            channel,
          });
        }
      } catch (err) {
        console.warn('Error sending message:', err);
      }
    },

    initSocket: (token?: string, tenantId?: string) => {
      if (typeof window === 'undefined') return () => {};

      if (socket) socket.disconnect();

      socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        set({ isConnected: true });
        if (tenantId) {
          socket?.emit('joinTenant', { tenantId });
        }
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
      });

      // 1. Live WhatsApp / WebChat event stream
      socket.on('inboxUpdate', (event: { channel: string; data: any }) => {
        const { data } = event;
        if (!data) return;

        const incomingMsg: UnifiedMessage = {
          id: data.id || `msg-${Date.now()}`,
          sender: data.role?.toLowerCase() === 'customer' ? 'customer' : 'ai',
          channel: (event.channel || '').toLowerCase().includes('whatsapp') ? 'whatsapp' : 'webchat',
          content: data.message || data.content || '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
        };

        set((state) => {
          const contactExists = state.contacts.some((c) => c.id === data.conversationId);
          if (!contactExists) {
            get().fetchConversations();
            return state;
          }

          return {
            contacts: state.contacts.map((c) => {
              if (c.id === data.conversationId) {
                return {
                  ...c,
                  lastMessage: incomingMsg.content,
                  unreadCount: state.selectedContactId === c.id ? 0 : c.unreadCount + 1,
                  messages: [...c.messages, incomingMsg],
                };
              }
              return c;
            }),
          };
        });
      });

      // 2. Live Voice Transcript streaming
      socket.on('voiceTranscript', (payload: { callId: string; transcript: string; role: string }) => {
        set((state) => ({
          activeLiveCalls: {
            ...state.activeLiveCalls,
            [payload.callId]: {
              callId: payload.callId,
              phone: 'Live Caller',
              liveTranscript: `${
                state.activeLiveCalls[payload.callId]?.liveTranscript || ''
              }\n${payload.role === 'user' ? 'Caller' : 'AI'}: ${payload.transcript}`,
            },
          },
        }));
      });

      return () => {
        socket?.disconnect();
        socket = null;
      };
    },
  };
});

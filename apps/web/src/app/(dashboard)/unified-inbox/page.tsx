'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  MessageSquare, 
  Phone, 
  PhoneCall, 
  Search, 
  Send, 
  Sparkles, 
  User, 
  Clock, 
  CheckCheck, 
  Play, 
  Pause, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Tag, 
  Smile, 
  Paperclip, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  PhoneIncoming,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';

interface UnifiedMessage {
  id: string;
  sender: 'ai' | 'customer' | 'staff' | 'system';
  channel: 'voice' | 'whatsapp' | 'webchat';
  content: string;
  time: string;
  duration?: string;
  audioUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
  metadata?: {
    intent?: string;
    sentiment?: 'SATISFIED' | 'NEUTRAL' | 'ESCALATED';
    recordingCost?: string;
  };
}

interface UnifiedContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
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

const MOCK_CONTACTS: UnifiedContact[] = [
  {
    id: 'c1',
    name: 'Kavita Reddy',
    phone: '+91 98765 12345',
    email: 'kavita.reddy@gmail.com',
    leadScore: 92,
    sentiment: 'SATISFIED',
    lastChannel: 'voice',
    lastMessage: 'Reserved Friday at 11 AM for Diode Laser',
    lastActive: '10m ago',
    unreadCount: 1,
    tags: ['Laser Hair Removal', 'VIP Lead', 'High Intent'],
    appointment: 'Friday, 11:00 AM (Dr. Meenakshi)',
    messages: [
      {
        id: 'm1',
        sender: 'ai',
        channel: 'voice',
        content: 'Namaskaram Kavita! Welcome to Glow Skin Clinic, Jubilee Hills. How can I assist your treatment inquiry today?',
        time: '15:10',
        duration: '4:15',
        metadata: { intent: 'Inquiry & Booking', sentiment: 'SATISFIED', recordingCost: '₹14.20' }
      },
      {
        id: 'm2',
        sender: 'customer',
        channel: 'voice',
        content: 'Hi! What is the price for Diode Laser full legs, and do you have slots this Friday?',
        time: '15:11',
      },
      {
        id: 'm3',
        sender: 'ai',
        channel: 'voice',
        content: 'Our full legs Diode Laser is ₹6,000 per session or ₹28,000 for a 6-session package with guaranteed results. Dr. Meenakshi has an opening this Friday at 11 AM. Shall I reserve it?',
        time: '15:12',
      },
      {
        id: 'm4',
        sender: 'customer',
        channel: 'voice',
        content: 'Yes please, 11 AM works perfect.',
        time: '15:13',
      },
      {
        id: 'm5',
        sender: 'system',
        channel: 'whatsapp',
        content: '📅 Appointment Confirmed: Friday 11:00 AM with Dr. Meenakshi. Pre-care: Shave 24h prior, avoid sun exposure.',
        time: '15:14',
        status: 'read'
      },
      {
        id: 'm6',
        sender: 'customer',
        channel: 'whatsapp',
        content: 'Thank you! Can you share clinic location on maps?',
        time: '15:18',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'c2',
    name: 'Dr. Rahul Verma',
    phone: '+91 87654 23456',
    email: 'r.verma@apexhealth.in',
    leadScore: 85,
    sentiment: 'SATISFIED',
    lastChannel: 'whatsapp',
    lastMessage: 'Confirmed HydraFacial for Saturday at 2 PM',
    lastActive: '45m ago',
    unreadCount: 0,
    tags: ['HydraFacial', 'Doctor Referral'],
    appointment: 'Saturday, 2:00 PM',
    messages: [
      {
        id: 'm201',
        sender: 'customer',
        channel: 'webchat',
        content: 'Hi, what HydraFacial packages do you offer at Banjara Hills?',
        time: '14:15',
      },
      {
        id: 'm202',
        sender: 'ai',
        channel: 'webchat',
        content: 'Hello! Our Signature HydraFacial includes deep aqua-extraction, glycolic peel & LED therapy for ₹3,500. Can I help you schedule a weekend session?',
        time: '14:16',
      },
      {
        id: 'm203',
        sender: 'system',
        channel: 'whatsapp',
        content: 'Dr. Rahul, your Saturday 2:00 PM session has been reserved at Banjara Hills branch.',
        time: '14:22',
        status: 'read'
      }
    ]
  },
  {
    id: 'c3',
    name: 'Sunita Rao',
    phone: '+91 76543 34567',
    email: 'sunita.rao@outlook.com',
    leadScore: 70,
    sentiment: 'ESCALATED',
    lastChannel: 'voice',
    lastMessage: 'Transferred call to Dr. Meenakshi (Post-Op Check)',
    lastActive: '2h ago',
    unreadCount: 0,
    tags: ['Botox Post-Care', 'Urgent Handoff'],
    messages: [
      {
        id: 'm301',
        sender: 'ai',
        channel: 'voice',
        content: 'Namaskaram Sunita! Welcome to Glow Skin Clinic.',
        time: '13:05',
        duration: '6:30',
        metadata: { intent: 'Post-Procedure Emergency', sentiment: 'ESCALATED' }
      },
      {
        id: 'm302',
        sender: 'customer',
        channel: 'voice',
        content: 'I had Botox 3 days ago and my left eyelid has slight swelling.',
        time: '13:06',
      },
      {
        id: 'm303',
        sender: 'ai',
        channel: 'voice',
        content: 'Patient safety is our highest priority. Please stay calm. I am immediately patching you through to senior dermatologist Dr. Meenakshi.',
        time: '13:07',
      }
    ]
  },
  {
    id: 'c4',
    name: 'Vikram Teja',
    phone: '+91 65432 45678',
    email: 'vikram.t@techcorp.com',
    leadScore: 60,
    sentiment: 'NEUTRAL',
    lastChannel: 'whatsapp',
    lastMessage: 'Auto WhatsApp sent after busy line',
    lastActive: '3h ago',
    unreadCount: 0,
    tags: ['Missed Call Followup'],
    messages: [
      {
        id: 'm401',
        sender: 'system',
        channel: 'whatsapp',
        content: 'Namaskaram Vikram! We missed your call. Reply 1 for Appointments, 2 for Treatment Pricing, or 3 to speak with frontdesk.',
        time: '11:45',
        status: 'read'
      },
      {
        id: 'm402',
        sender: 'customer',
        channel: 'whatsapp',
        content: '2',
        time: '11:46',
        status: 'read'
      },
      {
        id: 'm403',
        sender: 'ai',
        channel: 'whatsapp',
        content: 'Here is our complete 2026 treatment price menu: https://glowclinic.in/pricing. Would you like a free consultation slot?',
        time: '11:47',
        status: 'read'
      }
    ]
  }
];

export default function UnifiedInboxPage() {
  const { currentNiche } = useNiche();
  const [contacts, setContacts] = useState(MOCK_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string>('c1');
  const [channelFilter, setChannelFilter] = useState<'all' | 'voice' | 'whatsapp' | 'webchat'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [outboundMessage, setOutboundMessage] = useState('');
  const [selectedSendChannel, setSelectedSendChannel] = useState<'whatsapp' | 'webchat'>('whatsapp');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'all' || contact.lastChannel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outboundMessage.trim() || !selectedContact) return;

    const newMsg: UnifiedMessage = {
      id: `msg_${Date.now()}`,
      sender: 'staff',
      channel: selectedSendChannel,
      content: outboundMessage,
      time: 'Just now',
      status: 'sent'
    };

    setContacts(prev => prev.map(c => {
      if (c.id === selectedContact.id) {
        return {
          ...c,
          lastMessage: outboundMessage,
          lastActive: 'Just now',
          lastChannel: selectedSendChannel,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setOutboundMessage('');
  };

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => setPlayingAudioId(null), 5000);
    }
  };

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col max-w-[1600px] mx-auto p-3 sm:p-4 gap-3">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] px-5 py-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-sm">
            <Inbox size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[var(--color-text)]">The Unified Omnichannel Inbox</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Single unified timeline combining Voice Call transcripts, WhatsApp dialogues, and Website Chatbot queries.
            </p>
          </div>
        </div>

        {/* Channel Filter Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shrink-0 overflow-x-auto">
          {[
            { id: 'all', label: 'All Channels', count: contacts.length },
            { id: 'voice', label: 'Voice Calls', count: contacts.filter(c => c.lastChannel === 'voice').length },
            { id: 'whatsapp', label: 'WhatsApp', count: contacts.filter(c => c.lastChannel === 'whatsapp').length },
            { id: 'webchat', label: 'Webchat', count: contacts.filter(c => c.lastChannel === 'webchat').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setChannelFilter(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                channelFilter === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                channelFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* Left Column: Contact List (4 cols) */}
        <div className="lg:col-span-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm">
          {/* Search box */}
          <div className="p-3 border-b border-[var(--color-border)]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)] w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, phone, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] space-y-1">
                <Inbox size={24} className="mx-auto text-slate-600 mb-2" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredContacts.map(contact => {
                const isSelected = contact.id === selectedContact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={cn(
                      "p-3.5 cursor-pointer transition-all flex items-start gap-3 relative group",
                      isSelected 
                        ? "bg-blue-600/10 border-l-4 border-l-blue-500" 
                        : "hover:bg-[var(--color-bg)]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-[8px] text-white",
                        contact.lastChannel === 'voice' ? "bg-blue-500" :
                        contact.lastChannel === 'whatsapp' ? "bg-emerald-500" : "bg-purple-500"
                      )}>
                        {contact.lastChannel === 'voice' && <Phone size={8} />}
                        {contact.lastChannel === 'whatsapp' && <MessageSquare size={8} />}
                        {contact.lastChannel === 'webchat' && <Bot size={8} />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-[var(--color-text)] truncate">{contact.name}</h4>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{contact.lastActive}</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate font-medium">{contact.lastMessage}</p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase",
                          contact.sentiment === 'SATISFIED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          contact.sentiment === 'ESCALATED' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-slate-800 text-slate-400"
                        )}>
                          {contact.sentiment}
                        </span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                          Score: {contact.leadScore}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Interactive Unified Chat Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm">
          
          {/* Chat header */}
          <div className="p-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                {selectedContact.name[0]}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  {selectedContact.name}
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-normal">{selectedContact.phone}</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Omnichannel Connected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert(`Calling ${selectedContact.phone} via ZeroDesk LiveKit Softphone...`)}
                className="p-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all flex items-center gap-1"
                title="Initiate Instant Call"
              >
                <PhoneCall size={13} />
                <span className="hidden sm:inline">Call</span>
              </button>
            </div>
          </div>

          {/* Timeline messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950/20 to-transparent">
            {selectedContact.messages.map((msg) => {
              const isAiOrSystem = msg.sender === 'ai' || msg.sender === 'system';
              const isStaff = msg.sender === 'staff';
              const isVoice = msg.channel === 'voice';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1 max-w-[88%]",
                    isStaff ? "ml-auto items-end" : "items-start"
                  )}
                >
                  {/* Channel & Sender Badge */}
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)] font-mono">
                    <span className={cn(
                      "px-1.5 py-0.2 rounded text-[9px] uppercase font-bold flex items-center gap-1",
                      msg.channel === 'voice' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                      msg.channel === 'whatsapp' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    )}>
                      {msg.channel === 'voice' && <Phone size={9} />}
                      {msg.channel === 'whatsapp' && <MessageSquare size={9} />}
                      {msg.channel === 'webchat' && <Bot size={9} />}
                      {msg.channel}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-300">
                      {msg.sender === 'ai' ? '🤖 DermAI Voice Agent' : msg.sender === 'system' ? '⚙️ WhatsApp Automations' : msg.sender === 'staff' ? '👨‍⚕️ Frontdesk Staff' : selectedContact.name}
                    </span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "p-3.5 rounded-2xl text-xs leading-relaxed border shadow-sm",
                    isVoice 
                      ? "bg-blue-950/40 border-blue-500/30 text-blue-100" :
                    msg.channel === 'whatsapp' && !isStaff
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-100" :
                    isStaff
                      ? "bg-blue-600 text-white border-blue-500" :
                      "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)]"
                  )}>
                    {/* Voice audio preview bar */}
                    {isVoice && (
                      <div className="mb-2 p-2 bg-slate-900/80 rounded-xl border border-blue-500/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAudio(msg.id)}
                            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow transition-all"
                          >
                            {playingAudioId === msg.id ? <Pause size={12} className="animate-pulse" /> : <Play size={12} />}
                          </button>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold text-slate-300">Call Audio Log</span>
                            <div className="text-[9px] text-slate-400 font-mono">Duration: {msg.duration || '2:30'}</div>
                          </div>
                        </div>
                        {msg.metadata?.recordingCost && (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                            {msg.metadata.recordingCost}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.content}</p>

                    {msg.status && (
                      <div className="flex justify-end mt-1 text-[10px] text-emerald-400">
                        <CheckCheck size={13} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outbound Quick Reply Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[var(--color-bg)] border-t border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-text-muted)] font-medium">Send reply via:</span>
                <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSelectedSendChannel('whatsapp')}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1",
                      selectedSendChannel === 'whatsapp' ? "bg-emerald-600 text-white shadow" : "text-slate-400"
                    )}
                  >
                    <MessageSquare size={10} /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSendChannel('webchat')}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1",
                      selectedSendChannel === 'webchat' ? "bg-purple-600 text-white shadow" : "text-slate-400"
                    )}
                  >
                    <Bot size={10} /> Webchat
                  </button>
                </div>
              </div>

              {/* AI Suggestion quick chip */}
              <button
                type="button"
                onClick={() => setOutboundMessage(`Here is our Google Maps location: https://maps.app.goo.gl/glowclinic. Let us know if you need parking directions!`)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"
              >
                <Sparkles size={11} /> AI Suggested Reply
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={outboundMessage}
                onChange={(e) => setOutboundMessage(e.target.value)}
                placeholder={`Type a direct ${selectedSendChannel === 'whatsapp' ? 'WhatsApp message' : 'Webchat reply'}...`}
                className="flex-1 px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!outboundMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Lead Intelligence & Quick CRM (3 cols) */}
        <div className="lg:col-span-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col min-h-0 overflow-y-auto space-y-5 shadow-sm">
          
          {/* Patient / Lead Profile Card */}
          <div className="text-center pb-4 border-b border-[var(--color-border)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-2.5">
              {selectedContact.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="font-bold text-sm text-[var(--color-text)]">{selectedContact.name}</h3>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">{selectedContact.phone}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">{selectedContact.email}</p>
          </div>

          {/* Lead Health & Sentiment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">Lead Intelligence</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                <span className="text-[10px] text-[var(--color-text-muted)] block mb-0.5">AI Lead Score</span>
                <span className="text-base font-extrabold text-blue-400 font-mono">{selectedContact.leadScore}/100</span>
              </div>
              <div className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                <span className="text-[10px] text-[var(--color-text-muted)] block mb-0.5">AI Sentiment</span>
                <span className="text-xs font-bold text-emerald-400">{selectedContact.sentiment}</span>
              </div>
            </div>

            {selectedContact.appointment && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                  <Calendar size={12} /> Booked Appointment
                </span>
                <p className="text-xs font-semibold text-[var(--color-text)]">{selectedContact.appointment}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} /> Interest Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedContact.tags.map(tag => (
                <span key={tag} className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 1-Click Quick Actions */}
          <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">1-Click Smart Actions</h4>
            
            <button
              type="button"
              onClick={() => alert(`Sent automated Google Review link via WhatsApp to ${selectedContact.name}!`)}
              className="w-full py-2 px-3 bg-[var(--color-bg)] hover:bg-slate-800 border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text)] flex items-center justify-between transition-colors"
            >
              <span>⭐ Request Google Review (WhatsApp)</span>
              <ChevronRight size={14} className="text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() => alert(`Sent payment invoice link for ₹6,000 to ${selectedContact.name}!`)}
              className="w-full py-2 px-3 bg-[var(--color-bg)] hover:bg-slate-800 border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text)] flex items-center justify-between transition-colors"
            >
              <span>💳 Send Payment Link (UPI/Card)</span>
              <ChevronRight size={14} className="text-slate-500" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

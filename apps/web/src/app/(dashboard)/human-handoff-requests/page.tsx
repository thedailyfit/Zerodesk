"use client";

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Phone, MessageCircle, CheckCircle, Clock, AlertCircle, 
  Search, Sparkles, Calendar, ArrowRight, Shield, Send, Plus, 
  ChevronDown, User, Mail, IndianRupee, MessageSquareText, 
  Headphones, ExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface HandoffRequest {
  id: string;
  source: 'Voice AI' | 'WhatsApp AI' | 'Webchat AI';
  customerName: string;
  contact: string;
  email?: string;
  summary: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  assignedTo?: string;
  timestamp: Date;
  aiTranscript: { role: 'ai' | 'customer'; message: string }[];
  internalNotes: { author: string; note: string; time: string }[];
  category: string;
  estimatedValue?: number;
}

const NOW = new Date();

const MOCK_DATA: HandoffRequest[] = [
  {
    id: 'REQ-001',
    source: 'Voice AI',
    customerName: 'Sarah Jenkins',
    contact: '+91 98765 43210',
    email: 'sarah.j@example.com',
    summary: 'Pricing inquiry for full body treatment',
    status: 'PENDING',
    urgency: 'CRITICAL',
    timestamp: new Date(NOW.getTime() - 3 * 60000),
    category: 'Sales',
    estimatedValue: 15000,
    aiTranscript: [
      { role: 'ai', message: 'Hello! Welcome to our clinic. How can I assist you today?' },
      { role: 'customer', message: 'Hi, I wanted to know the price for the full body wellness package.' },
      { role: 'ai', message: 'Our standard full body package starts at ₹12,000. Would you like me to book a consultation to discuss the exact pricing based on your needs?' },
      { role: 'customer', message: 'I need to speak to someone right now, I have specific questions before I book.' }
    ],
    internalNotes: []
  },
  {
    id: 'REQ-002',
    source: 'WhatsApp AI',
    customerName: 'Rahul Sharma',
    contact: '+91 91234 56789',
    summary: 'Slot conflict reschedule',
    status: 'PENDING',
    urgency: 'HIGH',
    timestamp: new Date(NOW.getTime() - 8 * 60000),
    category: 'Scheduling',
    aiTranscript: [
      { role: 'ai', message: 'Your appointment is confirmed for tomorrow at 10 AM.' },
      { role: 'customer', message: 'I can\'t make it at 10. Can we do 12?' },
      { role: 'ai', message: 'Let me check... I\'m sorry, but 12 PM is fully booked. How about 2 PM?' },
      { role: 'customer', message: 'No, it has to be morning. Let me talk to a human please.' }
    ],
    internalNotes: []
  },
  {
    id: 'REQ-003',
    source: 'Voice AI',
    customerName: 'Emily Clark',
    contact: '+91 99887 76655',
    email: 'e.clark@domain.com',
    summary: 'Pre-treatment prep questions',
    status: 'ACCEPTED',
    urgency: 'NORMAL',
    assignedTo: 'Frontdesk Staff',
    timestamp: new Date(NOW.getTime() - 25 * 60000),
    category: 'Medical Query',
    aiTranscript: [
      { role: 'ai', message: 'Just a reminder, please do not eat anything 12 hours before the procedure.' },
      { role: 'customer', message: 'Wait, I just had a small snack, is that going to be a problem?' },
      { role: 'ai', message: 'Fasting is required. If you have eaten, you may need to speak to a staff member for guidance.' },
      { role: 'customer', message: 'Okay, transfer me to someone who can help.' }
    ],
    internalNotes: [
      { author: 'Jane Doe', note: 'Checked with Dr. Smith, a small snack 8 hours prior is okay but need to confirm exactly what she ate.', time: '10 mins ago' }
    ]
  },
  {
    id: 'REQ-004',
    source: 'Webchat AI',
    customerName: 'Vikram Mehta',
    contact: '+91 98712 34567',
    summary: 'Insurance verification',
    status: 'COMPLETED',
    urgency: 'LOW',
    assignedTo: 'Manager',
    timestamp: new Date(NOW.getTime() - 60 * 60000),
    category: 'Billing',
    aiTranscript: [
      { role: 'ai', message: 'Do you have your insurance card handy?' },
      { role: 'customer', message: 'Yes, it is from MaxBupa. Policy #MB123456' },
      { role: 'ai', message: 'I am unable to verify that policy number automatically. Let me connect you with our billing specialist.' }
    ],
    internalNotes: [
      { author: 'Mike Ross', note: 'Verified manually. Sent confirmation email to customer.', time: '40 mins ago' }
    ]
  },
  {
    id: 'REQ-005',
    source: 'WhatsApp AI',
    customerName: 'Priya Patel',
    contact: '+91 99000 11222',
    summary: 'Urgent allergic reaction follow-up',
    status: 'PENDING',
    urgency: 'HIGH',
    timestamp: new Date(NOW.getTime() - 2 * 60000),
    category: 'Medical Emergency',
    aiTranscript: [
      { role: 'ai', message: 'How are you feeling after yesterday\'s treatment?' },
      { role: 'customer', message: 'Not good, my skin is very red and itchy.' },
      { role: 'ai', message: 'I\'m sorry to hear that. Should I schedule an immediate follow-up?' },
      { role: 'customer', message: 'Yes, but I need to talk to a doctor NOW.' }
    ],
    internalNotes: []
  },
  {
    id: 'REQ-006',
    source: 'Voice AI',
    customerName: 'Arjun Nair',
    contact: '+91 99988 77766',
    summary: 'Package upgrade inquiry',
    status: 'ACCEPTED',
    urgency: 'NORMAL',
    assignedTo: 'Manager',
    timestamp: new Date(NOW.getTime() - 40 * 60000),
    category: 'Sales',
    estimatedValue: 25000,
    aiTranscript: [
      { role: 'ai', message: 'You are currently on the Silver tier. Are you interested in upgrading?' },
      { role: 'customer', message: 'What do I get with the Gold tier?' },
      { role: 'ai', message: 'The Gold tier includes 3 extra sessions and priority booking.' },
      { role: 'customer', message: 'I might be interested, can someone call me to discuss the exact price difference?' }
    ],
    internalNotes: [
      { author: 'Sarah Connor', note: 'Called twice, no answer. Will try again in an hour.', time: '5 mins ago' }
    ]
  },
  {
    id: 'REQ-007',
    source: 'Webchat AI',
    customerName: 'Meena Krishnan',
    contact: '+91 91111 22222',
    email: 'meena.k@gmail.com',
    summary: 'Payment dispute/refund',
    status: 'PENDING',
    urgency: 'CRITICAL',
    timestamp: new Date(NOW.getTime() - 1 * 60000),
    category: 'Billing',
    aiTranscript: [
      { role: 'ai', message: 'Your payment of ₹5000 was successful.' },
      { role: 'customer', message: 'What? I was supposed to be charged ₹3000! Why is it 5000?' },
      { role: 'ai', message: 'I see a discrepancy. I will escalate this to a billing manager.' }
    ],
    internalNotes: []
  },
  {
    id: 'REQ-008',
    source: 'WhatsApp AI',
    customerName: 'David Chen',
    contact: '+91 92222 33333',
    summary: 'Post-procedure recovery concern',
    status: 'IN_PROGRESS',
    urgency: 'NORMAL',
    assignedTo: 'Doctor',
    timestamp: new Date(NOW.getTime() - 15 * 60000),
    category: 'Medical Query',
    aiTranscript: [
      { role: 'ai', message: 'Please ensure you rest for 24 hours.' },
      { role: 'customer', message: 'Can I take painkillers if it hurts too much?' },
      { role: 'ai', message: 'You can take over-the-counter pain medication, but for severe pain please consult the doctor.' },
      { role: 'customer', message: 'I think it is severe. Let me talk to the doctor.' }
    ],
    internalNotes: [
      { author: 'Dr. House', note: 'Reviewing file now, will call him shortly.', time: '2 mins ago' }
    ]
  }
];

export default function HumanHandoffRequestsPage() {
  const [requests, setRequests] = useState<HandoffRequest[]>(MOCK_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [newNote, setNewNote] = useState('');
  const [timeNow, setTimeNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const selectedRequest = requests.find(r => r.id === selectedId);

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    accepted: requests.filter(r => r.status === 'ACCEPTED').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: requests.filter(r => r.status === 'COMPLETED').length,
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-500 text-white border-red-600';
      case 'HIGH': return 'bg-amber-500 text-white border-amber-600';
      case 'NORMAL': return 'bg-blue-500 text-white border-blue-600';
      case 'LOW': return 'bg-slate-500 text-white border-slate-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getUrgencyBorder = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'border-l-red-500';
      case 'HIGH': return 'border-l-amber-500';
      case 'NORMAL': return 'border-l-blue-500';
      case 'LOW': return 'border-l-slate-500';
      default: return 'border-l-gray-500';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Voice AI': return <Headphones className="w-4 h-4 text-blue-500" />;
      case 'WhatsApp AI': return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'Webchat AI': return <MessageSquareText className="w-4 h-4 text-indigo-500" />;
      default: return <Sparkles className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getSlaTimer = (timestamp: Date) => {
    const mins = Math.floor((timeNow.getTime() - timestamp.getTime()) / 60000);
    if (mins < 5) return <span className="text-emerald-600 font-medium">{mins}m</span>;
    if (mins < 15) return <span className="text-amber-600 font-medium">{mins}m</span>;
    return <span className="text-red-600 font-bold">{mins}m</span>;
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedRequest) return;
    const updated = requests.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          internalNotes: [
            { author: 'Current User', note: newNote, time: 'Just now' },
            ...r.internalNotes
          ]
        };
      }
      return r;
    });
    setRequests(updated);
    setNewNote('');
  };

  const handleStatusChange = (newStatus: any) => {
    if (!selectedRequest) return;
    const updated = requests.map(r => r.id === selectedRequest.id ? { ...r, status: newStatus } : r);
    setRequests(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 sm:p-6 bg-[var(--color-bg)]">
      {/* Header & Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">Human Hand-off Requests</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Pending</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.pending}</p>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600 animate-pulse" />
            </div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Accepted</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.accepted}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">In Progress</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.inProgress}</p>
            </div>
            <div className="bg-cyan-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Resolved Today</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.resolved}</p>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LEFT PANEL: List */}
        <div className="md:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-[var(--color-border)] space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search requests..." 
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <select 
                className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Resolved</option>
              </select>
              <select 
                className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="ALL">All Urgency</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)]">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No requests found matching your filters.</p>
                </div>
              ) : (
                filteredRequests.map(req => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    key={req.id}
                    onClick={() => setSelectedId(req.id)}
                    className={cn(
                      "p-4 border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg)] transition-colors border-l-4",
                      getUrgencyBorder(req.urgency),
                      selectedId === req.id ? 'bg-[var(--color-bg)] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)]' : ''
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        {getSourceIcon(req.source)}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {req.source}
                        </span>
                        {req.estimatedValue && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center">
                            <IndianRupee className="w-3 h-3 mr-0.5" />
                            {req.estimatedValue.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {getSlaTimer(req.timestamp)}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-[var(--color-text)] truncate">{req.customerName}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] truncate mb-2">{req.summary}</p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {req.contact}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded",
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                        req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-blue-100 text-blue-700'
                      )}>
                        {req.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: Details */}
        <div className="md:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm flex flex-col overflow-hidden h-full">
          {selectedRequest ? (
            <>
              {/* Detail Header */}
              <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center">
                      {selectedRequest.customerName}
                      <span className={cn("ml-3 text-xs px-2 py-1 rounded-md uppercase font-bold", getUrgencyColor(selectedRequest.urgency))}>
                        {selectedRequest.urgency}
                      </span>
                    </h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-[var(--color-text-muted)]">
                      <span className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {selectedRequest.contact}</span>
                      {selectedRequest.email && (
                        <span className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {selectedRequest.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <select 
                      value={selectedRequest.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={cn(
                        "text-sm font-semibold border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2",
                        selectedRequest.status === 'PENDING' ? 'border-amber-300 bg-amber-50 text-amber-700' :
                        selectedRequest.status === 'COMPLETED' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' :
                        'border-blue-300 bg-blue-50 text-blue-700'
                      )}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accept</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Resolve</option>
                      <option value="ESCALATED">Escalate</option>
                    </select>
                    <select className="text-sm border border-[var(--color-border)] rounded-lg px-3 py-1.5 bg-[var(--color-bg)] text-[var(--color-text)]">
                      <option>Assign to...</option>
                      <option>Frontdesk Staff</option>
                      <option>Manager</option>
                      <option>Doctor</option>
                    </select>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center space-x-3 mt-5">
                  <a href={`tel:${selectedRequest.contact}`} className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <Phone className="w-4 h-4 mr-2" /> Call
                  </a>
                  <a href={`https://wa.me/${selectedRequest.contact.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </a>
                  <Link href="/book-appointment" className="flex-1 flex items-center justify-center px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium rounded-lg transition-colors">
                    <Calendar className="w-4 h-4 mr-2" /> Book Appt
                  </Link>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* AI Transcript */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center mb-3">
                    <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> AI Conversation Context
                  </h3>
                  <div className="bg-[var(--color-bg)] rounded-xl p-4 space-y-3 border border-[var(--color-border)]">
                    {selectedRequest.aiTranscript.map((msg, idx) => (
                      <div key={idx} className={cn("flex", msg.role === 'customer' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          msg.role === 'customer' ? "bg-blue-600 text-white rounded-br-none" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-bl-none"
                        )}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center mb-3">
                    <Shield className="w-4 h-4 mr-2 text-slate-500" /> Internal Notes
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Add Note */}
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        placeholder="Add a private note..." 
                        className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button 
                        onClick={handleAddNote}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Note List */}
                    {selectedRequest.internalNotes.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRequest.internalNotes.map((note, idx) => (
                          <div key={idx} className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm">
                            <p className="text-gray-800 mb-1">{note.note}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span className="font-medium text-gray-700">{note.author}</span>
                              <span>{note.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-text-muted)] italic">No internal notes yet.</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
              <Headphones className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { UserCheck, Phone, MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface HandoffRequest {
  id: string;
  source: 'Voice AI' | 'WhatsApp AI';
  customerName: string;
  contact: string;
  summary: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  timestamp: Date;
}

export default function HumanHandoffRequestsPage() {
  const [requests, setRequests] = useState<HandoffRequest[]>([
    {
      id: 'REQ-001',
      source: 'Voice AI',
      customerName: 'Sarah Jenkins',
      contact: '+919876543210',
      summary: 'Patient requested to speak with a human regarding complex pricing for the new package.',
      status: 'PENDING',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: 'REQ-002',
      source: 'WhatsApp AI',
      contact: '+919876543211',
      customerName: 'Rahul Sharma',
      summary: 'Automated booking failed due to slot conflict, requested callback.',
      status: 'PENDING',
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: 'REQ-003',
      source: 'Voice AI',
      customerName: 'Emily Clark',
      contact: '+919876543212',
      summary: 'General inquiry escalated.',
      status: 'ACCEPTED',
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    }
  ]);

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ACCEPTED' } : r));
  };

  const handleComplete = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETED' } : r));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-500" />
            Human Hand-off Requests
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Manage conversations escalated from AI agents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map(request => (
          <div key={request.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${request.source === 'Voice AI' ? 'bg-purple-500/10 text-purple-500' : 'bg-green-500/10 text-green-500'}`}>
                  {request.source === 'Voice AI' ? <Phone className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                  {request.source}
                </span>
              </div>
              <div className="flex items-center text-xs text-[var(--color-text-muted)] gap-1">
                <Clock className="w-3 h-3" />
                {Math.round((Date.now() - request.timestamp.getTime()) / 60000)} mins ago
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--color-text)]">{request.customerName}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{request.contact}</p>
            </div>

            <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-sm text-[var(--color-text)]">
              <span className="font-medium flex items-center gap-1 mb-1 text-[var(--color-text-muted)]">
                <AlertCircle className="w-3 h-3" /> Reason for handoff
              </span>
              {request.summary}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <a href={`tel:${request.contact}`} className="p-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] text-blue-500 transition-colors" title="Call Customer">
                  <Phone className="w-4 h-4" />
                </a>
                <a href={`https://wa.me/${request.contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] text-green-500 transition-colors" title="WhatsApp Customer">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>

              {request.status === 'PENDING' && (
                <button 
                  onClick={() => handleAccept(request.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Accept Request
                </button>
              )}
              {request.status === 'ACCEPTED' && (
                <button 
                  onClick={() => handleComplete(request.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Done
                </button>
              )}
              {request.status === 'COMPLETED' && (
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

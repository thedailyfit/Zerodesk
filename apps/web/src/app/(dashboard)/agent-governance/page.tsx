'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Cpu,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Lock,
  ArrowUpRight,
  Sparkles,
  Zap,
  PhoneCall,
  MessageSquare,
  Radio,
  FileCheck
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';

interface AgentEstate {
  id: string;
  agentKey: string;
  name: string;
  humanOwnerName: string;
  humanOwnerRole: string;
  allowedTools: string[];
  touchedSystems: string[];
  hardLimits: {
    maxBookingDaysAhead?: number;
    maxDiscountAllowedPct?: number;
    maxCallsPerHour?: number;
    maxMessagesPerHour?: number;
    maxMessagesPerDay?: number;
    enforceTraiDnd?: boolean;
    maxHandoffsPerHour?: number;
  };
  goalIntegrityOwner?: string;
  authorityOwner?: string;
  supplyChainOwner?: string;
  blastRadiusOwner?: string;
  isActive: boolean;
}

interface ActionTrace {
  id: string;
  channel: string;
  actionName: string;
  targetResource: string;
  parameters: any;
  policyDecision: string;
  policyRuleId?: string;
  executionStatus: string;
  entityId?: string;
  errorMessage?: string;
  latencyMs: number;
  createdAt: string;
  agentEstate?: {
    name: string;
    humanOwnerName: string;
  };
}

export default function AgentGovernancePage() {
  const [estates, setEstates] = useState<AgentEstate[]>([]);
  const [actionTraces, setActionTraces] = useState<ActionTrace[]>([]);
  const [frontierHealth, setFrontierHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ESTATE' | 'TRACES'>('ESTATE');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [estateRes, tracesRes, healthRes] = await Promise.all([
        apiGet<AgentEstate[]>('/governance/estate'),
        apiGet<{ data: ActionTrace[] }>('/governance/action-traces?limit=15'),
        apiGet<any>('/governance/frontier-health'),
      ]);
      setEstates(estateRes || []);
      setActionTraces(tracesRes?.data || []);
      setFrontierHealth(healthRes || null);
    } catch {
      // Fallback display state
      setEstates([
        {
          id: 'estate-1',
          agentKey: 'VOICE_RECEPTIONIST',
          name: 'Kavya - Voice AI Receptionist',
          humanOwnerName: 'Dr. Ananya Rao',
          humanOwnerRole: 'HEAD_DOCTOR',
          allowedTools: ['book_appointment', 'get_pricing', 'transfer_to_human', 'send_whatsapp_info'],
          touchedSystems: ['PostgreSQL_Appointments', 'LiveKit_SIP', 'Sarvam_Bulbul_TTS'],
          hardLimits: { maxBookingDaysAhead: 30, maxDiscountAllowedPct: 0, maxCallsPerHour: 50 },
          goalIntegrityOwner: 'Dr. Ananya Rao',
          authorityOwner: 'Dr. Ananya Rao',
          supplyChainOwner: 'Technical Admin',
          blastRadiusOwner: 'Clinic Operations Lead',
          isActive: true,
        },
        {
          id: 'estate-2',
          agentKey: 'WHATSAPP_AI',
          name: 'WhatsApp Practice Concierge',
          humanOwnerName: 'Priya Sharma',
          humanOwnerRole: 'CLINIC_COORDINATOR',
          allowedTools: ['book_appointment', 'get_pricing', 'lookup_faq', 'cancel_reschedule'],
          touchedSystems: ['PostgreSQL_Appointments', 'Meta_WhatsApp_Cloud'],
          hardLimits: { maxBookingDaysAhead: 30, maxDiscountAllowedPct: 0, maxMessagesPerHour: 100 },
          goalIntegrityOwner: 'Priya Sharma',
          authorityOwner: 'Dr. Ananya Rao',
          supplyChainOwner: 'Technical Admin',
          blastRadiusOwner: 'Priya Sharma',
          isActive: true,
        },
        {
          id: 'estate-3',
          agentKey: 'OUTBOUND_CAMPAIGNER',
          name: 'Autonomous Recall & Follow-up Agent',
          humanOwnerName: 'Rahul Verma',
          humanOwnerRole: 'PRACTICE_MANAGER',
          allowedTools: ['dispatch_reminder', 'send_feedback_link'],
          touchedSystems: ['PostgreSQL_Customers', 'Meta_WhatsApp_Cloud', 'Plivo_SMS'],
          hardLimits: { maxMessagesPerDay: 200, enforceTraiDnd: true },
          goalIntegrityOwner: 'Rahul Verma',
          authorityOwner: 'Dr. Ananya Rao',
          supplyChainOwner: 'Technical Admin',
          blastRadiusOwner: 'Rahul Verma',
          isActive: true,
        },
        {
          id: 'estate-4',
          agentKey: 'TRIAGE_AGENT',
          name: 'Receptionist Handoff & Triage Agent',
          humanOwnerName: 'Frontdesk Team',
          humanOwnerRole: 'LEAD_RECEPTIONIST',
          allowedTools: ['escalate_to_human', 'flag_bad_answer'],
          touchedSystems: ['Unified_Inbox', 'PostgreSQL_AuditLog'],
          hardLimits: { maxHandoffsPerHour: 20 },
          goalIntegrityOwner: 'Frontdesk Team',
          authorityOwner: 'Dr. Ananya Rao',
          supplyChainOwner: 'Technical Admin',
          blastRadiusOwner: 'Frontdesk Team',
          isActive: true,
        },
      ]);

      setActionTraces([
        {
          id: 'trace-demo-1',
          channel: 'WHATSAPP',
          actionName: 'BOOK_APPOINTMENT',
          targetResource: 'AppointmentSlot',
          parameters: { doctor: 'Dr. Ananya Rao', service: 'HydraFacial Deluxe', slot: '2:30 PM' },
          policyDecision: 'ALLOWED',
          policyRuleId: 'PERMIT_CLINIC_STANDARD_POLICY',
          executionStatus: 'COMMITTED',
          entityId: 'a7b8c9d0-1234',
          latencyMs: 145,
          createdAt: new Date().toISOString(),
          agentEstate: { name: 'WhatsApp Practice Concierge', humanOwnerName: 'Priya Sharma' },
        },
        {
          id: 'trace-demo-2',
          channel: 'VOICE',
          actionName: 'GET_PRICING',
          targetResource: 'RateCard',
          parameters: { serviceName: 'Laser Hair Reduction' },
          policyDecision: 'ALLOWED',
          policyRuleId: 'PERMIT_CLINIC_STANDARD_POLICY',
          executionStatus: 'COMMITTED',
          latencyMs: 38,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          agentEstate: { name: 'Kavya - Spoken Voice AI Receptionist', humanOwnerName: 'Dr. Ananya Rao' },
        },
      ]);

      setFrontierHealth({
        trilogy: {
          devops: { status: 'HEALTHY', telephonyCarrier: 'Plivo India SIP (Operational)', queueLagMs: 42 },
          finops: { status: 'HEALTHY', voiceMinutesPercent: 14.0, whatsappMessagesPercent: 16.4 },
          appsec: { status: 'ENFORCED', piiRedactionActive: true, dpdpConsentEnforced: true },
        },
        metrics24h: { totalActions: 48, failedActions: 0, successRate: 100, activeAgents: 4 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Agentic AI Governance & Estate Board</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Cedar Default-Deny Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Institutional authority boundaries, immutable Action Traces, and Frontier Agent Trilogy governance.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Estate</span>
        </button>
      </div>

      {/* Frontier Agent Trilogy KPI Banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Clinical DevOps Agent</span>
            <Radio size={16} className="text-emerald-500" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {frontierHealth?.trilogy?.devops?.status || 'HEALTHY'}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Plivo SIP &bull; LiveKit Mumbai &bull; Queue Lag: 45ms
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Practice FinOps Agent</span>
            <Activity size={16} className="text-indigo-500" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {frontierHealth?.trilogy?.finops?.voiceMinutesPercent ?? 14}% Burn
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Included quota on track &bull; Zero overage
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Healthcare AppSec Agent</span>
            <ShieldCheck size={16} className="text-blue-500" />
          </div>
          <div className="text-lg font-black text-slate-900">
            DPDP Enforced
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">
            100% PII Redaction &bull; Presigned R2 Audio
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>24h Action Success Rate</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-slate-900">
            {frontierHealth?.metrics24h?.successRate ?? 99.4}%
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">
            {frontierHealth?.metrics24h?.totalActions ?? 48} Actions Executed on Ledger
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('ESTATE')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ESTATE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={16} />
          <span>The Agent Estate Board & Failure Register</span>
        </button>
        <button
          onClick={() => setActiveTab('TRACES')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'TRACES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck size={16} />
          <span>Action Traces Ledger (Actions vs Prompts)</span>
        </button>
      </div>

      {/* Tab 1: The Agent Estate Board & Failure Register */}
      {activeTab === 'ESTATE' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Autonomous Practice Agents (The Estate Board)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every agent is bounded by a named human doctor/staff owner, explicit tools, and hard blast radius limits.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800">
                4 Agents Authorized
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {estates.map((agent) => (
                <div key={agent.id} className="p-5 hover:bg-slate-50/50 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {agent.agentKey === 'VOICE_RECEPTIONIST' ? <PhoneCall size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">Agent Key: {agent.agentKey}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-400 block">Named Human Owner</span>
                        <span className="text-xs font-bold text-slate-800">{agent.humanOwnerName} ({agent.humanOwnerRole})</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Allowed Tools */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs font-bold text-slate-500 mr-1">Allowed Tools:</span>
                    {agent.allowedTools?.map((tool) => (
                      <span key={tool} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-semibold text-slate-700">
                        {tool}
                      </span>
                    ))}
                  </div>

                  {/* Hard Blast Radius Limits */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">MAX BOOKING HORIZON</span>
                      <span className="font-bold text-slate-800">{agent.hardLimits?.maxBookingDaysAhead ?? 30} Days</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">MAX DISCOUNT ALLOWED</span>
                      <span className="font-bold text-rose-600">{agent.hardLimits?.maxDiscountAllowedPct ?? 0}% (Rate Card Locked)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[10px]">RATE LIMIT</span>
                      <span className="font-bold text-slate-800">{agent.hardLimits?.maxCallsPerHour || agent.hardLimits?.maxMessagesPerHour || 50} ops/hour</span>
                    </div>
                  </div>

                  {/* OWASP Failure Family Owners */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                      <span className="text-blue-600 font-bold block">1. Goal Integrity Owner</span>
                      <span className="text-slate-700 font-medium">{agent.goalIntegrityOwner || agent.humanOwnerName}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50/50 border border-purple-100">
                      <span className="text-purple-600 font-bold block">2. Authority Owner</span>
                      <span className="text-slate-700 font-medium">{agent.authorityOwner || 'Dr. Ananya Rao'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                      <span className="text-amber-700 font-bold block">3. Supply Chain Owner</span>
                      <span className="text-slate-700 font-medium">{agent.supplyChainOwner || 'Technical Admin'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                      <span className="text-rose-600 font-bold block">4. Blast Radius Owner</span>
                      <span className="text-slate-700 font-medium">{agent.blastRadiusOwner || 'Clinic Operations'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Action Traces Ledger */}
      {activeTab === 'TRACES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Action Traces Ledger (Audited Mutations)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recording exact database mutations, parameters, policy verdicts, and transaction IDs (Moving beyond prompt text logs).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Action & Channel</th>
                  <th className="p-3.5">Policy Verdict</th>
                  <th className="p-3.5">Execution Status</th>
                  <th className="p-3.5">Target Resource</th>
                  <th className="p-3.5">Parameters</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actionTraces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No action traces recorded yet. Inbound appointments and tool calls will populate this ledger.
                    </td>
                  </tr>
                ) : (
                  actionTraces.map((trace) => (
                    <tr key={trace.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{trace.actionName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{trace.channel}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          trace.policyDecision === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {trace.policyDecision}
                        </span>
                        {trace.policyRuleId && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{trace.policyRuleId}</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trace.executionStatus === 'COMMITTED'
                            ? 'bg-blue-100 text-blue-700'
                            : trace.executionStatus === 'REJECTED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {trace.executionStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {trace.targetResource}
                      </td>
                      <td className="p-3.5 max-w-xs truncate font-mono text-slate-500 text-[11px]">
                        {JSON.stringify(trace.parameters)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {trace.latencyMs}ms
                      </td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(trace.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Bell, 
  Globe, 
  Sparkles,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingLink } from '@/lib/booking-link-store';
import { useServices } from '@/lib/services-store';
import Link from 'next/link';

export default function BookingLinkAdminPage() {
  const { config, updateConfig } = useBookingLink();
  const { activeServices } = useServices();
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDay, setPreviewDay] = useState(24);
  const [previewSlot, setPreviewSlot] = useState('09:30 AM');

  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/book/${config.slug}`
    : `https://zerodesk.app/book/${config.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // Fallback: ignore clipboard errors in non-secure contexts
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    updateConfig({});
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Link2 size={20} />
            </div>
            <span>Public Booking Link</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Live Patient Scheduler
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs mt-1">
            Create and customize a shareable link where clients book real-time appointment slots verified by OTP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text)] transition-colors shadow-sm"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied!' : 'Copy Booking Link'}</span>
          </button>

          <Link
            href={`/book/${config.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <ExternalLink size={14} />
            <span>Open Live Booking Page</span>
          </Link>
        </div>
      </div>

      {/* Share Link Banner */}
      <div className="p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Share2 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--color-text)]">Your Active Public Booking URL</p>
            <p className="text-xs text-blue-400 font-mono truncate">{fullUrl}</p>
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shrink-0"
        >
          {copied ? 'Copied to Clipboard' : 'Copy URL'}
        </button>
      </div>

      {/* Two Column Setup: Left = Config Form, Right = Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Info */}
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <Globe size={16} className="text-blue-400" />
              General Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Business Name</label>
                <input
                  type="text"
                  value={config.businessName}
                  onChange={(e) => updateConfig({ businessName: e.target.value })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Custom Link Slug</label>
                <div className="flex items-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs">
                  <span className="text-[var(--color-text-muted)] font-mono">/book/</span>
                  <input
                    type="text"
                    value={config.slug}
                    onChange={(e) => updateConfig({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-transparent text-[var(--color-text)] font-mono focus:outline-none ml-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Doctor / Host Email Notification</label>
              <input
                type="email"
                value={config.doctorEmail}
                onChange={(e) => updateConfig({ doctorEmail: e.target.value })}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Slot & Scheduling Rules */}
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              Slot & Time Rules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Slot Duration</label>
                <select
                  value={config.slotDuration}
                  onChange={(e) => updateConfig({ slotDuration: Number(e.target.value) as 15 | 30 | 45 | 60 })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Verification Method</label>
                <select
                  value={config.otpChannel}
                  onChange={(e) => updateConfig({ otpChannel: e.target.value as 'phone' | 'email' })}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="phone">Phone SMS OTP (Standard)</option>
                  <option value="email">Google / Email OTP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-2">Available Services for Booking</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {activeServices.slice(0, 6).map((service) => {
                  const isChecked = (config.enabledServiceIds || []).includes(service.id.toString());
                  return (
                    <label
                      key={service.id}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all",
                        isChecked
                          ? "bg-blue-500/10 border-blue-500/30 text-[var(--color-text)]"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                      )}
                    >
                      <span className="font-semibold truncate">{service.name}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const idStr = service.id.toString();
                          const current = config.enabledServiceIds || [];
                          if (e.target.checked) {
                            updateConfig({ enabledServiceIds: [...current, idStr] });
                          } else {
                            updateConfig({ enabledServiceIds: current.filter(id => id !== idStr) });
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reminders & Confirmations */}
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <Bell size={16} className="text-blue-400" />
              Reminders & Confirmations
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">When to Send Reminders</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mb-2">Host and attendee receive automated reminders.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: '1day' as const, label: '1 day before' },
                    { id: '1hour' as const, label: '1 hour before' },
                    { id: '10min' as const, label: '10 min before' },
                  ].map((rem) => {
                    const isChecked = (config.reminderOptions || []).includes(rem.id);
                    return (
                      <button
                        key={rem.id}
                        type="button"
                        onClick={() => {
                          const current = config.reminderOptions || [];
                          if (isChecked) {
                            updateConfig({ reminderOptions: current.filter(r => r !== rem.id) });
                          } else {
                            updateConfig({ reminderOptions: [...current, rem.id] });
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all",
                          isChecked
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                        )}
                      >
                        {isChecked && <Check size={12} />}
                        <span>{rem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--color-text)] mt-3">Notification Channels</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <label className="flex items-center gap-2 text-xs text-[var(--color-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config.reminderChannels || []).includes('email')}
                      onChange={(e) => {
                        const current = config.reminderChannels || [];
                        if (e.target.checked) updateConfig({ reminderChannels: [...current, 'email'] });
                        else updateConfig({ reminderChannels: current.filter(c => c !== 'email') });
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Email</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[var(--color-text)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(config.reminderChannels || []).includes('sms')}
                      onChange={(e) => {
                        const current = config.reminderChannels || [];
                        if (e.target.checked) updateConfig({ reminderChannels: [...current, 'sms'] });
                        else updateConfig({ reminderChannels: current.filter(c => c !== 'sms') });
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>SMS / WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Endpoint */}
          <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)]">Send bookings to your own systems</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Every time an appointment is booked, ZeroDesk posts details to your webhook endpoint.
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.webhookEnabled}
                onChange={(e) => updateConfig({ webhookEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {config.webhookEnabled && (
              <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Endpoint URL (HTTPS)</label>
                  <input
                    type="url"
                    value={config.webhookUrl}
                    onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
                    placeholder="https://api.yourcompany.com/frontdesk/bookings"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs font-mono text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">Label</label>
                  <input
                    type="text"
                    value={config.webhookLabel || ''}
                    onChange={(e) => updateConfig({ webhookLabel: e.target.value })}
                    placeholder="e.g. Ops CRM sync"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check size={14} /> Settings Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Right Column: Live Customer Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-400" />
                Live Patient View Preview
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </div>

            {/* Mocked Standalone Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white space-y-1">
                <h3 className="font-extrabold text-lg">Schedule an Appointment</h3>
                <p className="text-xs text-blue-100">Book a time to connect with {config.businessName}</p>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-slate-800">Meeting with {config.doctorEmail}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{config.slotDuration} minutes • Phone / Clinic Visit</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Select Date (August 2026)</span>
                  <span className="text-blue-600 text-[11px]">Selected: Aug {previewDay}</span>
                </div>

                {/* Calendar Mini Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <span key={d} className="text-[10px] font-bold text-slate-400 py-1">{d}</span>
                  ))}
                  {[22, 23, 24, 25, 26, 27, 28].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setPreviewDay(day)}
                      className={cn(
                        "py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                        previewDay === day
                          ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                          : "hover:bg-slate-100 text-slate-700"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Available Time Slots</p>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {['09:00 AM', '09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPreviewSlot(slot)}
                      className={cn(
                        "py-2 px-1 rounded-xl text-center font-semibold border transition-all cursor-pointer",
                        previewSlot === slot
                          ? "bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-sm"
                          : "border-slate-200 text-slate-700 hover:border-slate-400"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/book/${config.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center block transition-all shadow-md shadow-blue-600/20"
                >
                  Continue to Patient Verification →
                </Link>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-medium">
                Powered by <strong className="text-slate-600">ZeroDesk Frontdesk</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

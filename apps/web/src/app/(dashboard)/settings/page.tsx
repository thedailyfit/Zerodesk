'use client';

import { motion } from 'framer-motion';
import { Building2, Clock, Globe, Palette, CreditCard, Shield, Bell, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your business settings and configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                activeTab === tab.id
                  ? "bg-[var(--color-primary-100)] text-[var(--color-text)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              )}>
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="flex-1 p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Business Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Business Name', value: 'Glow Skin Clinic', type: 'text' },
                  { label: 'Industry', value: 'Skin & Hair Clinic', type: 'select' },
                  { label: 'Phone', value: '+91 40 1234 5678', type: 'tel' },
                  { label: 'Email', value: 'hello@glowclinic.com', type: 'email' },
                  { label: 'Website', value: 'https://glowclinic.com', type: 'url' },
                  { label: 'Timezone', value: 'Asia/Kolkata (IST)', type: 'select' },
                  { label: 'Address', value: 'Jubilee Hills, Hyderabad, Telangana', type: 'text' },
                  { label: 'GST Number', value: 'GSTIN1234567890', type: 'text' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">{field.label}</label>
                    <input type={field.type} defaultValue={field.value}
                      className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                  </div>
                ))}
              </div>
              <button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Working Hours</h2>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
                  <span className="text-sm text-[var(--color-text)] w-24">{day}</span>
                  <div className="flex items-center gap-3">
                    <input type="time" defaultValue={day === 'Sunday' ? '' : '10:00'} className="px-2 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">to</span>
                    <input type="time" defaultValue={day === 'Sunday' ? '' : '20:00'} className="px-2 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)]" />
                    <div className={cn("w-8 h-4 rounded-full transition-colors relative cursor-pointer", day !== 'Sunday' ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg-tertiary)]")}>
                      <div className={cn("w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all", day !== 'Sunday' ? "left-4.5" : "left-0.5")} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Branding</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Logo</label>
                  <div className="w-24 h-24 border-2 border-dashed border-[var(--color-border)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                    <span className="text-xs text-[var(--color-text-muted)]">Upload</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#7c3aed" className="w-10 h-10 rounded cursor-pointer" />
                    <input type="text" defaultValue="#7c3aed" className="w-32 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] font-mono" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'general' && activeTab !== 'hours' && activeTab !== 'branding' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-3">
                <Globe size={24} className="text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Configuration coming soon</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

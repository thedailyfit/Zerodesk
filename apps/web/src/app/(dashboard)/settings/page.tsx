'use client';

import { motion } from 'framer-motion';
import { Building2, Clock, Globe, Palette, CreditCard, Shield, Bell, Key, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChatWidget } from '@/components/widget/chat-widget';

const tabs = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'widget', label: 'Web Chatbot', icon: MessageSquare },
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

          {activeTab === 'widget' && (
            <WidgetSettingsView />
          )}

          {activeTab !== 'general' && activeTab !== 'hours' && activeTab !== 'branding' && activeTab !== 'widget' && (
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

const TONE_OPTIONS = [
  { id: 'empathetic', label: 'Empathetic & Caring', desc: 'Warm, compassionate tone ideal for clinics and healthcare.', icon: '❤️' },
  { id: 'professional', label: 'Professional & Formal', desc: 'Polished, executive tone for corporate & law services.', icon: '💼' },
  { id: 'friendly', label: 'Friendly & Casual', desc: 'Approachable, relaxed tone for local businesses & retail.', icon: '😊' },
  { id: 'enthusiastic', label: 'Enthusiastic & Upbeat', desc: 'High-energy, exciting tone for fitness & events.', icon: '🌟' },
  { id: 'direct', label: 'Direct & Concise', desc: 'Short, clear responses without fluff.', icon: '⚡' },
  { id: 'humorous', label: 'Humorous & Witty', desc: 'Playful, light-hearted tone with subtle humor.', icon: '😄' },
];

function WidgetSettingsView() {
  const [botName, setBotName] = useState('Glow AI Assistant');
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [selectedTone, setSelectedTone] = useState('empathetic');
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- ZeroDesk AI Chatbot -->
<script 
  src="https://zerodesk.up.railway.app/widget.js" 
  data-tenant-id="glow-clinic-uuid" 
  data-bot-name="${botName}"
  data-tone="${selectedTone}"
  data-color="${primaryColor}"
  defer>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span>Web Chatbot Widget</span>
          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">Live Customizer</span>
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Customize your AI chatbot's personality, branding, and name. Changes apply in real-time to your embedded website widget.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bot Name & Identity */}
          <div className="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Bot Identity & Name
            </h3>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">Custom Assistant Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. Glow Medical AI"
                className="w-full px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium transition-all"
              />
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">This name is shown at the top of the chat window to your website visitors.</p>
            </div>
          </div>

          {/* Tone Selector (6 Modes) */}
          <div className="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                AI Conversation Tone (Personality)
              </h3>
              <span className="text-xs text-purple-400 font-mono">6 Modes</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONE_OPTIONS.map((tone) => {
                const isSelected = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between group",
                      isSelected
                        ? "bg-purple-600/10 border-purple-500 text-white shadow-[var(--shadow-glow)]"
                        : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        <span>{tone.icon}</span>
                        {tone.label}
                      </span>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                      {tone.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Color Customizer */}
          <div className="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Primary Theme Color
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-36 px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <div className="flex gap-2 ml-auto">
                {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Embed Code Snippet */}
          <div className="space-y-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Website Embed Snippet</h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-[#1a1b26] text-[#a9b1d6] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-slate-800 leading-relaxed">
              <code>{embedCode}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: Live Interactive Chatbot Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Interactive Preview
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">Test replies live!</span>
            </div>
            
            {/* Embedded ChatWidget preview */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-800">
              <ChatWidget
                botName={botName}
                primaryColor={primaryColor}
                tone={selectedTone}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


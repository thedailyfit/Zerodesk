'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Clock, 
  Globe, 
  Palette, 
  CreditCard, 
  Shield, 
  Bell, 
  Key, 
  MessageSquare,
  Phone,
  MessageCircle,
  Upload,
  Check,
  Power,
  Sparkles,
  User,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatWidget } from '@/components/widget/chat-widget';

const tabs = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'widget', label: 'Web Chatbot AI', icon: MessageSquare },
  { id: 'voice_ai', label: 'Voice AI Settings', icon: Phone },
  { id: 'whatsapp_ai', label: 'WhatsApp AI Settings', icon: MessageCircle },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');

  // Business Profile State (Branding merged into Business Profile)
  const [businessName, setBusinessName] = useState('Glow Skin & Hair Clinic');
  const [industry, setIndustry] = useState('Skin & Hair Clinic');
  const [phone, setPhone] = useState('+91 40 1234 5678');
  const [email, setEmail] = useState('hello@glowclinic.com');
  const [website, setWebsite] = useState('https://glowclinic.com');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [address, setAddress] = useState('Jubilee Hills, Hyderabad, Telangana');
  const [gstNumber, setGstNumber] = useState('GSTIN1234567890');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Working Hours State (Interactive Day-by-Day ON/OFF toggles)
  const [workingDays, setWorkingDays] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({
    Monday: { enabled: true, start: '10:00', end: '20:00' },
    Tuesday: { enabled: true, start: '10:00', end: '20:00' },
    Wednesday: { enabled: true, start: '10:00', end: '20:00' },
    Thursday: { enabled: true, start: '10:00', end: '20:00' },
    Friday: { enabled: true, start: '10:00', end: '20:00' },
    Saturday: { enabled: true, start: '10:00', end: '18:00' },
    Sunday: { enabled: false, start: '10:00', end: '16:00' },
  });

  // Feature Toggle States
  const [isWebchatEnabled, setIsWebchatEnabled] = useState(true);
  const [isVoiceAiEnabled, setIsVoiceAiEnabled] = useState(true);
  const [isWhatsappAiEnabled, setIsWhatsappAiEnabled] = useState(true);

  // Voice AI Settings State
  const [voiceGender, setVoiceGender] = useState('female_rachel');
  const [voiceLanguage, setVoiceLanguage] = useState('en_hi');
  const [voicePersonality, setVoicePersonality] = useState('doctor_assistant');

  // WhatsApp AI Settings State
  const [waNumber, setWaNumber] = useState('+91 98765 43210');
  const [waDelay, setWaDelay] = useState('2');
  const [waHandoffKeywords, setWaHandoffKeywords] = useState('doctor, emergency, refund, speak to human');

  // Logo File Reader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your business profile, working hours, branding, and AI channel feature toggles.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-56 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left border",
                  isActive
                    ? "bg-purple-600/10 border-purple-500 text-purple-300 font-semibold shadow-sm"
                    : "bg-[var(--color-surface)] border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                )}
              >
                <Icon size={16} className={isActive ? "text-purple-400" : "text-[var(--color-text-muted)]"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-xl min-h-[500px]"
        >
          {/* TAB 1: Business Profile (With Branding merged) */}
          {activeTab === 'business' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Business Profile & Branding</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Mandatory business details and logo customization.</p>
                </div>
                {savedSuccess && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Check size={14} /> Changes Saved!
                  </span>
                )}
              </div>

              {/* Mandatory Fields Note */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-purple-400" />
                <span>All profile fields below are <strong>mandatory</strong> to ensure proper AI response routing, except GST Number which is optional.</span>
              </div>

              {/* Branding Section (Merged) */}
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <Palette size={16} className="text-purple-400" />
                  Clinic Branding & Identity
                </h3>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Clinic Logo *</label>
                    <label className="w-24 h-24 border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--color-bg)] overflow-hidden relative group">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-center p-2">
                          <Upload size={20} className="text-purple-400 mb-1" />
                          <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Upload Logo</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)]">Primary Brand Theme Color *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-32 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs font-mono text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Mandatory Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Business / Clinic Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Industry / Category *</label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Primary Timezone *</label>
                  <input
                    type="text"
                    required
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Save Business Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Working Hours (Interactive ON/OFF Toggles Fixed!) */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">Working Hours Schedule</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Toggle each day ON or OFF independently to set AI appointment availability windows.
                </p>
              </div>

              <div className="space-y-3">
                {Object.keys(workingDays).map((day) => {
                  const item = workingDays[day];
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-xl border transition-all",
                        item.enabled
                          ? "bg-[var(--color-surface)] border-[var(--color-border)]"
                          : "bg-slate-950/40 border-slate-800/60 opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3 w-32">
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer border",
                            item.enabled ? "bg-purple-600 border-purple-500" : "bg-slate-800 border-slate-700"
                          )}
                        >
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded-full bg-white transition-transform shadow",
                              item.enabled ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                        <span className="text-xs font-semibold text-[var(--color-text)]">{day}</span>
                      </div>

                      {item.enabled ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={item.start}
                            onChange={(e) => setWorkingDays(prev => ({
                              ...prev,
                              [day]: { ...prev[day], start: e.target.value }
                            }))}
                            className="px-2.5 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)]"
                          />
                          <span className="text-xs text-[var(--color-text-muted)]">to</span>
                          <input
                            type="time"
                            value={item.end}
                            onChange={(e) => setWorkingDays(prev => ({
                              ...prev,
                              [day]: { ...prev[day], end: e.target.value }
                            }))}
                            className="px-2.5 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text)]"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-red-400 font-semibold px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                          Closed / Off
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Web Chatbot AI (With ON/OFF Toggle) */}
          {activeTab === 'widget' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">ZeroDesk Webchat AI Feature</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Embeddable web widget configuration & ON/OFF master toggle.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWebchatEnabled(!isWebchatEnabled)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow",
                    isWebchatEnabled
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                      : "bg-red-600 hover:bg-red-500 text-white border-red-500"
                  )}
                >
                  <Power size={14} />
                  <span>{isWebchatEnabled ? 'WEBCHAT AI ON' : 'WEBCHAT AI OFF'}</span>
                </button>
              </div>

              {!isWebchatEnabled ? (
                <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                  <Power size={32} className="mx-auto text-red-400" />
                  <h3 className="text-sm font-bold text-red-300">Webchat AI Feature Disabling</h3>
                  <p className="text-xs text-slate-400">When OFF, the floating chat widget will not load on your clinic website.</p>
                </div>
              ) : (
                <WidgetSettingsView />
              )}
            </div>
          )}

          {/* TAB 4: Voice AI Settings (New Subpage) */}
          {activeTab === 'voice_ai' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Phone size={20} className="text-purple-400" />
                    Voice AI Subpage Settings
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Configure phone call AI features, voice character gender, and preferred languages.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoiceAiEnabled(!isVoiceAiEnabled)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow",
                    isVoiceAiEnabled
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                      : "bg-red-600 hover:bg-red-500 text-white border-red-500"
                  )}
                >
                  <Power size={14} />
                  <span>{isVoiceAiEnabled ? 'VOICE AI ON' : 'VOICE AI OFF'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Voice Character Selection */}
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3">
                  <label className="block text-xs font-semibold text-[var(--color-text)]">Preferred Voice Character (Male / Female)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'female_rachel', name: 'Rachel (Female)', desc: 'Empathetic, warm, ideal for clinics & care.', icon: '👩' },
                      { id: 'male_marcus', name: 'Marcus (Male)', desc: 'Professional, confident, ideal for corporate.', icon: '👨' },
                      { id: 'female_sarah', name: 'Sarah (Female)', desc: 'Energetic, fast-paced receptionist voice.', icon: '👩' },
                      { id: 'male_david', name: 'David (Male)', desc: 'Calm, authoritative medical advisor.', icon: '👨' },
                    ].map(vc => (
                      <button
                        key={vc.id}
                        type="button"
                        onClick={() => setVoiceGender(vc.id)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all flex items-center justify-between",
                          voiceGender === vc.id
                            ? "bg-purple-600/10 border-purple-500 text-white"
                            : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                        )}
                      >
                        <div>
                          <p className="text-xs font-bold flex items-center gap-1.5">
                            <span>{vc.icon}</span>
                            {vc.name}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{vc.desc}</p>
                        </div>
                        {voiceGender === vc.id && <Check size={14} className="text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Language Picker */}
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3">
                  <label className="block text-xs font-semibold text-[var(--color-text)]">Primary Voice AI Language</label>
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                  >
                    <option value="en_hi">English & Hindi (Bi-lingual)</option>
                    <option value="en">English (US / UK / India)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="es">Spanish (Español)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WhatsApp AI Settings (New Subpage) */}
          {activeTab === 'whatsapp_ai' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                    <MessageCircle size={20} className="text-emerald-400" />
                    WhatsApp AI Subpage Settings
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">WhatsApp Business API phone configuration & auto-reply handoff rules.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWhatsappAiEnabled(!isWhatsappAiEnabled)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow",
                    isWhatsappAiEnabled
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                      : "bg-red-600 hover:bg-red-500 text-white border-red-500"
                  )}
                >
                  <Power size={14} />
                  <span>{isWhatsappAiEnabled ? 'WHATSAPP AI ON' : 'WHATSAPP AI OFF'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">WhatsApp Business Phone Number</label>
                  <input
                    type="tel"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Response Delay (Seconds)</label>
                  <input
                    type="number"
                    value={waDelay}
                    onChange={(e) => setWaDelay(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] font-mono"
                  />
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Short delay makes AI replies feel natural.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Human Handoff Trigger Keywords</label>
                  <input
                    type="text"
                    value={waHandoffKeywords}
                    onChange={(e) => setWaHandoffKeywords(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                  />
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">If patient types any of these words, WhatsApp AI pauses and alerts clinic receptionist on staff dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for remaining tabs */}
          {activeTab !== 'business' && activeTab !== 'hours' && activeTab !== 'widget' && activeTab !== 'voice_ai' && activeTab !== 'whatsapp_ai' && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                <Globe size={24} className="text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Configuration settings active and synced.</p>
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
  src="https://zerodesk-api-production.up.railway.app/widget.js" 
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Bot Identity & Custom Name
            </h3>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">Assistant Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. Glow Medical AI"
                className="w-full px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                AI Conversation Tone (6 Modes)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONE_OPTIONS.map((tone) => {
                const isSelected = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between group",
                      isSelected
                        ? "bg-purple-600/10 border-purple-500 text-white"
                        : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        <span>{tone.icon}</span>
                        {tone.label}
                      </span>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{tone.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embed Code Snippet */}
          <div className="space-y-3 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[var(--color-text)]">Website Embed Snippet</h3>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-[#1a1b26] text-[#a9b1d6] p-3.5 rounded-lg overflow-x-auto text-[11px] font-mono border border-slate-800 leading-relaxed">
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
            </div>
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

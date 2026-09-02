'use client';

import { useState, useMemo } from 'react';
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
  AlertCircle, 
  PhoneForwarded, 
  Eye, 
  EyeOff, 
  Loader2, 
  Volume2,
  Mail,
  HeartHandshake,
  HelpCircle,
  XCircle,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatWidget } from '@/components/widget/chat-widget';
import { useSuperAdminStore } from '@/lib/superadmin-store';

const tabs = [
  { id: 'business', label: 'Business Profile', icon: Building2 },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'widget', label: 'Web Chatbot AI', icon: MessageSquare },
  { id: 'voice_ai', label: 'Voice AI Settings', icon: Phone },
  { id: 'whatsapp_ai', label: 'WhatsApp AI Settings', icon: MessageCircle },
  { id: 'handoff', label: 'Human Handoffs', icon: PhoneForwarded },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Keys', icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const { voices, llmModels, tenants, impersonatedTenantId } = useSuperAdminStore();

  const currentTenant = useMemo(() => {
    if (impersonatedTenantId) {
      return tenants.find((t: any) => t.id === impersonatedTenantId) || tenants[0];
    }
    return tenants[0];
  }, [tenants, impersonatedTenantId]);

  const availableVoices = useMemo(() => {
    if (!currentTenant) return voices.filter((v: any) => v.isActive);
    return voices.filter((v: any) => 
      v.isActive && (currentTenant.allowedVoiceIds?.includes(v.id) || currentTenant.allowedVoiceIds?.length === 0)
    );
  }, [voices, currentTenant]);

  const assignedLlm = useMemo(() => {
    if (!currentTenant) return llmModels[0];
    return llmModels.find((m: any) => m.id === currentTenant.assignedLlmId) || llmModels[0];
  }, [llmModels, currentTenant]);

  const assignedFallbackLlm = useMemo(() => {
    if (!currentTenant || !currentTenant.assignedFallbackLlmId) return null;
    return llmModels.find((m: any) => m.id === currentTenant.assignedFallbackLlmId) || null;
  }, [llmModels, currentTenant]);

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
  const [isHandoffEnabled, setIsHandoffEnabled] = useState(true);

  // Voice AI Settings State
  const [voiceGender, setVoiceGender] = useState('female_rachel');
  const [voiceLanguage, setVoiceLanguage] = useState('en_hi');

  // WhatsApp AI Settings State
  const [waNumber, setWaNumber] = useState('+91 98765 43210');
  const [waDelay, setWaDelay] = useState('2');
  const [waHandoffKeywords, setWaHandoffKeywords] = useState('doctor, emergency, refund, speak to human');
  const [waVerified, setWaVerified] = useState<boolean | null>(null);
  const [waVerifying, setWaVerifying] = useState(false);

  // Handoff State
  const [handoffVoice, setHandoffVoice] = useState('+91 98765 43210');
  const [handoffWa, setHandoffWa] = useState('+91 98765 43210');
  const [handoffWeb, setHandoffWeb] = useState('support@glowclinic.com');
  const [handoffVoiceEnabled, setHandoffVoiceEnabled] = useState(true);
  const [handoffWaEnabled, setHandoffWaEnabled] = useState(true);
  const [handoffWebEnabled, setHandoffWebEnabled] = useState(true);

  // Billing State
  const [gstRate, setGstRate] = useState('18%');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [paymentMethods, setPaymentMethods] = useState({ cash: true, card: true, upi: true, insurance: false });
  const [bankUpi, setBankUpi] = useState('glowclinic@okicici');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for choosing Glow Skin & Hair Clinic. Terms & Conditions apply.');

  // Retention & Churn Cancellation Funnel State
  const [showCancelFunnel, setShowCancelFunnel] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedChurnReason, setSelectedChurnReason] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [subscriptionPaused, setSubscriptionPaused] = useState(false);
  const [discountClaimed, setDiscountClaimed] = useState(false);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);

  // Security State
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30min');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [passwordPolicy, setPasswordPolicy] = useState('Strong');

  // Notifications State
  const [notifSettings, setNotifSettings] = useState({
    appointment: { inApp: true, email: true, whatsapp: true },
    missedCall: { inApp: true, email: true, whatsapp: true },
    lead: { inApp: true, email: true },
    payment: { inApp: true, email: true, whatsapp: true },
    leave: { inApp: true, email: true },
    lowBalance: { inApp: true, email: true, sms: true },
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState({
    openai: 'sk-proj-xxxxxxxxxxxx',
    deepgram: 'dg-xxxxxxxxxxxx',
    elevenlabs: 'el-xxxxxxxxxxxx',
    twilioSid: 'ACxxxxxxxxxxxx',
    twilioToken: 'xxxxxxxxxxxx',
    waToken: 'EAxxxxxxxxxxxx',
    waPhoneId: '1234567890',
    waBizId: '0987654321',
    metaBizId: '',
    metaAdId: '',
    metaToken: '',
    googleAds: '',
    sentry: '',
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [verifyingKeys, setVerifyingKeys] = useState<Record<string, boolean>>({});
  const [verifiedKeys, setVerifiedKeys] = useState<Record<string, boolean>>({});

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

  const verifyWa = () => {
    setWaVerifying(true);
    setTimeout(() => {
      setWaVerifying(false);
      setWaVerified(true); // Simulate success
    }, 1500);
  };

  const verifyKey = (key: string) => {
    setVerifyingKeys(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setVerifyingKeys(prev => ({ ...prev, [key]: false }));
      setVerifiedKeys(prev => ({ ...prev, [key]: true })); // Simulate success
    }, 1500);
  };

  const toggleNotif = (event: keyof typeof notifSettings, channel: keyof (typeof notifSettings)[keyof typeof notifSettings]) => {
    setNotifSettings(prev => ({
      ...prev,
      [event]: {
        ...prev[event],
        [channel]: !(prev[event] as any)[channel]
      }
    }));
  };

  const renderApiKeyField = (id: string, label: string, desc: string, valueKey: keyof typeof apiKeys) => (
    <div className="space-y-2 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <label className="text-sm font-semibold text-[var(--color-text)]">{label}</label>
          <p className="text-[10px] text-[var(--color-text-muted)]">{desc}</p>
        </div>
        <div className="flex items-center gap-2">
          {verifiedKeys[id] !== undefined && (
            <span className={cn("text-[10px] font-medium px-2 py-1 rounded-full", verifiedKeys[id] ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              {verifiedKeys[id] ? '✓ Connected' : '✗ Not Connected'}
            </span>
          )}
          <button
            type="button"
            onClick={() => verifyKey(id)}
            disabled={verifyingKeys[id]}
            className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-bold transition-all border border-blue-500/20 flex items-center gap-1 disabled:opacity-50"
          >
            {verifyingKeys[id] ? <Loader2 size={12} className="animate-spin" /> : null}
            Verify Connection
          </button>
        </div>
      </div>
      <div className="relative">
        <input
          type={showKeys[id] ? 'text' : 'password'}
          value={apiKeys[valueKey]}
          onChange={(e) => setApiKeys(prev => ({ ...prev, [valueKey]: e.target.value }))}
          className="w-full px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] pr-10 font-mono"
        />
        <button
          type="button"
          onClick={() => setShowKeys(prev => ({ ...prev, [id]: !prev[id] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          {showKeys[id] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

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
                    ? "bg-blue-600/10 border-blue-500 text-blue-300 font-semibold shadow-sm"
                    : "bg-[var(--color-surface)] border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
                )}
              >
                <Icon size={16} className={isActive ? "text-blue-400" : "text-[var(--color-text-muted)]"} />
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
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-blue-400" />
                <span>All profile fields below are <strong>mandatory</strong> to ensure proper AI response routing, except GST Number which is optional.</span>
              </div>

              {/* Branding Section (Merged) */}
              <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                  <Palette size={16} className="text-blue-400" />
                  Clinic Branding & Identity
                </h3>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Clinic Logo *</label>
                    <label className="w-24 h-24 border-2 border-dashed border-blue-500/40 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all bg-[var(--color-bg)] overflow-hidden relative group">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-center p-2">
                          <Upload size={20} className="text-blue-400 mb-1" />
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
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Industry / Category *</label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Phone *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Primary Timezone *</label>
                  <input
                    type="text"
                    required
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Clinic Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Save Business Profile
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Working Hours */}
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
                            item.enabled ? "bg-blue-600 border-blue-500" : "bg-slate-800 border-slate-700"
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

          {/* TAB 3: Web Chatbot AI */}
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

          {/* TAB 4: Voice AI Settings */}
          {activeTab === 'voice_ai' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Phone size={20} className="text-blue-400" />
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
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">Linked Phone Number</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-mono">{phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">✓ Verified</span>
                       <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Provider: Twilio</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] rounded-lg text-xs font-semibold text-[var(--color-text)] transition-colors">
                    Test Call
                  </button>
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

                {/* Dynamic Voice AI Personas from Super Admin Registry */}
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text)] flex items-center gap-2">
                        <Volume2 size={16} className="text-blue-400" />
                        <span>Voice AI Persona (Centrally Curated by Admin)</span>
                      </label>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        High-definition text-to-speech voice models synced from ZeroDesk Super Admin Fleet.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      LiveFleet Synced
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {availableVoices.map((voice: any) => {
                      const isSelected = voiceGender === voice.id || (voice.isDefault && !voiceGender);
                      return (
                        <div
                          key={voice.id}
                          onClick={() => setVoiceGender(voice.id)}
                          className={cn(
                            "p-3.5 rounded-xl border cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between",
                            isSelected
                              ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10"
                              : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-slate-600"
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-xs text-[var(--color-text)]">{voice.name}</span>
                              {isSelected && <Check size={14} className="text-blue-500" />}
                            </div>
                            <div className="text-[10px] text-[var(--color-text-muted)] font-mono mb-2">
                              {voice.provider.toUpperCase()} • {voice.language} • {voice.gender}
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] italic line-clamp-2">
                              "{voice.sampleText}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned LLM Engine Info Card */}
                <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex flex-col gap-4">
                  {/* Primary LLM */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="text-xs font-semibold text-[var(--color-text)]">Active AI Reasoning Engine</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                          Managed by Admin
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        Your voice receptionist is powered by an enterprise LLM router.
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs text-[var(--color-text)] font-semibold bg-[var(--color-bg)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-sm">
                      {assignedLlm?.name || 'Unknown Model'} ({assignedLlm?.provider?.toUpperCase()})
                    </div>
                  </div>

                  {/* Fallback LLM */}
                  {assignedFallbackLlm && (
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-amber-400" />
                          <span className="text-xs font-semibold text-[var(--color-text)]">Secondary AI Engine (Fallback)</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                            Auto-Failover
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          Takes over seamlessly if the primary reasoning engine experiences downtime.
                        </p>
                      </div>
                      <div className="text-right font-mono text-xs text-[var(--color-text)] font-semibold bg-[var(--color-bg)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] shadow-sm">
                        {assignedFallbackLlm.name} ({assignedFallbackLlm.provider.toUpperCase()})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WhatsApp AI Settings */}
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
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={verifyWa}
                      disabled={waVerifying}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                    >
                      {waVerifying ? <Loader2 size={14} className="animate-spin" /> : 'Verify Connection'}
                    </button>
                  </div>
                  {waVerified !== null && (
                    <div className="mt-2">
                      {waVerified ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-medium inline-flex items-center gap-1">
                          <Check size={14} /> WhatsApp AI Connected & Active
                        </span>
                      ) : (
                         <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-medium inline-flex items-center gap-1">
                          ✗ Connection Failed
                        </span>
                      )}
                    </div>
                  )}
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

          {/* TAB 6: Human Handoffs */}
          {activeTab === 'handoff' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                 <div>
                   <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                     <PhoneForwarded size={20} className="text-blue-400" />
                     Human Handoffs
                   </h2>
                   <p className="text-xs text-[var(--color-text-muted)] mt-0.5">When a customer says &quot;talk to a human&quot; or &quot;connect me to someone&quot;, the AI will transfer the conversation to these numbers.</p>
                 </div>
                 
                 <button
                  type="button"
                  onClick={() => setIsHandoffEnabled(!isHandoffEnabled)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow",
                    isHandoffEnabled
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                      : "bg-red-600 hover:bg-red-500 text-white border-red-500"
                  )}
                >
                  <Power size={14} />
                  <span>{isHandoffEnabled ? 'HANDOFF ON' : 'HANDOFF OFF'}</span>
                </button>
               </div>

               <div className="space-y-4">
                 <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Voice AI Human Handoff Number</label>
                      <input
                        type="tel"
                        value={handoffVoice}
                        onChange={(e) => setHandoffVoice(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setHandoffVoiceEnabled(!handoffVoiceEnabled)}
                      className={cn("mt-5 px-3 py-1.5 rounded text-xs font-bold border transition-colors", handoffVoiceEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-red-500/10 text-red-500 border-red-500/30")}
                    >
                      {handoffVoiceEnabled ? 'ON' : 'OFF'}
                    </button>
                 </div>
                 <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">WhatsApp Human Handoff Number</label>
                      <input
                        type="tel"
                        value={handoffWa}
                        onChange={(e) => setHandoffWa(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setHandoffWaEnabled(!handoffWaEnabled)}
                      className={cn("mt-5 px-3 py-1.5 rounded text-xs font-bold border transition-colors", handoffWaEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-red-500/10 text-red-500 border-red-500/30")}
                    >
                      {handoffWaEnabled ? 'ON' : 'OFF'}
                    </button>
                 </div>
                 <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">WebChat Escalation Email/Phone</label>
                      <input
                        type="text"
                        value={handoffWeb}
                        onChange={(e) => setHandoffWeb(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setHandoffWebEnabled(!handoffWebEnabled)}
                      className={cn("mt-5 px-3 py-1.5 rounded text-xs font-bold border transition-colors", handoffWebEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-red-500/10 text-red-500 border-red-500/30")}
                    >
                      {handoffWebEnabled ? 'ON' : 'OFF'}
                    </button>
                 </div>
               </div>
             </div>
          )}

          {/* TAB 7: Billing */}
          {activeTab === 'billing' && (
             <div className="space-y-6">
                <div className="border-b border-[var(--color-border)] pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                       <CreditCard size={20} className="text-orange-400" />
                       Plan & Billing Settings
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Manage subscription status, invoice configuration, and payment methods.</p>
                  </div>
                </div>

                {/* Active Subscription Tier Overview */}
                <div className="p-5 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-500/30 rounded-2xl relative overflow-hidden shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                          {(currentTenant as any)?.subscriptionTier || (currentTenant as any)?.plan || 'PRO PLAN'}
                        </span>
                        {subscriptionPaused && (
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            PAUSED UNTIL NEXT MONTH
                          </span>
                        )}
                        {discountClaimed && (
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            50% RETENTION DISCOUNT ACTIVE
                          </span>
                        )}
                        {subscriptionCancelled && (
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                            CANCELLATION SCHEDULED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[var(--color-text)]">ZeroDesk Enterprise AI Suite</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        Unlimited LiveKit Voice calls, Sarvam AI Indian Speech recognition, and WhatsApp Cloud sync.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCancelFunnel(true);
                          setCancelStep(1);
                        }}
                        className="px-3.5 py-2 bg-slate-800/80 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl text-xs font-semibold transition-all"
                      >
                        Cancel Plan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cancellation & Churn Retention Funnel Modal */}
                {showCancelFunnel && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 text-[var(--color-text)]">
                      
                      {/* Step 1: Reason Survey */}
                      {cancelStep === 1 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div>
                              <h3 className="text-base font-bold text-white">We're sorry to see you go</h3>
                              <p className="text-xs text-slate-400 mt-0.5">What is the main reason for canceling?</p>
                            </div>
                            <button onClick={() => setShowCancelFunnel(false)} className="text-slate-400 hover:text-white">
                              <XCircle size={20} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            {[
                              { id: 'budget', label: 'Pricing is too high / Budget constraints' },
                              { id: 'tech', label: 'Technical difficulty setting up phone/WhatsApp' },
                              { id: 'features', label: 'Missing key features or integrations' },
                              { id: 'temporary', label: 'Seasonal business / Temporary pause' },
                              { id: 'other', label: 'Other reasons' },
                            ].map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedChurnReason(item.id)}
                                className={cn(
                                  "w-full text-left p-3 rounded-xl border text-xs font-medium transition-all",
                                  selectedChurnReason === item.id
                                    ? "bg-blue-600/20 border-blue-500 text-white"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                                )}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowCancelFunnel(false)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                            >
                              Nevermind, Keep My Plan
                            </button>
                            <button
                              type="button"
                              disabled={!selectedChurnReason}
                              onClick={() => setCancelStep(2)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold rounded-lg text-white"
                            >
                              Continue
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Offer Pause (Lock-in Price) */}
                      {cancelStep === 2 && (
                        <div className="space-y-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                            <Clock size={24} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">How about a quick break instead?</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              Pause your subscription for <strong>1 month</strong>. You will not be billed, your AI knowledge base & phone configs will stay saved, and you will lock in your current discount rate.
                            </p>
                          </div>

                          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-left text-xs space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle2 size={16} /> <span>Keep your trained voice persona & numbers saved</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle2 size={16} /> <span>$0 charged during the pause duration</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle2 size={16} /> <span>Auto-resumes automatically with 1-click extension</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSubscriptionPaused(true);
                                setShowCancelFunnel(false);
                              }}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg"
                            >
                              Pause for 1 Month (Keep Everything Saved)
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancelStep(3)}
                              className="text-xs text-slate-500 hover:text-slate-300 py-1 font-medium"
                            >
                              No thanks, I still want to cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Offer 50% Off Discount */}
                      {cancelStep === 3 && (
                        <div className="space-y-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                            <HeartHandshake size={24} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Exclusive 50% Off for 2 Months</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              We want to support your clinic/business growth. Claim 50% off your next 2 billing cycles right now.
                            </p>
                          </div>

                          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center">
                            <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">50% OFF</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Applied immediately to next month's invoice</div>
                          </div>

                          <div className="flex flex-col gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDiscountClaimed(true);
                                setShowCancelFunnel(false);
                              }}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
                            >
                              Claim 50% Off & Stay
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancelStep(4)}
                              className="text-xs text-slate-500 hover:text-slate-300 py-1 font-medium"
                            >
                              Decline Offer & Proceed to Final Step
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Final Confirmation & VIP Support Link */}
                      {cancelStep === 4 && (
                        <div className="space-y-4">
                          <div className="border-b border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-red-400">Final Cancellation Confirmation</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Your access will remain active until the end of your billing cycle.
                            </p>
                          </div>

                          <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                              <HelpCircle size={16} /> Need help setting up your phone lines?
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              Our engineering team will jump on a complimentary 20-minute Zoom screen-share to connect your WhatsApp and phone routing for you.
                            </p>
                            <a
                              href="https://cal.com/zerodesk/vip-support"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block text-xs text-blue-400 underline font-bold hover:text-blue-300 mt-1"
                            >
                              Book Free 20-Min Setup Call →
                            </a>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowCancelFunnel(false)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                            >
                              Keep Plan
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSubscriptionCancelled(true);
                                setShowCancelFunnel(false);
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-bold rounded-lg text-white"
                            >
                              Confirm Cancellation
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Default GST Rate</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                    >
                      <option value="0%">0%</option>
                      <option value="5%">5%</option>
                      <option value="12%">12%</option>
                      <option value="18%">18%</option>
                      <option value="28%">28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Invoice Number Prefix</label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                      placeholder="e.g. INV-2026-"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Accepted Payment Methods</label>
                    <div className="flex flex-wrap gap-4">
                      {['cash', 'card', 'upi', 'insurance'].map((method) => (
                        <label key={method} className="flex items-center gap-2 cursor-pointer">
                           <input
                             type="checkbox"
                             checked={paymentMethods[method as keyof typeof paymentMethods]}
                             onChange={() => setPaymentMethods(p => ({ ...p, [method]: !p[method as keyof typeof paymentMethods] }))}
                             className="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500"
                           />
                           <span className="text-sm text-[var(--color-text)] capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Bank Account / UPI ID for QR</label>
                    <input
                      type="text"
                      value={bankUpi}
                      onChange={(e) => setBankUpi(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                      placeholder="e.g. yourbusiness@okicici"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Invoice Footer Text (Terms)</label>
                    <textarea
                      value={invoiceFooter}
                      onChange={(e) => setInvoiceFooter(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] min-h-[80px]"
                    />
                  </div>
                </div>
             </div>
          )}

          {/* TAB 8: Security */}
          {activeTab === 'security' && (
             <div className="space-y-6">
               <div className="border-b border-[var(--color-border)] pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                     <Shield size={20} className="text-red-400" />
                     Security Settings
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Protect your account and monitor active sessions.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-between">
                     <div>
                       <h3 className="text-sm font-semibold text-[var(--color-text)]">Two-Factor Authentication</h3>
                       <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Require 2FA via email on login</p>
                     </div>
                     <button
                      type="button"
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", twoFactor ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-500/20 text-slate-400")}
                     >
                      {twoFactor ? 'ON' : 'OFF'}
                     </button>
                  </div>
                  <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                     <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Session Timeout</label>
                     <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                     >
                       <option value="15min">15 Minutes</option>
                       <option value="30min">30 Minutes</option>
                       <option value="1hr">1 Hour</option>
                       <option value="2hr">2 Hours</option>
                       <option value="4hr">4 Hours</option>
                     </select>
                  </div>
                  <div className="md:col-span-2 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                     <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">IP Whitelist (One per line)</label>
                     <textarea
                        value={ipWhitelist}
                        onChange={(e) => setIpWhitelist(e.target.value)}
                        placeholder="Leave blank to allow all IPs"
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)] min-h-[80px]"
                     />
                  </div>
                  <div className="md:col-span-2 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                     <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Password Policy</label>
                     <select
                        value={passwordPolicy}
                        onChange={(e) => setPasswordPolicy(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text)]"
                     >
                       <option value="Standard">Standard (Min 8 chars, 1 number)</option>
                       <option value="Strong">Strong (Min 10 chars, 1 number, 1 symbol)</option>
                       <option value="Very Strong">Very Strong (Min 12 chars, mixed case, number, symbol)</option>
                     </select>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Recent Login History</h3>
                  <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                     <table className="w-full text-left text-xs text-[var(--color-text)]">
                       <thead className="bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                         <tr>
                           <th className="px-4 py-2">Date & Time</th>
                           <th className="px-4 py-2">IP Address</th>
                           <th className="px-4 py-2">Device</th>
                           <th className="px-4 py-2">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-[var(--color-border)]">
                         <tr><td className="px-4 py-2">Today, 10:45 AM</td><td className="px-4 py-2">192.168.1.1</td><td className="px-4 py-2">Chrome / Windows</td><td className="px-4 py-2 text-emerald-400">Success</td></tr>
                         <tr><td className="px-4 py-2">Yesterday, 4:20 PM</td><td className="px-4 py-2">115.240.x.x</td><td className="px-4 py-2">Safari / iOS</td><td className="px-4 py-2 text-emerald-400">Success</td></tr>
                         <tr><td className="px-4 py-2">Yesterday, 4:18 PM</td><td className="px-4 py-2">115.240.x.x</td><td className="px-4 py-2">Safari / iOS</td><td className="px-4 py-2 text-red-400">Failed</td></tr>
                         <tr><td className="px-4 py-2">Aug 15, 09:00 AM</td><td className="px-4 py-2">192.168.1.1</td><td className="px-4 py-2">Firefox / macOS</td><td className="px-4 py-2 text-emerald-400">Success</td></tr>
                         <tr><td className="px-4 py-2">Aug 14, 06:30 PM</td><td className="px-4 py-2">192.168.1.1</td><td className="px-4 py-2">Chrome / Windows</td><td className="px-4 py-2 text-emerald-400">Success</td></tr>
                       </tbody>
                     </table>
                  </div>
                </div>
             </div>
          )}

          {/* TAB 9: Notifications */}
          {activeTab === 'notifications' && (
             <div className="space-y-6">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                     <Bell size={20} className="text-yellow-400" />
                     Notifications
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Control how and when you receive alerts for key events.</p>
                </div>
                
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                   <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-muted)]">
                      <div className="col-span-6">Event</div>
                      <div className="col-span-2 text-center">In-App</div>
                      <div className="col-span-2 text-center">Email</div>
                      <div className="col-span-2 text-center">WhatsApp/SMS</div>
                   </div>
                   
                   {[
                     { id: 'appointment', label: 'New Appointment Booked', channels: ['inApp', 'email', 'whatsapp'] },
                     { id: 'missedCall', label: 'Missed Call Alert', channels: ['inApp', 'email', 'whatsapp'] },
                     { id: 'lead', label: 'New Lead Created', channels: ['inApp', 'email'] },
                     { id: 'payment', label: 'Payment Received', channels: ['inApp', 'email', 'whatsapp'] },
                     { id: 'leave', label: 'Leave Request Submitted', channels: ['inApp', 'email'] },
                     { id: 'lowBalance', label: 'Low Balance Alert', channels: ['inApp', 'email', 'sms'] },
                   ].map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-[var(--color-border)] last:border-0">
                         <div className="col-span-6 text-sm font-medium text-[var(--color-text)]">{item.label}</div>
                         <div className="col-span-2 flex justify-center">
                            {item.channels.includes('inApp') && (
                              <input type="checkbox" checked={(notifSettings as any)[item.id].inApp} onChange={() => toggleNotif(item.id as any, 'inApp')} className="w-4 h-4 rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500" />
                            )}
                         </div>
                         <div className="col-span-2 flex justify-center">
                            {item.channels.includes('email') && (
                              <input type="checkbox" checked={(notifSettings as any)[item.id].email} onChange={() => toggleNotif(item.id as any, 'email')} className="w-4 h-4 rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500" />
                            )}
                         </div>
                         <div className="col-span-2 flex justify-center">
                            {(item.channels.includes('whatsapp') || item.channels.includes('sms')) && (
                              <input type="checkbox" checked={(notifSettings as any)[item.id][item.channels.includes('whatsapp') ? 'whatsapp' : 'sms']} onChange={() => toggleNotif(item.id as any, item.channels.includes('whatsapp') ? 'whatsapp' : 'sms' as any)} className="w-4 h-4 rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500" />
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* TAB 10: API Keys */}
          {activeTab === 'api' && (
             <div className="space-y-6">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                     <Key size={20} className="text-pink-400" />
                     API Keys & Integrations
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Manage connections to third-party services like LLMs, STT, TTS, and telephony providers.</p>
                </div>
                
                <div className="space-y-8">
                  {/* AI Models */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">AI Models & Voice</h3>
                    {renderApiKeyField('openai', 'OpenAI API Key', 'Used for core LLM reasoning & chat completion.', 'openai')}
                    {renderApiKeyField('deepgram', 'Deepgram API Key', 'Used for ultra-fast Speech-to-Text.', 'deepgram')}
                    {renderApiKeyField('elevenlabs', 'ElevenLabs API Key', 'Used for realistic Text-to-Speech generation.', 'elevenlabs')}
                  </div>

                  {/* Telephony & Messaging */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">Telephony & Messaging</h3>
                    {renderApiKeyField('twilioSid', 'Twilio/Exotel Account SID', 'Account SID for phone calls.', 'twilioSid')}
                    {renderApiKeyField('twilioToken', 'Twilio/Exotel Auth Token', 'Auth token for secure API access.', 'twilioToken')}
                    {renderApiKeyField('waToken', 'WhatsApp Cloud API Token', 'System user token for WhatsApp Business API.', 'waToken')}
                    {renderApiKeyField('waPhoneId', 'WhatsApp Phone Number ID', 'Unique ID for your sending phone number.', 'waPhoneId')}
                    {renderApiKeyField('waBizId', 'WhatsApp Business Account ID', 'Your Meta Business Account ID.', 'waBizId')}
                  </div>

                  {/* Marketing & Tracking */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">Meta Ads Integration</h3>
                    {renderApiKeyField('metaBizId', 'Meta Business Account ID', 'Used for Meta Ads Lead syncing.', 'metaBizId')}
                    {renderApiKeyField('metaAdId', 'Ad Account ID', 'Specific Ad Account ID for tracking.', 'metaAdId')}
                    {renderApiKeyField('metaToken', 'System User Access Token', 'Token with leads_retrieval permissions.', 'metaToken')}
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">Other (Optional)</h3>
                     {renderApiKeyField('googleAds', 'Google Ads Customer ID', 'Optional tracking for Google Ads.', 'googleAds')}
                     {renderApiKeyField('sentry', 'Sentry DSN', 'Error tracking and monitoring.', 'sentry')}
                  </div>
                </div>
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
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
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
              <span className="w-2 h-2 rounded-full bg-blue-500" />
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
                        ? "bg-blue-600/10 border-blue-500 text-white"
                        : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        <span>{tone.icon}</span>
                        {tone.label}
                      </span>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent(`ZeroDesk AI Widget Embed Code for ${botName}`);
                    const body = encodeURIComponent(
                      `Hi,\n\nPlease add this AI Chatbot snippet to our website before the closing </body> tag:\n\n${embedCode}\n\nThanks!`
                    );
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Mail size={12} />
                  <span>Email to Developer</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Copy size={12} />
                  <span>{copied ? '✓ Copied!' : 'Copy Code'}</span>
                </button>
              </div>
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

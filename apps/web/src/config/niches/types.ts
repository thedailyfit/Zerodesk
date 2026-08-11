import { 
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone, 
  MessageCircle, Workflow, Settings, FileText, Rocket, Receipt, TrendingUp, CreditCard, 
  CalendarDays, Clock, Shield, IndianRupee, Heart, SmilePlus, Cpu, PhoneIncoming, 
  Megaphone, Activity, Laptop, AlertTriangle,
  type LucideIcon
} from 'lucide-react';

// ============================================================
// CORE TYPE DEFINITIONS
// ============================================================

export type NicheId = 'skin' | 'spa' | 'salon' | 'realestate' | 'dental' | 'hotel';

export interface NicheNavItem {
  name: string;
  href?: string;
  icon?: LucideIcon;
  roles: string[];
  divider?: boolean;
}

export interface NicheKPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface NicheTemplate {
  id: string;
  title: string;
  category: string;
  channel: 'WHATSAPP' | 'VOICE' | 'EMAIL';
  subject?: string;
  content: string;
  mediaAttachment?: 'PDF' | 'IMAGE' | 'VIDEO' | 'NONE';
  isPreinstalled: boolean;
  variables: string[];
}

export interface NicheKBDoc {
  id: string;
  title: string;
  category: 'SERVICE' | 'PRICING' | 'FAQ' | 'SOP' | 'SCRIPTS' | 'RESTRICTED_GUIDELINES';
  content: string;
  chunks: number;
  isActive: boolean;
  updatedAt: string;
}

export interface NicheAutomationPreset {
  title: string;
  trigger: string;
  desc: string;
  category: string;
}

export interface NicheWorkflow {
  id: string;
  name: string;
  triggerEvent: string;
  description: string;
  steps: { type: 'TRIGGER' | 'CONDITION' | 'ACTION'; label: string; detail: string }[];
  actionsCount: number;
  isActive: boolean;
  lastRun: string;
  runs24h: number;
  category: string;
}

export interface NicheTone {
  id: string;
  name: string;
  badge: string;
  greeting: string;
}

export interface NicheAIRule {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface NicheRole {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface NicheTerminology {
  customer: string;
  customers: string;
  appointment: string;
  appointments: string;
  service: string;
  services: string;
  staff: string;
  waitingRoom: string;
  patientFiles: string;
  calendar: string;
  billing: string;
  overview: string;
}

// ============================================================
// MASTER NICHE CONFIG INTERFACE
// ============================================================

export interface NicheConfig {
  id: NicheId;
  label: string;
  tagline: string;
  icon: string;
  accentColor: string;
  accentColorRGB: string;
  gradientFrom: string;
  gradientTo: string;

  terminology: NicheTerminology;
  roles: NicheRole[];
  navItems: NicheNavItem[];
  kpis: NicheKPI[];

  templates: NicheTemplate[];
  knowledgeBaseDocs: NicheKBDoc[];
  automationPresets: NicheAutomationPreset[];
  initialWorkflows: NicheWorkflow[];

  goldenPrompt: string;
  tones: NicheTone[];
  aiRules: NicheAIRule[];
  inputVariables: { token: string; label: string; fallback: string }[];
}

// Re-export icons for use in niche configs
export {
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone, 
  MessageCircle, Workflow, Settings, FileText, Rocket, Receipt, TrendingUp, CreditCard, 
  CalendarDays, Clock, Shield, IndianRupee, Heart, SmilePlus, Cpu, PhoneIncoming, 
  Megaphone, Activity, Laptop, AlertTriangle
};
export type { LucideIcon };

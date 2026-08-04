// ============================================================
// CORE DOMAIN TYPES
// ============================================================

export interface Tenant {
  id: string;
  clerkOrgId: string;
  name: string;
  slug: string;
  industry: string;
  logoUrl?: string;
  timezone: string;
  settings: Record<string, unknown>;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  clerkUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  tenantId: string;
  phone?: string;
  email?: string;
  name?: string;
  language: string;
  leadScore: number;
  sentiment?: string;
  lifetimeValue: number;
  tags: string[];
  aiSummary?: string;
  metadata: Record<string, unknown>;
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  channel: string;
  status: string;
  aiSummary?: string;
  sentiment?: string;
  resolution?: string;
  metadata: Record<string, unknown>;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  tenantId: string;
  conversationId: string;
  role: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  content: string;
  sourceType: string;
  fileKey?: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  tenantId: string;
  customerId?: string;
  stageId: string;
  ownerId?: string;
  title?: string;
  value?: number;
  score: number;
  source?: string;
  tags: string[];
  notes?: string;
  wonAt?: Date;
  lostAt?: Date;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  serviceId?: string;
  staffId?: string;
  status: string;
  scheduledAt: Date;
  durationMins: number;
  notes?: string;
  source?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  durationMins: number;
  price?: number;
  category?: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface StaffMember {
  id: string;
  tenantId: string;
  userId?: string;
  name: string;
  roleTitle?: string;
  specialization?: string;
  availability: Record<string, string[]>;
  isActive: boolean;
  createdAt: Date;
}

export interface Activity {
  id: string;
  tenantId: string;
  leadId?: string;
  customerId?: string;
  userId?: string;
  type: string;
  content?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface Task {
  id: string;
  tenantId: string;
  leadId?: string;
  assignedTo?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  order: number;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface DashboardOverview {
  todayCalls: number;
  todayMessages: number;
  todayAppointments: number;
  todayRevenue: number;
  aiResolutionRate: number;
  avgResponseTime: number;
  missedCalls: number;
  recoveredLeads: number;
  callsTrend: Array<{ date: string; count: number }>;
  messagesTrend: Array<{ date: string; count: number }>;
  leadFunnel: Array<{ stage: string; count: number; value: number }>;
  recentConversations: Conversation[];
}

export interface AdminOverview {
  totalClients: number;
  activeClients: number;
  mrr: number;
  arr: number;
  totalVoiceMinutes: number;
  totalWhatsappMessages: number;
  topClients: Array<{ tenant: Tenant; usage: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

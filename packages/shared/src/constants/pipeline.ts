export const ConversationStatus = {
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  TRANSFERRED: 'TRANSFERRED',
} as const;

export const MessageRole = {
  USER: 'USER',
  AI: 'AI',
  SYSTEM: 'SYSTEM',
  STAFF: 'STAFF',
} as const;

export const Sentiment = {
  POSITIVE: 'POSITIVE',
  NEUTRAL: 'NEUTRAL',
  NEGATIVE: 'NEGATIVE',
} as const;

export const Resolution = {
  AI_RESOLVED: 'AI_RESOLVED',
  HUMAN_RESOLVED: 'HUMAN_RESOLVED',
  UNRESOLVED: 'UNRESOLVED',
} as const;

export const LeadSource = {
  VOICE: 'VOICE',
  WHATSAPP: 'WHATSAPP',
  WEB_CHAT: 'WEB_CHAT',
  MANUAL: 'MANUAL',
  REFERRAL: 'REFERRAL',
} as const;

export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const SubscriptionPlan = {
  TRIAL: 'trial',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const SubscriptionStatus = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  TRIALING: 'trialing',
} as const;

export const ActivityType = {
  CALL: 'CALL',
  MESSAGE: 'MESSAGE',
  NOTE: 'NOTE',
  EMAIL: 'EMAIL',
  TASK: 'TASK',
  STATUS_CHANGE: 'STATUS_CHANGE',
} as const;

export const VoicePersonality = {
  RECEPTIONIST: 'receptionist',
  LUXURY: 'luxury',
  CORPORATE: 'corporate',
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  DOCTOR_ASSISTANT: 'doctor_assistant',
  HOTEL_RECEPTION: 'hotel_reception',
  SPA_RECEPTION: 'spa_reception',
  REAL_ESTATE_EXECUTIVE: 'real_estate_executive',
} as const;

export const KnowledgeCategory = {
  FAQ: 'FAQ',
  SERVICE: 'SERVICE',
  PRICING: 'PRICING',
  POLICY: 'POLICY',
  DOCTOR: 'DOCTOR',
  STAFF_PROFILE: 'STAFF_PROFILE',
  ROOM: 'ROOM',
  PROPERTY: 'PROPERTY',
  PROMOTION: 'PROMOTION',
  GENERAL: 'GENERAL',
} as const;

export const AnalyticsEventType = {
  CALL_STARTED: 'CALL_STARTED',
  CALL_ENDED: 'CALL_ENDED',
  CALL_MISSED: 'CALL_MISSED',
  CALL_TRANSFERRED: 'CALL_TRANSFERRED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  CHAT_STARTED: 'CHAT_STARTED',
  CHAT_ENDED: 'CHAT_ENDED',
  APPOINTMENT_BOOKED: 'APPOINTMENT_BOOKED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_QUALIFIED: 'LEAD_QUALIFIED',
  LEAD_WON: 'LEAD_WON',
  LEAD_LOST: 'LEAD_LOST',
  KB_SEARCHED: 'KB_SEARCHED',
  AUTOMATION_TRIGGERED: 'AUTOMATION_TRIGGERED',
} as const;

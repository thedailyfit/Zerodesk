export { Role, ROLE_HIERARCHY, Permission, ROLE_PERMISSIONS, hasPermission, hasMinRole } from './constants/roles.js';
export type { RoleType, PermissionType } from './constants/roles.js';

export { Channel, CHANNEL_LABELS, CHANNEL_ICONS } from './constants/channels.js';
export type { ChannelType } from './constants/channels.js';

export { Industry, INDUSTRY_CONFIG } from './constants/industries.js';
export type { IndustryType } from './constants/industries.js';

export {
  ConversationStatus,
  MessageRole,
  Sentiment,
  Resolution,
  LeadSource,
  AppointmentStatus,
  TaskStatus,
  TaskPriority,
  SubscriptionPlan,
  SubscriptionStatus,
  ActivityType,
  VoicePersonality,
  KnowledgeCategory,
  AnalyticsEventType,
} from './constants/pipeline.js';

export type { Tenant, Customer, Conversation, Message, Lead, Appointment, KnowledgeDocument } from './types/index.js';

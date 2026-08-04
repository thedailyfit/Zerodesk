export { Role, ROLE_HIERARCHY, Permission, ROLE_PERMISSIONS, hasPermission, hasMinRole } from './constants/roles';
export type { RoleType, PermissionType } from './constants/roles';

export { Channel, CHANNEL_LABELS, CHANNEL_ICONS } from './constants/channels';
export type { ChannelType } from './constants/channels';

export { Industry, INDUSTRY_CONFIG } from './constants/industries';
export type { IndustryType } from './constants/industries';

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
} from './constants/pipeline';

export type { Tenant, Customer, Conversation, Message, Lead, Appointment, KnowledgeDocument } from './types/index';

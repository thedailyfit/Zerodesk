// ============================================================
// ROLE & PERMISSION CONSTANTS
// ============================================================

export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  VIEWER: 'VIEWER',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

/** Numeric hierarchy for comparison — higher = more powerful */
export const ROLE_HIERARCHY: Record<RoleType, number> = {
  SUPER_ADMIN: 100,
  ORG_ADMIN: 80,
  MANAGER: 60,
  STAFF: 40,
  VIEWER: 20,
};

export const Permission = {
  // Platform
  PLATFORM_MANAGE: 'platform:manage',
  PLATFORM_ANALYTICS: 'platform:analytics',

  // Tenant
  TENANT_SETTINGS: 'tenant:settings',
  TENANT_BILLING: 'tenant:billing',
  TENANT_BRANDING: 'tenant:branding',

  // Staff
  STAFF_MANAGE: 'staff:manage',
  STAFF_VIEW: 'staff:view',

  // Knowledge Base
  KB_MANAGE: 'kb:manage',
  KB_VIEW: 'kb:view',

  // CRM
  CRM_MANAGE: 'crm:manage',
  CRM_VIEW: 'crm:view',

  // Customers
  CUSTOMER_MANAGE: 'customer:manage',
  CUSTOMER_VIEW: 'customer:view',

  // Conversations
  CONVERSATION_MANAGE: 'conversation:manage',
  CONVERSATION_VIEW: 'conversation:view',

  // Appointments
  APPOINTMENT_MANAGE: 'appointment:manage',
  APPOINTMENT_VIEW: 'appointment:view',

  // Voice
  VOICE_CONFIGURE: 'voice:configure',
  VOICE_VIEW: 'voice:view',
  VOICE_OUTBOUND: 'voice:outbound',

  // WhatsApp
  WHATSAPP_CONFIGURE: 'whatsapp:configure',
  WHATSAPP_SEND: 'whatsapp:send',
  WHATSAPP_VIEW: 'whatsapp:view',

  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // Automation
  AUTOMATION_MANAGE: 'automation:manage',
  AUTOMATION_VIEW: 'automation:view',

  // Audit
  AUDIT_VIEW: 'audit:view',
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

/** Which roles get which permissions */
export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  SUPER_ADMIN: Object.values(Permission),
  ORG_ADMIN: [
    Permission.TENANT_SETTINGS,
    Permission.TENANT_BILLING,
    Permission.TENANT_BRANDING,
    Permission.STAFF_MANAGE,
    Permission.STAFF_VIEW,
    Permission.KB_MANAGE,
    Permission.KB_VIEW,
    Permission.CRM_MANAGE,
    Permission.CRM_VIEW,
    Permission.CUSTOMER_MANAGE,
    Permission.CUSTOMER_VIEW,
    Permission.CONVERSATION_MANAGE,
    Permission.CONVERSATION_VIEW,
    Permission.APPOINTMENT_MANAGE,
    Permission.APPOINTMENT_VIEW,
    Permission.VOICE_CONFIGURE,
    Permission.VOICE_VIEW,
    Permission.VOICE_OUTBOUND,
    Permission.WHATSAPP_CONFIGURE,
    Permission.WHATSAPP_SEND,
    Permission.WHATSAPP_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.AUTOMATION_MANAGE,
    Permission.AUTOMATION_VIEW,
    Permission.AUDIT_VIEW,
  ],
  MANAGER: [
    Permission.STAFF_MANAGE,
    Permission.STAFF_VIEW,
    Permission.KB_MANAGE,
    Permission.KB_VIEW,
    Permission.CRM_MANAGE,
    Permission.CRM_VIEW,
    Permission.CUSTOMER_MANAGE,
    Permission.CUSTOMER_VIEW,
    Permission.CONVERSATION_MANAGE,
    Permission.CONVERSATION_VIEW,
    Permission.APPOINTMENT_MANAGE,
    Permission.APPOINTMENT_VIEW,
    Permission.VOICE_VIEW,
    Permission.VOICE_OUTBOUND,
    Permission.WHATSAPP_SEND,
    Permission.WHATSAPP_VIEW,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.AUTOMATION_VIEW,
  ],
  STAFF: [
    Permission.STAFF_VIEW,
    Permission.KB_VIEW,
    Permission.CRM_MANAGE,
    Permission.CRM_VIEW,
    Permission.CUSTOMER_MANAGE,
    Permission.CUSTOMER_VIEW,
    Permission.CONVERSATION_MANAGE,
    Permission.CONVERSATION_VIEW,
    Permission.APPOINTMENT_MANAGE,
    Permission.APPOINTMENT_VIEW,
    Permission.VOICE_VIEW,
    Permission.WHATSAPP_SEND,
    Permission.WHATSAPP_VIEW,
    Permission.ANALYTICS_VIEW,
  ],
  VIEWER: [
    Permission.STAFF_VIEW,
    Permission.KB_VIEW,
    Permission.CRM_VIEW,
    Permission.CUSTOMER_VIEW,
    Permission.CONVERSATION_VIEW,
    Permission.APPOINTMENT_VIEW,
    Permission.VOICE_VIEW,
    Permission.WHATSAPP_VIEW,
    Permission.ANALYTICS_VIEW,
  ],
};

export function hasPermission(role: RoleType, permission: PermissionType): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasMinRole(userRole: RoleType, requiredRole: RoleType): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

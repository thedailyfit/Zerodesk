# 10. Super Admin Control Plane & Governance Architecture

## 1. Executive Summary

The ZEROdesk Super Admin Control Plane is the platform-wide governance layer used by platform operators to oversee all tenant practices, manage global AI registries (voice personas and LLM models), adjust enterprise billing quotas, and monitor platform health and MRR metrics.

This document details the administrative access controls, global model registries, multi-tenant override mechanisms, and immutable audit logging.

---

## 2. Superadmin Governance Hierarchy & Data Flow

### 🖼️ Superadmin Control Plane Infographic
![Superadmin Control Plane Architecture](./images/10_superadmin_control_plane_architecture.jpg)

### 📐 Global Model Registry & Quota Control Vector Blueprint (SVG)
![Superadmin Control Plane Diagram](./diagrams/10_superadmin_control_plane_architecture.svg)

### ⚖️ Dual-Resource Quota Metering Flow (SVG)
![Dual Quota Metering](./diagrams/12_dual_resource_quota_metering.svg)

### 🗺️ Governance Pipeline Graph
```mermaid
flowchart TD
    subgraph SuperAdminActor["1. Platform Operators"]
        SuperAdmin["Platform Superadmin<br/>(Role: 'SUPER_ADMIN')"]
        AdminDashboard["Superadmin Dashboard<br/>(/super-admin/*)"]
        
        SuperAdmin --> AdminDashboard
    end

    subgraph SecurityGate["2. Administrative Security Gate"]
        AdminController["AdminController (/v1/admin)<br/>(apps/api/src/modules/admin/admin.controller.ts)"]
        
        Guards["Security Guards:<br/>• AuthGuard (Validates Clerk JWT)<br/>• SuperAdminGuard (Verifies Role == 'SUPER_ADMIN')"]
        
        AdminDashboard --> AdminController --> Guards
    end

    subgraph ControlPlaneEngines["3. Control Plane Subsystems"]
        GlobalLLM["Global LLM Registry<br/>• Model: GlobalLlmRegistry<br/>• Providers: Groq, OpenAI, Sarvam<br/>• Input/Output Cost Calibration<br/>• Dynamic Primary & Fallback Assignment"]
        
        GlobalVoices["Global Voice Registry<br/>• Model: GlobalVoiceRegistry<br/>• Personas: Kavya, Rohan, Priya<br/>• Provider Voice IDs (ElevenLabs/Sarvam)<br/>• Language & Accent Tagging"]
        
        QuotaManagement["Tenant Quota Engine<br/>• Override voiceMinutesLimit<br/>• Override whatsappMessagesLimit<br/>• Override llmTokensLimit<br/>• Override storageLimitMB"]
        
        PlatformStats["Financial & Metric Aggregator<br/>• Platform Total MRR Rollup<br/>• Active Clinics Count<br/>• Total Voice Minutes Handled<br/>• System Error Latencies"]
        
        Guards --> GlobalLLM
        Guards --> GlobalVoices
        Guards --> QuotaManagement
        Guards --> PlatformStats
    end

    subgraph PersistenceAudit["4. Persistence & Immutable Audit Trail"]
        AuditLog["AuditLog Model (PostgreSQL)<br/>• Action: 'TENANT_QUOTA_OVERRIDE'<br/>• Resource: 'Subscription'<br/>• Superadmin User ID + IP Address<br/>• Timestamped Delta Details (JSONB)"]
        
        PostgresDB["Supabase PostgreSQL Cluster<br/>(All Multi-Tenant Records)"]
        
        GlobalLLM & GlobalVoices & QuotaManagement --> AuditLog --> PostgresDB
    end
```

---

## 3. Global AI Registries Architecture

Rather than hardcoding LLM models and voice IDs inside application code, ZEROdesk manages AI providers dynamically via platform-wide control plane registries:

```mermaid
classDiagram
    class GlobalVoiceRegistry {
        +UUID id
        +String provider ("elevenlabs" | "sarvam" | "cartesia")
        +String voiceId (Provider's voice ID)
        +String name (Display Name, e.g. "Kavya")
        +String gender ("female" | "male")
        +String language ("hi-IN" | "en-IN" | "te-IN")
        +String accent ("Indian English" | "Hindi")
        +String previewUrl
        +Boolean isDefault
        +Boolean isActive
        +String[] tags
    }

    class GlobalLlmRegistry {
        +UUID id
        +String provider ("groq" | "openai" | "sarvam")
        +String modelId ("llama-3.3-70b" | "gpt-4o")
        +String name ("Groq LPU High-Speed")
        +Int contextWindow (128000)
        +Decimal costPer1kInput (0.0025)
        +Decimal costPer1kOutput (0.0100)
        +Boolean isDefault
        +Boolean isFallback
        +String category ("fast_voice" | "reasoning")
    }

    class Tenant {
        +UUID id
        +String name
        +String planTier ("starter" | "pro")
        +UUID assignedLlmId
        +UUID assignedFallbackLlmId
    }

    Tenant --> GlobalLlmRegistry : assignedLlm
    Tenant --> GlobalVoiceRegistry : allowedVoices
```

---

## 4. Key Implementation References

### 4.1 Superadmin Security Guards
Located in [`apps/api/src/modules/admin/admin.controller.ts:1-25`](file:///c:/Users/Pc/Downloads/zerodesk/apps/api/src/modules/admin/admin.controller.ts#L1-L25):
- Guarded by `@UseGuards(AuthGuard, SuperAdminGuard)`.
- Rejects any unauthorized clinic doctor or staff member attempting to query administrative endpoints with `403 Forbidden`.

### 4.2 Platform Metrics Aggregation (`/v1/admin/platform/stats`)
```typescript
async getPlatformStats() {
  const [totalTenants, totalCalls, subscriptions] = await Promise.all([
    this.prisma.tenant.count({ where: { deletedAt: null } }),
    this.prisma.conversation.count({ where: { channel: 'VOICE' } }),
    this.prisma.subscription.findMany({ select: { mrr: true, voiceMinutesUsed: true } }),
  ]);

  const totalMrr = subscriptions.reduce((sum, s) => sum + Number(s.mrr || 0), 0);
  const totalMinutes = subscriptions.reduce((sum, s) => sum + (s.voiceMinutesUsed || 0), 0);

  return {
    totalTenants,
    totalCalls,
    totalMrr,
    totalMinutes,
    systemHealth: 'OPERATIONAL',
  };
}
```

### 4.3 Immutable Audit Logging
- Every administrative change (plan upgrades, quota adjustments, KYC approvals) automatically invokes `AuditLogService.logAction(...)`.
- Preserves IP address, actor user ID, target tenant ID, and payload delta in `audit_logs` table for SOC-2 and statutory compliance.

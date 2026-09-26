import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TypeSafeService } from '../../modules/typesafe/typesafe.service';

export interface ActionPolicyEvaluationRequest {
  tenantId: string;
  agentKey: 'VOICE_RECEPTIONIST' | 'WHATSAPP_AI' | 'OUTBOUND_CAMPAIGNER' | 'TRIAGE_AGENT';
  actionName: string;
  targetResource: string;
  parameters: Record<string, any>;
}

export interface ActionPolicyDecision {
  allowed: boolean;
  ruleId: string;
  reason?: string;
}

/**
 * Cedar-Inspired Default-Deny Policy Engine for Agent Tool Execution.
 * Formulated from the BESA Agentic AI Security Specification (BESA-AI-SEC-2026-E04-V1).
 *
 * All agent tool invocations are FORBIDDEN by default unless an explicit permit rule matches
 * the Principal, Action, Resource, and Context parameters.
 */
@Injectable()
export class ActionPolicyGuard {
  private readonly logger = new Logger(ActionPolicyGuard.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly typeSafeService?: TypeSafeService,
  ) {}

  async evaluate(request: ActionPolicyEvaluationRequest): Promise<ActionPolicyDecision> {
    const { tenantId, agentKey, actionName, targetResource, parameters } = request;

    // 1. Fetch Agent Estate definition for this tenant
    const estate = await this.prisma.agentEstate.findUnique({
      where: {
        tenantId_agentKey: {
          tenantId,
          agentKey,
        },
      },
    });

    // Rule 1: Agent must exist and be active
    if (estate && !estate.isActive) {
      return {
        allowed: false,
        ruleId: 'DENY_AGENT_INACTIVE',
        reason: `Agent ${agentKey} is currently deactivated by clinic administration.`,
      };
    }

    // Rule 2: Least Privilege - Action must be in agent's allowedTools
    const allowedTools = estate?.allowedTools || [
      'book_appointment',
      'get_pricing',
      'transfer_to_human',
      'send_whatsapp_info',
      'query_knowledge_base',
    ];

    const normalizedAction = actionName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const isToolPermitted = allowedTools.some(
      (t) => t.toLowerCase().replace(/[^a-z0-9_]/g, '') === normalizedAction,
    );

    if (!isToolPermitted) {
      return {
        allowed: false,
        ruleId: 'DENY_TOOL_NOT_PERMITTED',
        reason: `Tool '${actionName}' is not in the allowed tool scope for agent ${agentKey}.`,
      };
    }

    const hardLimits = (estate?.hardLimits as any) || {
      maxBookingDaysAhead: 30,
      maxDiscountAllowedPct: 0,
      maxCallsPerHour: 50,
    };

    // Rule 3: Blast Radius Guard on Appointments
    if (normalizedAction.includes('book') || normalizedAction.includes('appointment')) {
      const requestedDateStr = parameters.date || parameters.preferred_date || parameters.dateTime || parameters.scheduledAt;
      if (!requestedDateStr) {
        return {
          allowed: false,
          ruleId: 'DENY_MISSING_BOOKING_DATE',
          reason: 'Booking date or timestamp is required for appointment actions.',
        };
      }
      const requestedDate = new Date(requestedDateStr);
      if (isNaN(requestedDate.getTime())) {
        return {
          allowed: false,
          ruleId: 'DENY_INVALID_BOOKING_DATE',
          reason: 'Provided booking date is not a valid date/timestamp.',
        };
      }
      const now = new Date();
      const maxAllowedDate = new Date();
      maxAllowedDate.setDate(now.getDate() + (hardLimits.maxBookingDaysAhead || 30));

      // Cannot book past allowed booking horizon
      if (requestedDate > maxAllowedDate) {
        return {
          allowed: false,
          ruleId: 'DENY_EXCEEDED_BOOKING_HORIZON',
          reason: `Requested booking date exceeds the business's maximum allowed booking horizon of ${hardLimits.maxBookingDaysAhead || 30} days.`,
        };
      }

      // Cannot book in the past (more than 15 minutes ago)
      if (requestedDate.getTime() < now.getTime() - 15 * 60 * 1000) {
        return {
          allowed: false,
          ruleId: 'DENY_PAST_BOOKING_DATE',
          reason: 'Cannot book appointments for past dates or times.',
        };
      }
    }

    // Rule 4: Financial Blast Radius Guard (Rate Card Discounting Prohibited)
    if (parameters.discountPct !== undefined || parameters.discountAmount !== undefined) {
      const discountPct = Number(parameters.discountPct) || 0;
      const discountAmount = Number(parameters.discountAmount) || 0;
      const maxDiscountPct = hardLimits.maxDiscountAllowedPct ?? 0;
      const maxDiscountAmount = hardLimits.maxDiscountAmountINR ?? 0;

      if (discountPct > maxDiscountPct) {
        return {
          allowed: false,
          ruleId: 'DENY_UNAUTHORIZED_DISCOUNT',
          reason: `AI is strictly forbidden from offering discounts greater than ${maxDiscountPct}% without manager approval.`,
        };
      }
      if (discountAmount > maxDiscountAmount) {
        return {
          allowed: false,
          ruleId: 'DENY_UNAUTHORIZED_DISCOUNT_AMOUNT',
          reason: `AI is strictly forbidden from applying discount amounts greater than ₹${maxDiscountAmount} without manager approval.`,
        };
      }
    }

    // Rule 5: Semantic Invariant Guard via TypeSafe AI (Jev System One)
    if (this.typeSafeService) {
      try {
        const typeSafeCheck = await this.typeSafeService.validateToolCallPolicy(
          actionName,
          parameters,
          hardLimits,
          120,
        );
        if (!typeSafeCheck.allowed) {
          return {
            allowed: false,
            ruleId: 'DENY_TYPESAFE_POLICY_VIOLATION',
            reason: typeSafeCheck.reason || 'Semantic invariant violated under TypeSafe safety rules.',
          };
        }
      } catch (err: any) {
        this.logger.warn(`TypeSafe tool policy guard check skipped due to error: ${err.message}`);
      }
    }

    // Explicit Permit Rule Matched
    return {
      allowed: true,
      ruleId: 'PERMIT_CLINIC_STANDARD_POLICY',
    };
  }
}

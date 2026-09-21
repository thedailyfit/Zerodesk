import { Injectable, Logger } from '@nestjs/common';

export interface SanitizedMemoryResult {
  sanitized: string;
  quarantined: boolean;
  violations: string[];
}

/**
 * Anti-Memory Poisoning Service (OWASP Family 1: Goal Integrity & Memory Poisoning).
 * Formulated from the Agentic AI Governance & Failure Taxonomy (LLMWORK-GOV-2026-V1).
 *
 * Prevents adversarial callers from injecting persistent claims (e.g. false discount promises,
 * administrative role escalation, or instruction overrides) into long-term patient history,
 * customer notes, or clinic conversation memory.
 */
@Injectable()
export class MemoryQuarantineService {
  private readonly logger = new Logger(MemoryQuarantineService.name);

  // Pattern 1: Unauthorized financial & pricing claims
  private readonly DISCOUNT_PATTERNS = [
    /(?:free|100%|50%|special|zero)\s+(?:cost|fee|charge|price|discount|treatment|consultation)/i,
    /(?:promised|authorized|approved|offered|gave\s+me)\s+(?:a\s+)?(?:discount|waiver|free|cashback)/i,
    /(?:waive|waived)\s+(?:all\s+)?(?:fees?|charges?|consultation)/i,
    /(?:dr\.?\s+[a-z]+|doctor|clinic\s+head)\s+(?:said|promised|authorized)\s+(?:no\s+charge|it'?s\s+free|half\s+price)/i,
  ];

  // Pattern 2: Prompt injection & instruction overrides
  private readonly INJECTION_PATTERNS = [
    /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|prior|system)\s+(?:instructions?|prompts?|rules?)/i,
    /(?:you\s+are\s+now|act\s+as)\s+(?:a\s+)?(?:system|admin|root|developer|god\s+mode|unrestricted)/i,
    /(?:system\s+override|bypass\s+security|jailbreak|DAN\s+mode)/i,
    /<\s*system\s*>|<\s*instruction\s*>|\[\s*system\s*\]/i,
  ];

  // Pattern 3: Administrative escalation & credential tampering
  private readonly ESCALATION_PATTERNS = [
    /(?:patient\s+is|mark\s+as|set\s+role\s+to)\s+(?:owner|superadmin|manager|staff|doctor|vip\s+partner)/i,
    /(?:skip|bypass)\s+(?:payment|otp|verification|id\s+check)/i,
  ];

  sanitizeCustomerMemory(input: string): SanitizedMemoryResult {
    if (!input || typeof input !== 'string') {
      return { sanitized: '', quarantined: false, violations: [] };
    }

    const violations: string[] = [];
    let sanitizedText = input;

    // Check financial discount poisoning
    for (const pattern of this.DISCOUNT_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        violations.push('UNAUTHORIZED_DISCOUNT_CLAIM');
        sanitizedText = sanitizedText.replace(pattern, '[UNVERIFIED_FINANCIAL_CLAIM_REDACTED]');
      }
    }

    // Check prompt injection & instruction overrides
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        violations.push('PROMPT_INJECTION_ATTEMPT');
        sanitizedText = sanitizedText.replace(pattern, '[SYSTEM_OVERRIDE_ATTEMPT_BLOCKED]');
      }
    }

    // Check administrative privilege escalation
    for (const pattern of this.ESCALATION_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        violations.push('ROLE_ESCALATION_ATTEMPT');
        sanitizedText = sanitizedText.replace(pattern, '[ROLE_ESCALATION_BLOCKED]');
      }
    }

    const quarantined = violations.length > 0;
    if (quarantined) {
      this.logger.warn(
        `[MEMORY_POISONING_PREVENTED] Detected and neutralized ${violations.length} injection pattern(s): ${violations.join(', ')}`,
      );
    }

    return {
      sanitized: sanitizedText.trim(),
      quarantined,
      violations,
    };
  }
}

/**
 * Institutional PII / PHI Data Sanitizer
 * Redacts personal identifiable & medical data in accordance with DPDP Act 2023
 * and Agentic Observability best practices.
 */

export function redactPii(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return text
    // 1. Indian Mobile & International Phone Numbers (+91, 10-digit mobiles starting with 6-9)
    .replace(/(?:\+?91[\-\s]?)?[6-9]\d{9}/g, '[REDACTED_PHONE]')
    // 2. Email Addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    // 3. Credit / Debit Card Numbers (13-19 digits, formatted with spaces or dashes)
    .replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[REDACTED_CARD]')
    // 4. Indian Aadhaar Numbers (12 digits with or without spaces)
    .replace(/\b[2-9]{1}\d{3}\s\d{4}\s\d{4}\b/g, '[REDACTED_AADHAAR]')
    // 5. Indian PAN Numbers (5 letters, 4 digits, 1 letter)
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, '[REDACTED_PAN]');
}

export function sanitizePayload<T extends Record<string, any>>(payload: T): T {
  if (!payload || typeof payload !== 'object') return payload;

  const result: any = Array.isArray(payload) ? [] : {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === 'string') {
      result[key] = redactPii(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizePayload(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

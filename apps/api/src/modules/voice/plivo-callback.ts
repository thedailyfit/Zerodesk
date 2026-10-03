import { createHmac, timingSafeEqual } from 'crypto';

export function validPlivoSignature(url: string, body: Record<string, unknown>, nonce: string, signatures: string, secret: string): boolean {
  if (!secret || !nonce || !signatures || Object.values(body).some(value => typeof value !== 'string')) return false;
  // Match Plivo's v3Security.js: sorted decoded query, '.' before POST fields
  // when a query exists, and '.' before the nonce (not the older V2 format).
  const parsed = new URL(url);
  const query = [...parsed.searchParams.entries()].sort(([ak, av], [bk, bv]) => ak < bk ? -1 : ak > bk ? 1 : av < bv ? -1 : av > bv ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('&');
  const fields = Object.keys(body).sort().map(key => key + body[key]).join('');
  const message = parsed.origin + parsed.pathname + (query || fields ? '?' + query : '') + (query && fields ? '.' : '') + fields + '.' + nonce;
  const expected = Buffer.from(createHmac('sha256', secret).update(message).digest('base64'));
  return signatures.split(',').some(signature => {
    const actual = Buffer.from(signature.trim());
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

export function plivoFollowUpStatus(body: Record<string, string>): string | undefined {
  const status = body.CallStatus?.toLowerCase();
  if (['busy', 'no-answer', 'cancel'].includes(status)) return 'UNREACHABLE';
  if (status === 'failed') return 'FAILED';
  if (status === 'completed') return Number(body.BillDuration || body.Duration || 0) > 0 ? 'COMPLETED' : 'UNREACHABLE';
  if (['ringing', 'in-progress', 'answered'].includes(status)) return 'DISPATCHED';
  return undefined;
}

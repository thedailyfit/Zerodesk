/**
 * Normalizes phone numbers to standard E.164 format.
 * Defaults to Indian standard (+91) for 10-digit mobile numbers or leading zero numbers.
 */
export function normalizePhoneNumber(rawPhone: string | null | undefined, defaultCountryCode = '+91'): string {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return '';
  }

  // Strip all non-digit and non-plus characters
  let clean = rawPhone.replace(/[^0-9+]/g, '');

  if (!clean) return '';

  // Case 1: Already starts with '+'
  if (clean.startsWith('+')) {
    return clean;
  }

  // Case 2: Starts with double zero (e.g. 00919876543210 -> +919876543210)
  if (clean.startsWith('00')) {
    return '+' + clean.slice(2);
  }

  // Case 3: Leading zero (e.g. 09876543210 -> +919876543210)
  if (clean.startsWith('0') && clean.length === 11) {
    return defaultCountryCode + clean.slice(1);
  }

  // Case 4: 10-digit national number (e.g. 9876543210 -> +919876543210)
  if (clean.length === 10) {
    return defaultCountryCode + clean;
  }

  // Case 5: Missing '+' with country code (e.g. 919876543210 -> +919876543210)
  if (clean.startsWith('91') && clean.length === 12) {
    return '+' + clean;
  }

  return '+' + clean;
}

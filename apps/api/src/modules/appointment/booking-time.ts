import { BadRequestException } from '@nestjs/common';

/** Resolve wall time without depending on the API host timezone. Reject DST gaps/folds. */
export function bookingTime(value: string, timezone: string): Date {
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  } catch { throw new BadRequestException('Tenant timezone must be a valid IANA timezone'); }
  if (!timezone) throw new BadRequestException('Tenant timezone is required');
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/.exec(value || '');
  if (!match) throw new BadRequestException('An explicit valid booking date and time are required');
  const [, y, m, d, h, min, sec = '00', offset] = match;
  const wall = Date.UTC(+y, +m - 1, +d, +h, +min, +sec);
  if (new Date(wall).toISOString().slice(0, 19) !== `${y}-${m}-${d}T${h}:${min}:${sec}`) throw new BadRequestException('Invalid calendar date or time');
  if (offset) {
    const result = new Date(value);
    if (!Number.isFinite(result.getTime())) throw new BadRequestException('Invalid timestamp offset');
    return result;
  }
  const localEpoch = (instant: number) => {
    const parts = Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  };
  // Sample offsets on both sides of a transition, then round-trip every candidate.
  const offsets = new Set([-48, -24, 0, 24, 48].map(hours => {
    const instant = wall + hours * 3600000;
    return localEpoch(instant) - instant;
  }));
  const candidates = [...offsets].map(offset => wall - offset).filter(instant => localEpoch(instant) === wall);
  if (candidates.length !== 1) throw new BadRequestException('Booking time is nonexistent or ambiguous in tenant timezone; provide an explicit UTC offset');
  return new Date(candidates[0]);
}

import { bookingTime } from './booking-time';

describe('tenant booking time', () => {
  it('uses the tenant timezone and preserves explicit offsets', () => {
    expect(bookingTime('2026-10-10T10:00', 'Asia/Kolkata').toISOString()).toBe('2026-10-10T04:30:00.000Z');
    expect(bookingTime('2026-11-01T01:30-04:00', 'America/New_York').toISOString()).toBe('2026-11-01T05:30:00.000Z');
  });
  it('rejects DST gaps, ambiguous wall times, invalid dates and missing timezone', () => {
    for (const value of ['2026-03-08T02:30', '2026-11-01T01:30', '2026-02-30T10:00']) expect(() => bookingTime(value, 'America/New_York')).toThrow();
    expect(() => bookingTime('2026-10-10T10:00', '')).toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import { getYouthServiceType, getHANAServiceType } from '@/lib/scheduleUtils';

/**
 * These two functions drive the "ganti dalam N hari" badge on /info. Both used
 * to report 0 on the very day their cycle turns over, because `7 - getDay()`
 * (and `6 - getDay()`) evaluates to 0 on that weekday and the target then landed
 * on today-at-midnight. The tests below pin the days-until-change arithmetic so
 * the regression cannot come back.
 */

describe('getYouthServiceType — cycle turnover lands on Saturday', () => {
  it('reports a positive countdown on the Saturday the cycle turns over', () => {
    // 2026-08-29 is a Saturday and is the Week-1 reference (Youth).
    const saturday = new Date('2026-08-29T10:00:00');
    const info = getYouthServiceType(saturday);

    expect(saturday.getDay()).toBe(6);
    expect(info.serviceType).toBe('youth');
    expect(info.daysUntilChange).toBeGreaterThan(0);
    // The change is due next Saturday, i.e. a week from the service day itself.
    expect(info.daysUntilChange).toBe(7);
  });

  it('counts to the coming Saturday from mid-week', () => {
    // 2026-09-01 is a Tuesday, still inside Week 1, so the cycle flips on the
    // Saturday of that same week — 4 days out, not next week.
    const tuesday = new Date('2026-09-01T09:00:00');
    const info = getYouthServiceType(tuesday);
    expect(tuesday.getDay()).toBe(2);
    expect(info.currentWeek).toBe(1);
    expect(info.daysUntilChange).toBe(4);
  });

  it('adds a full week when the current week is a Komsel week', () => {
    // 2026-09-08 is a Tuesday in Week 2 (Komsel), so the flip skips to the
    // following Saturday — 4 days to Saturday plus 7 for the cycle.
    const tuesday = new Date('2026-09-08T09:00:00');
    const info = getYouthServiceType(tuesday);
    expect(info.currentWeek).toBe(2);
    expect(info.serviceType).toBe('komsel-youth');
    expect(info.daysUntilChange).toBe(11);
  });

  it('never returns a negative countdown', () => {
    for (let d = 0; d < 14; d++) {
      const date = new Date('2026-08-29T12:00:00');
      date.setDate(date.getDate() + d);
      const info = getYouthServiceType(date);
      expect(info.daysUntilChange).toBeGreaterThanOrEqual(0);
      expect(info.daysUntilChange).toBeLessThanOrEqual(14);
    }
  });

  it('alternates Youth and Komsel across the 4-week cycle', () => {
    const types = [0, 7, 14, 21].map((offset) => {
      const date = new Date('2026-08-29T10:00:00');
      date.setDate(date.getDate() + offset);
      return getYouthServiceType(date).serviceType;
    });
    expect(types).toEqual(['youth', 'komsel-youth', 'youth', 'komsel-youth']);
  });
});

describe('getHANAServiceType — cycle turnover lands on Friday', () => {
  it('reports a positive countdown on the Friday the cycle turns over', () => {
    // 2026-09-04 is a Friday and is the Week-1 reference (HANA).
    const friday = new Date('2026-09-04T17:00:00');
    const info = getHANAServiceType(friday);

    expect(friday.getDay()).toBe(5);
    expect(info.serviceType).toBe('hana');
    expect(info.daysUntilChange).toBe(7);
  });

  it('never returns a negative countdown across two cycles', () => {
    for (let d = 0; d < 14; d++) {
      const date = new Date('2026-09-04T12:00:00');
      date.setDate(date.getDate() + d);
      const info = getHANAServiceType(date);
      expect(info.daysUntilChange).toBeGreaterThanOrEqual(0);
      expect(info.daysUntilChange).toBeLessThanOrEqual(14);
    }
  });
});

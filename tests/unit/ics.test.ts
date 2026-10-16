import { describe, it, expect } from 'vitest';
import { cycleWeekIndex, WEEKLY_SERVICES, currentService } from '@/lib/serviceSchedule';
import { buildServiceCalendar, nextOccurrence } from '@/lib/ics';
import { getHANAServiceType, getYouthServiceType } from '@/lib/scheduleUtils';

describe('cycleWeekIndex agrees with the existing alternating logic', () => {
  it('matches getCycleWeek for WIB instants across a full 8-week span', () => {
    const hanaRef = new Date('2026-09-04T00:00:00+07:00');
    const mismatches: string[] = [];

    // 8 weeks of Friday and Saturday evenings, the only slots that alternate.
    for (let day = 0; day < 56; day += 1) {
      for (const hour of [17, 18]) {
        const instant = new Date(Date.UTC(2026, 8, 4 + day, hour - 7, 30));
        const ours = cycleWeekIndex(instant, '2026-09-04');
        // getCycleWeek counts 1-based weeks; reproduce its contract here on a
        // WIB-shifted copy so the comparison is about the cycle, not the host.
        const shifted = new Date(instant.getTime() + 7 * 3_600_000);
        const civil = new Date(
          Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()),
        );
        const diffDays = Math.round((civil.getTime() - hanaRef.getTime()) / 86_400_000);
        const theirs = ((Math.floor(diffDays / 7) % 4) + 4) % 4;

        if (ours !== theirs) {
          mismatches.push(`${instant.toISOString()}: ours=${ours} theirs=${theirs}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });

  it('does not depend on the host timezone', () => {
    const instant = new Date('2026-10-16T11:00:00Z'); // Fri 18:00 WIB
    const originalTz = process.env.TZ;

    process.env.TZ = 'UTC';
    const asUtc = cycleWeekIndex(instant, '2026-09-04');
    process.env.TZ = 'Asia/Jakarta';
    const asWib = cycleWeekIndex(instant, '2026-09-04');
    process.env.TZ = originalTz;

    expect(asUtc).toBe(asWib);
  });
});

describe('alternating services never claim the same week', () => {
  it('pairs youth with komsel and hana with komsel-ekklesia, week by week', () => {
    const youth = WEEKLY_SERVICES.find((s) => s.id === 'grow-generation')!;
    const komselYouth = WEEKLY_SERVICES.find((s) => s.id === 'komsel-generasi-muda')!;
    const hana = WEEKLY_SERVICES.find((s) => s.id === 'hana')!;
    const komselEkklesia = WEEKLY_SERVICES.find((s) => s.id === 'komsel-ekklesia')!;

    for (let week = 0; week < 20; week += 1) {
      const saturday = new Date(Date.UTC(2026, 9, 17 + week * 7, 11, 0)); // 18:00 WIB
      const tuesday = new Date(Date.UTC(2026, 9, 20 + week * 7, 11, 30));

      expect(youth.occursOn!(saturday)).toBe(!komselYouth.occursOn!(saturday));
      expect(hana.occursOn!(saturday)).toBe(!komselEkklesia.occursOn!(saturday));
    }
  });
});

describe('nextOccurrence', () => {
  it('lands on the requested weekday at the requested WIB wall clock', () => {
    const from = new Date('2026-10-16T01:00:00Z'); // Fri 08:00 WIB
    const sunday = nextOccurrence(from, 0, 9, 0);

    expect(sunday.getUTCDay()).toBe(0);
    expect(sunday.getUTCHours()).toBe(2); // 09:00 WIB
    expect(sunday.toISOString()).toBe('2026-10-18T02:00:00.000Z');
  });

  it('keeps a service today if it has not started, and skips to next week once it has', () => {
    const before = nextOccurrence(new Date('2026-10-18T00:30:00Z'), 0, 9, 0); // 07:30 WIB
    const after = nextOccurrence(new Date('2026-10-18T02:30:00Z'), 0, 9, 0); // 09:30 WIB

    expect(before.toISOString()).toBe('2026-10-18T02:00:00.000Z');
    expect(after.toISOString()).toBe('2026-10-25T02:00:00.000Z');
  });

  it('skips weeks the alternating predicate rejects', () => {
    const youth = WEEKLY_SERVICES.find((s) => s.id === 'grow-generation')!;
    // Sat 17 Oct 2026 is cycle week 4, a Komsel week; the next Youth is the 24th.
    const next = nextOccurrence(new Date('2026-10-17T00:00:00Z'), 6, 18, 0, youth.occursOn);

    expect(next.toISOString()).toBe('2026-10-24T11:00:00.000Z');
  });
});

describe('buildServiceCalendar', () => {
  const sunday = WEEKLY_SERVICES.find((s) => s.id === 'ibadah-raya')!;

  it('emits a valid single-event calendar with CRLF endings', () => {
    const ics = buildServiceCalendar(sunday, { now: new Date('2026-10-16T00:00:00Z') });

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('DTSTART;TZID=Asia/Jakarta:20261018T090000');
    expect(ics).toContain('DTEND;TZID=Asia/Jakarta:20261018T110000'); // 2 hours
    expect(ics).toContain('RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU');
    // No bare LF anywhere: some clients reject the file otherwise.
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('escapes the characters RFC 5545 reserves in text values', () => {
    const ics = buildServiceCalendar(
      { ...sunday, title: 'Ibadah, Raya; Umum', description: 'Baris satu\nBaris dua' },
      { now: new Date('2026-10-16T00:00:00Z') },
    );

    expect(ics).toContain('SUMMARY:Ibadah\\, Raya\\; Umum');
    expect(ics).toContain('DESCRIPTION:Baris satu\\nBaris dua');
  });

  it('folds long lines to 75 octets without splitting a multi-byte character', () => {
    const longTitle = `Ibadah ${'Keluarga '.repeat(20)}`;
    const ics = buildServiceCalendar({ ...sunday, title: longTitle }, {
      now: new Date('2026-10-16T00:00:00Z'),
    });

    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    // Unfolding must return the original text exactly.
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toContain(`SUMMARY:${longTitle}`);
  });

  it('lists every day of a multi-day service in BYDAY', () => {
    const prayer = WEEKLY_SERVICES.find((s) => s.id === 'doa-pagi')!;
    const ics = buildServiceCalendar(prayer, { now: new Date('2026-10-19T00:00:00Z') });

    expect(ics).toContain('RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,WE,TH,FR');
    // Mon 19 Oct 2026: the next 05.00 WIB prayer is Tuesday the 20th.
    expect(ics).toContain('DTSTART;TZID=Asia/Jakarta:20261020T050000');
  });

  it('uses a stable per-service UID so re-downloading updates rather than duplicates', () => {
    const first = buildServiceCalendar(sunday, { now: new Date('2026-10-16T00:00:00Z') });
    const second = buildServiceCalendar(sunday, { now: new Date('2027-03-01T00:00:00Z') });

    expect(first).toContain('UID:ibadah-raya@giadeliksari.my.id');
    expect(second).toContain('UID:ibadah-raya@giadeliksari.my.id');
  });
});

describe('currentService', () => {
  it('reports the Sunday service while it is running, in WIB', () => {
    const during = currentService(new Date('2026-10-18T03:00:00Z')); // Sun 10:00 WIB
    const before = currentService(new Date('2026-10-18T00:00:00Z')); // Sun 07:00 WIB

    expect(during?.id).toBe('ibadah-raya');
    expect(before).toBeNull();
  });

  it('does not report an alternating service on its off week', () => {
    // Sat 17 Oct 2026 = cycle week 4, so Youth is off and Komsel runs.
    const onKomselWeek = currentService(new Date('2026-10-17T12:00:00Z'));

    expect(onKomselWeek?.id).toBe('komsel-generasi-muda');
  });
});

describe('the existing countdown helper and this module agree', () => {
  it('names the same Friday service the site already tells congregants', () => {
    const friday = new Date('2026-10-16T11:00:00Z'); // Fri 18:00 WIB
    const fromHelper = getHANAServiceType(friday).serviceType;
    const inCycleWeekOneOrThree = cycleWeekIndex(friday, '2026-09-04') === 0;

    expect(fromHelper === 'hana').toBe(inCycleWeekOneOrThree || cycleWeekIndex(friday, '2026-09-04') === 2);
  });

  it('names the same Saturday service', () => {
    const saturday = new Date('2026-10-17T11:00:00Z');
    const fromHelper = getYouthServiceType(saturday).serviceType;
    const index = cycleWeekIndex(saturday, '2026-08-29');
    const expectsYouth = index === 0 || index === 2;

    expect(fromHelper === 'youth').toBe(expectsYouth);
  });
});

describe('the timezone definition accompanies the zoned timestamps', () => {
  const sunday = WEEKLY_SERVICES.find((s) => s.id === 'ibadah-raya')!;

  it('declares Asia/Jakarta before any event, since DTSTART references it', () => {
    const ics = buildServiceCalendar(sunday, { now: new Date('2026-10-16T00:00:00Z') });

    const vtimezone = ics.indexOf('BEGIN:VTIMEZONE');
    const firstEvent = ics.indexOf('BEGIN:VEVENT');
    expect(vtimezone).toBeGreaterThan(-1);
    expect(vtimezone).toBeLessThan(firstEvent);
    expect(ics).toContain('TZID:Asia/Jakarta');
    // The whole point of the zoned form: no UTC designator on the anchor.
    expect(ics).not.toMatch(/DTSTART:\d{8}T\d{6}Z/);
  });
});

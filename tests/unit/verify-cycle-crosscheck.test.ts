import { describe, it, expect } from 'vitest';
import { cycleWeekIndex, serviceById } from '@/lib/serviceSchedule';
import { getHANAServiceType, getYouthServiceType } from '@/lib/scheduleUtils';
import { buildServiceCalendar } from '@/lib/ics';

/**
 * Independent cross-checks of the calendar against the schedule the site
 * already publishes, and against the wall clock a congregant will read.
 *
 * These earned their place: the "DTSTART day matches BYDAY" check below is
 * what caught the morning prayer being anchored on Monday while its rule said
 * Tuesday, a bug that only appeared from the second week of the download and
 * only for a service early enough to cross midnight UTC.
 */

const WIB_OFFSET_MS = 7 * 3_600_000;
const DAY_NAMES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

/** Parses `DTSTART;TZID=Asia/Jakarta:20261020T050000` into its parts. */
function parseZonedStart(ics: string) {
  const m = ics.match(/DTSTART;TZID=([^:]+):(\d{8})T(\d{6})/);
  if (!m) return null;
  const [, tzid, date, time] = m;
  return {
    tzid,
    y: Number(date.slice(0, 4)),
    mo: Number(date.slice(4, 6)) - 1,
    d: Number(date.slice(6, 8)),
    h: Number(time.slice(0, 2)),
    mi: Number(time.slice(2, 4)),
  };
}

/** The weekday named by a local-time stamp, in that stamp's own frame. */
function weekdayOfLocalStamp(p: { y: number; mo: number; d: number }): string {
  return DAY_NAMES[new Date(Date.UTC(p.y, p.mo, p.d)).getUTCDay()];
}

describe('calendar cycle agrees with the published countdown, a full year', () => {
  it('names the same Friday service the site already tells congregants', () => {
    const disagreements: string[] = [];

    for (let week = 0; week < 52; week += 1) {
      const friday = new Date(Date.UTC(2026, 8, 4 + week * 7, 10, 30)); // 17.30 WIB
      const published = getHANAServiceType(friday).serviceType;
      const index = cycleWeekIndex(friday, '2026-09-04');
      const fromCalendar = index === 0 || index === 2 ? 'hana' : 'komsel-hana';

      if (published !== fromCalendar) {
        disagreements.push(`${friday.toISOString()}: ${published} vs ${fromCalendar}`);
      }
    }

    expect(disagreements).toEqual([]);
  });

  it('names the same Saturday service', () => {
    const disagreements: string[] = [];

    for (let week = 0; week < 52; week += 1) {
      const saturday = new Date(Date.UTC(2026, 7, 29 + week * 7, 11, 0)); // 18.00 WIB
      const published = getYouthServiceType(saturday).serviceType;
      const index = cycleWeekIndex(saturday, '2026-08-29');
      const fromCalendar = index === 0 || index === 2 ? 'youth' : 'komsel-youth';

      if (published !== fromCalendar) {
        disagreements.push(`${saturday.toISOString()}: ${published} vs ${fromCalendar}`);
      }
    }

    expect(disagreements).toEqual([]);
  });
});

describe('the anchor day, the rule day, and the wall clock all agree', () => {
  it('keeps every DTSTART on a BYDAY, judged in the anchor own timezone', () => {
    const services = [
      'ibadah-raya',
      'coc-kidz',
      'doa-pagi',
      'grow-generation',
      'komsel-generasi-muda',
      'hana',
      'komsel-ekklesia',
    ];

    const problems: string[] = [];

    // Download across eight days at seven-hour steps, so every combination of
    // weekday and time-of-day gets exercised; an anchoring bug shows on some
    // days and not others.
    for (let hour = 0; hour < 24 * 8; hour += 7) {
      const now = new Date(Date.UTC(2026, 9, 12, hour));

      for (const id of services) {
        const service = serviceById(id)!;
        const ics = buildServiceCalendar(service, { now });

        const start = parseZonedStart(ics);
        const byday = ics.match(/BYDAY=([A-Z,]+)/);

        if (!start || !byday) {
          problems.push(`${id} @ ${now.toISOString()}: no DTSTART or BYDAY`);
          continue;
        }

        // The rule is evaluated in the frame DTSTART declares. This is the
        // assertion that would have caught a UTC/WIB mismatch.
        const actualDay = weekdayOfLocalStamp(start);
        if (!byday[1].split(',').includes(actualDay)) {
          problems.push(
            `${id} @ ${now.toISOString()}: DTSTART is ${actualDay} in ${start.tzid} but BYDAY=${byday[1]}`,
          );
        }

        // And the anchor must not already be over.
        const startMs =
          Date.UTC(start.y, start.mo, start.d, start.h, start.mi) - WIB_OFFSET_MS;
        if (startMs < now.getTime() - 60_000) {
          problems.push(
            `${id} @ ${now.toISOString()}: anchor ${new Date(startMs).toISOString()} is in the past`,
          );
        }
      }
    }

    expect(problems).toEqual([]);
  });

  it('anchors the morning prayer on the WIB day it is named after', () => {
    // Sunday 18 Oct 2026, midday WIB. The next prayer is Tuesday the 20th at
    // 05.00 WIB, which is Monday 22.00 UTC. The file must say Tuesday.
    const ics = buildServiceCalendar(serviceById('doa-pagi')!, {
      now: new Date('2026-10-18T05:00:00Z'),
    });

    expect(ics).toContain('DTSTART;TZID=Asia/Jakarta:20261020T050000');
    expect(parseZonedStart(ics)!.tzid).toBe('Asia/Jakarta');
    expect(weekdayOfLocalStamp(parseZonedStart(ics)!)).toBe('TU');
    expect(ics).toContain('BYDAY=TU,WE,TH,FR');
  });
});

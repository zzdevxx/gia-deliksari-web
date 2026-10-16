import type { WeeklyService } from './ics';

/**
 * The weekly service schedule, in one place.
 *
 * It lives here rather than inline in `/info` because the calendar downloads,
 * the alternating-week logic, and any future "next service" widget all have to
 * agree. Two copies of "Youth is Saturday 18.00" is two copies that can drift,
 * and a schedule that disagrees with itself is worse than no schedule.
 */

export const CHURCH_LOCATION =
  'GIA Deliksari, Jl. Kolonel Hadijanto, Deliksari, Gunungpati, Semarang 50229';

const DAY_MS = 86_400_000;
const WIB_OFFSET_MS = 7 * 3_600_000;

/**
 * The 4-week cycle index (0-3) for an instant, counted in WIB civil days.
 *
 * This deliberately does not reuse `getCycleWeek` from `scheduleUtils`. That
 * helper normalizes with `setHours(0, 0, 0, 0)`, which reads the *host's*
 * timezone: the Workers runtime is UTC while a congregant's phone is WIB, so
 * the same instant can land on two different civil dates and the two sides can
 * disagree about whether this Saturday is a Youth week. It happens to agree
 * today only because every alternating service is in the afternoon, where the
 * UTC and WIB dates coincide. Counting days in UTC over a WIB-shifted instant
 * removes the coincidence.
 */
export function cycleWeekIndex(instant: Date, referenceIso: string): number {
  const referenceMs = Date.parse(`${referenceIso}T00:00:00Z`);
  const civilMs = Math.floor((instant.getTime() + WIB_OFFSET_MS) / DAY_MS) * DAY_MS;
  const weeks = Math.floor((civilMs - referenceMs) / (7 * DAY_MS));
  return ((weeks % 4) + 4) % 4;
}

/**
 * True when `candidate` lands on a cycle week this service runs.
 *
 * Both halves of an alternating pair need their own predicate. A calendar
 * cannot express "every other week, but offset" in one rule, so each half is
 * emitted as its own weekly event; the predicate is what stops the two from
 * both claiming the same Saturday.
 *
 * Once the first occurrence is anchored, `INTERVAL=2` keeps that parity for
 * every later week on its own, so the predicate only has to accept the right
 * two of the four cycle weeks.
 */
function alternatesOn(activeIndexes: readonly number[], referenceIso: string) {
  return (candidate: Date) =>
    activeIndexes.includes(cycleWeekIndex(candidate, referenceIso));
}

// Cycle weeks 1 and 3 are index 0 and 2; weeks 2 and 4 are index 1 and 3.
const FIRST_AND_THIRD = [0, 2] as const;
const SECOND_AND_FOURTH = [1, 3] as const;

const youthWeek = alternatesOn(FIRST_AND_THIRD, '2026-08-29'); // Sat 29 Aug 2026 = Youth
const hanaWeek = alternatesOn(FIRST_AND_THIRD, '2026-09-04'); // Fri 4 Sep 2026 = HANA

export const WEEKLY_SERVICES: WeeklyService[] = [
  {
    id: 'ibadah-raya',
    title: 'Ibadah Raya GIA Deliksari',
    description:
      'Ibadah persekutuan seluruh jemaat dengan firman penggembalaan dan perjamuan kudus.',
    location: CHURCH_LOCATION,
    weekdays: [0], // Minggu
    startHour: 9,
    startMinute: 0,
    endHour: 11,
    endMinute: 0,
  },
  {
    id: 'coc-kidz',
    title: 'COC Kidz (Sekolah Minggu)',
    description:
      'Ibadah anak balita sampai SD dengan pujian sukacita dan aktivitas firman kreatif.',
    location: `${CHURCH_LOCATION} (Ruang Bethel)`,
    weekdays: [0],
    startHour: 9,
    startMinute: 30,
    endHour: 10,
    endMinute: 30,
  },
  {
    id: 'doa-pagi',
    title: 'Ibadah Doa Pagi',
    description: 'Doa pagi bersama, onsite di gedung gereja atau online via Zoom.',
    location: CHURCH_LOCATION,
    weekdays: [2, 3, 4, 5], // Selasa sampai Jumat
    startHour: 5,
    startMinute: 0,
    endHour: 5,
    endMinute: 30,
  },
  {
    id: 'grow-generation',
    title: 'Grow Generation Youth',
    description:
      'Ibadah pemuda dan remaja. Berjalan selang-seling 4 minggu dengan Komsel Generasi Muda.',
    location: `${CHURCH_LOCATION} (Ruang Bethel)`,
    weekdays: [6], // Sabtu
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    intervalWeeks: 2,
    occursOn: youthWeek,
  },
  {
    id: 'komsel-generasi-muda',
    title: 'Komsel Generasi Muda',
    description:
      'Komsel persekutuan pemuda, selang-seling 4 minggu dengan Grow Generation Youth.',
    location: CHURCH_LOCATION,
    weekdays: [6],
    startHour: 18,
    startMinute: 0,
    endHour: 20,
    endMinute: 0,
    intervalWeeks: 2,
    occursOn: (candidate) => !youthWeek(candidate),
  },
  {
    id: 'hana',
    title: 'Ibadah Wanita HANA',
    description: 'Persekutuan wanita HANA. Selang-seling 4 minggu dengan Komsel Ekklesia.',
    location: CHURCH_LOCATION,
    weekdays: [5], // Jumat
    startHour: 17,
    startMinute: 30,
    endHour: 19,
    endMinute: 0,
    intervalWeeks: 2,
    occursOn: hanaWeek,
  },
  {
    id: 'komsel-ekklesia',
    title: 'Komsel Ekklesia',
    description: 'Komsel wanita, selang-seling 4 minggu dengan Ibadah Wanita HANA.',
    location: CHURCH_LOCATION,
    weekdays: [2], // Selasa
    startHour: 18,
    startMinute: 30,
    endHour: 20,
    endMinute: 0,
    intervalWeeks: 2,
    occursOn: (candidate) => !hanaWeek(candidate),
  },
];

/** Lookup by id, for wiring a button to a single service. */
export function serviceById(id: string): WeeklyService | undefined {
  return WEEKLY_SERVICES.find((service) => service.id === id);
}

/**
 * Today's running service in WIB, or null.
 *
 * Compares instants rather than clock strings so a service is "now" for its
 * whole duration, including the 18.00 to 20.00 Youth evening, instead of only
 * at the minute it starts.
 */
export function currentService(now: Date): WeeklyService | null {
  const civilMs = Math.floor((now.getTime() + WIB_OFFSET_MS) / DAY_MS) * DAY_MS;
  const weekday = new Date(civilMs).getUTCDay();

  for (const service of WEEKLY_SERVICES) {
    if (!service.weekdays.includes(weekday)) continue;
    if (service.occursOn && !service.occursOn(now)) continue;

    const startsAt =
      civilMs + service.startHour * 3_600_000 + service.startMinute * 60_000 - WIB_OFFSET_MS;
    const endsAt =
      civilMs + service.endHour * 3_600_000 + service.endMinute * 60_000 - WIB_OFFSET_MS;

    if (now.getTime() >= startsAt && now.getTime() < endsAt) return service;
  }

  return null;
}

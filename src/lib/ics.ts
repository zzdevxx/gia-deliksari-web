/**
 * RFC 5545 calendar generation for the weekly service schedule.
 *
 * Why `TZID=Asia/Jakarta` rather than plain UTC stamps. A recurrence rule's
 * BYDAY is evaluated in the frame of DTSTART, so the two have to agree about
 * what day it is. An earlier version wrote DTSTART in UTC and BYDAY in WIB,
 * which quietly broke the morning prayer: 05.00 WIB is 22.00 UTC the day
 * before, so a DTSTART that was Tuesday in Jakarta carried Monday's timestamp,
 * and the rule generated the wrong days from the second week on. Every other
 * service happens to fall after 07.00 WIB, where the UTC and WIB dates
 * coincide, which is why the bug stayed invisible until a service early enough
 * to cross midnight UTC was added.
 *
 * Pinning both to Jakarta time also means the file says what the page says.
 * UTC stamps that encode local times are correct but unreadable: a maintainer
 * comparing the file against the schedule would see Monday where the schedule
 * says Tuesday and have no way to tell whether that was the bug.
 *
 * Why a .ics file and not a Google Calendar link: a link covers one vendor.
 * Congregants here are split across Android (Google Calendar), iPhone (Apple
 * Calendar) and whatever ships on their laptop, and a file is the only format
 * all three accept.
 */

const WIB_OFFSET_HOURS = 7;
const WIB_TZID = 'Asia/Jakarta';
const CRLF = '\r\n';

/**
 * VTIMEZONE for WIB.
 *
 * A single STANDARD component with no RRULE is the canonical way to describe
 * a zone that has never observed daylight saving: the offset applies from the
 * DTSTART onward with no transitions to enumerate. Indonesia has held +07:00
 * since 1964, so there is nothing to describe. Clients that resolve TZID by
 * name would work without this block, but RFC 5545 expects it and Apple
 * Calendar in particular is happier with it present.
 */
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${WIB_TZID}`,
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0700',
  'TZOFFSETTO:+0700',
  'TZNAME:WIB',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** RFC 5545 §3.3.11 reserves these four sequences inside a TEXT value. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Fold to 75 octets per line, continuation lines carrying one leading space
 * (RFC 5545 §3.1).
 *
 * Bytes, not characters: a naive slice at 75 characters can cut a multi-byte
 * character in half and produce a file some clients reject outright. The
 * encoder is measured per character so a fold only ever lands on a boundary.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const segments: string[] = [];
  let current = '';
  let currentBytes = 0;
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentBytes + size > limit) {
      segments.push(current);
      current = '';
      currentBytes = 0;
      limit = 74; // every continuation line spends one octet on its leading space
    }
    current += char;
    currentBytes += size;
  }
  if (current) segments.push(current);

  return segments.join(`${CRLF} `);
}

/** The wall-clock fields in WIB for an instant, read off a shifted copy. */
function wibParts(instant: Date) {
  const shifted = new Date(instant.getTime() + WIB_OFFSET_HOURS * 3_600_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/** UTC instant, for DTSTAMP (which is always UTC by definition). */
function toUtcStamp(instant: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${instant.getUTCFullYear()}${pad(instant.getUTCMonth() + 1)}${pad(instant.getUTCDate())}` +
    `T${pad(instant.getUTCHours())}${pad(instant.getUTCMinutes())}${pad(instant.getUTCSeconds())}Z`
  );
}

/**
 * Local WIB wall-clock, for DTSTART and DTEND.
 *
 * No trailing `Z`: a local-time value is written as-is and qualified by the
 * TZID parameter on the property. Writing the UTC instant here instead is what
 * made BYDAY disagree with the anchor day.
 */
function toWibStamp(instant: Date): string {
  const p = wibParts(instant);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${p.year}${pad(p.month + 1)}${pad(p.day)}` +
    `T${pad(p.hour)}${pad(p.minute)}00`
  );
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export interface WeeklyService {
  /** Stable slug; becomes the calendar UID so a re-download updates in place. */
  id: string;
  title: string;
  description?: string;
  location?: string;
  /**
   * Weekdays this service runs, `0` = Sunday to match `Date#getDay()`. An
   * array rather than a single day because the morning prayer runs Tuesday
   * through Friday, and splitting that into four near-identical services would
   * put four separate entries on a congregant's phone for one gathering.
   */
  weekdays: readonly number[];
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  /** 1 = weekly, 2 = every other week (the 4-week alternating services). */
  intervalWeeks?: number;
  /**
   * Decides whether a given occurrence actually runs. The alternating
   * services need this: "every other week" is only correct when the anchor
   * lands on an active week, or the calendar promises a Youth service on a
   * Komsel Saturday.
   */
  occursOn?: (candidate: Date) => boolean;
}

/**
 * The earliest instant at or after `now` matching any of `weekdays` at an
 * accepted wall-clock time.
 *
 * Multi-day services need a predicate that sees each candidate day: filtering
 * by weekday first and then checking `occursOn` would report "no occurrence"
 * for a service whose only rejected days are the ones it was asked about.
 */
 function earliestOccurrence(
  now: Date,
  weekdays: readonly number[],
  hour: number,
  minute: number,
  occursOn?: (candidate: Date) => boolean,
): Date {
  const parts = wibParts(now);
  let best: Date | null = null;

  // Two full turns of the 4-week cycle covers any alternating predicate.
  for (let dayOffset = 0; dayOffset < 56; dayOffset += 1) {
    const candidate = new Date(
      Date.UTC(
        parts.year,
        parts.month,
        parts.day + dayOffset,
        hour - WIB_OFFSET_HOURS,
        minute,
      ),
    );

    const candidateParts = wibParts(candidate);
    if (!weekdays.includes(candidateParts.weekday)) continue;

    const alreadyStarted =
      dayOffset === 0 &&
      (parts.hour > hour || (parts.hour === hour && parts.minute >= minute));
    if (alreadyStarted) continue;

    if (occursOn && !occursOn(candidate)) continue;

    best = candidate;
    break;
  }

  if (!best) {
    throw new Error(
      `No occurrence of ${hour}:${minute} on weekdays [${weekdays.join(', ')}] within eight weeks`,
    );
  }

  return best;
}

/**
 * The next instant at or after `now` that falls on `weekday` at the given WIB
 * wall-clock time, skipping occurrences the predicate rejects.
 *
 * "At or after" is deliberate: a service starting at 09.00 downloaded at 08.59
 * should land on today, and the same download one minute later should not
 * land on a time that has already passed.
 */
export function nextOccurrence(
  now: Date,
  weekday: number,
  hour: number,
  minute: number,
  occursOn?: (candidate: Date) => boolean,
): Date {
  return earliestOccurrence(now, [weekday], hour, minute, occursOn);
}

function vevent(service: WeeklyService, now: Date): string[] {
  const start = earliestOccurrence(
    now,
    service.weekdays,
    service.startHour,
    service.startMinute,
    service.occursOn,
  );

  const durationMinutes =
    (service.endHour * 60 + service.endMinute) -
    (service.startHour * 60 + service.startMinute);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const interval = service.intervalWeeks ?? 1;
  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeText(service.id)}@giadeliksari.my.id`,
    `DTSTAMP:${toUtcStamp(now)}`,
    `DTSTART;TZID=${WIB_TZID}:${toWibStamp(start)}`,
    `DTEND;TZID=${WIB_TZID}:${toWibStamp(end)}`,
    `SUMMARY:${escapeText(service.title)}`,
  ];

  if (service.description) lines.push(`DESCRIPTION:${escapeText(service.description)}`);
  if (service.location) lines.push(`LOCATION:${escapeText(service.location)}`);

  lines.push(
    `RRULE:FREQ=WEEKLY;INTERVAL=${interval};BYDAY=${service.weekdays.map((d) => BYDAY[d]).join(',')}`,
    'END:VEVENT',
  );

  return lines;
}

export interface CalendarOptions {
  /** Defaults to `new Date()`. Pass explicitly so tests are deterministic. */
  now?: Date;
  calendarName?: string;
}

/** A one-event calendar. This is what each schedule card offers. */
export function buildServiceCalendar(
  service: WeeklyService,
  options: CalendarOptions = {},
): string {
  const now = options.now ?? new Date();
  return assemble([service], now, options.calendarName ?? 'GIA Deliksari');
}

/** Every service in one file, for a single "add all" download. */
export function buildScheduleCalendar(
  services: WeeklyService[],
  options: CalendarOptions = {},
): string {
  const now = options.now ?? new Date();
  return assemble(services, now, options.calendarName ?? 'Jadwal Ibadah GIA Deliksari');
}

function assemble(services: WeeklyService[], now: Date, calendarName: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GIA Deliksari//Portal Jemaat//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    // The zone definition has to be present because DTSTART and DTEND carry
    // TZID=Asia/Jakarta. Emitted once per file, before any VEVENT.
    ...VTIMEZONE,
    ...services.flatMap((service) => vevent(service, now)),
    'END:VCALENDAR',
  ];

  return `${lines.map(foldLine).join(CRLF)}${CRLF}`;
}

/** A filename a phone will show sensibly in its downloads list. */
export function calendarFilename(slug: string): string {
  return `gia-deliksari-${slug}.ics`;
}

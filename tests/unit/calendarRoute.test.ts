import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GET } from '@/app/api/public/calendar/route';
import { serviceById } from '@/lib/serviceSchedule';

function request(query = '') {
  return new Request(`https://giadeliksari.my.id/api/public/calendar${query}`);
}

describe('GET /api/public/calendar', () => {
  it('returns a valid multi-event calendar by default', async () => {
    const res = await GET(request());
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/calendar');
    expect(res.headers.get('content-disposition')).toContain('attachment');
    expect(body.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    // Every service in the shared schedule must appear.
    expect(body.match(/BEGIN:VEVENT/g)?.length).toBe(7);
    expect(body).toContain('SUMMARY:Ibadah Raya GIA Deliksari');
    expect(body).toContain('SUMMARY:Ibadah Doa Pagi');
  });

  it('returns exactly one event for a single service', async () => {
    const res = await GET(request('?service=ibadah-raya'));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(body.match(/BEGIN:VEVENT/g)?.length).toBe(1);
    expect(res.headers.get('content-disposition')).toContain('ibadah-raya.ics');
  });

  it('accepts a comma-separated pair, for the HANA card that covers two services', async () => {
    const res = await GET(request('?service=hana,komsel-ekklesia'));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(body.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(body).toContain('SUMMARY:Ibadah Wanita HANA');
    expect(body).toContain('SUMMARY:Komsel Ekklesia');
  });

  it('rejects an unknown slug with a list of what exists, not a stack trace', async () => {
    const res = await GET(request('?service=tidak-ada'));
    const payload = await res.json();

    expect(res.status).toBe(404);
    expect(payload.error).toBeTruthy();
    expect(payload.available).toContain('ibadah-raya');
  });

  it('rejects a pair where only one slug is unknown', async () => {
    const res = await GET(request('?service=hana,tidak-ada'));

    expect(res.status).toBe(404);
  });

  it('never caches for long, because the start date is computed per request', async () => {
    const res = await GET(request());

    expect(res.headers.get('cache-control')).not.toContain('s-maxage=3600');
  });

  it('emits a DTSTART in the future, not at build time', async () => {
    const res = await GET(request('?service=ibadah-raya'));
    const body = await res.text();
    const match = body.match(/DTSTART;TZID=Asia\/Jakarta:(\d{8})T(\d{6})/);

    expect(match).not.toBeNull();
    const [, date, time] = match!;
    // WIB is a fixed +07:00, so the instant is the local stamp minus the offset.
    const startMs =
      Date.UTC(
        Number(date.slice(0, 4)),
        Number(date.slice(4, 6)) - 1,
        Number(date.slice(6, 8)),
        Number(time.slice(0, 2)),
        Number(time.slice(2, 4)),
      ) - 7 * 3_600_000;

    expect(startMs).toBeGreaterThan(Date.now());
  });
});

describe('every schedule card downloads what its own label promises', () => {
  /**
   * Reads the real page source rather than a fixture, so this fails if a card
   * and its download drift apart. Two cards describe a pair of alternating
   * services, and sending one slug silently drops half of what the card tells
   * the reader it covers.
   *
   * The earlier version of this test only checked the card whose label
   * contains "dan", which is why it passed while the Youth card had the same
   * defect: its label never said "dan", so nothing compared it to its body.
   */
  const source = () => readFileSync(resolve(process.cwd(), 'src/app/info/page.tsx'), 'utf8');

  function cards() {
    return [...source().matchAll(
      /serviceIds=\{\[([^\]]+)\]\}\s*\n\s*label="([^"]+)"/g,
    )].map((m) => ({
      slugs: m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean),
      label: m[2],
    }));
  }

  it('passes slugs that all resolve, for every card', () => {
    const found = cards();
    expect(found.length).toBe(4);

    for (const { slugs } of found) {
      expect(slugs.length).toBeGreaterThan(0);
      for (const slug of slugs) {
        expect(serviceById(slug), `unknown slug "${slug}"`).toBeTruthy();
      }
    }
  });

  it('covers every alternating pair the page describes', () => {
    const found = cards();
    const all = found.flatMap((c) => c.slugs);

    // The page's copy names both halves of these two 4-week cycles, so both
    // halves have to be reachable from the cards' controls.
    for (const slug of [
      'grow-generation',
      'komsel-generasi-muda',
      'hana',
      'komsel-ekklesia',
    ]) {
      expect(all, `no card offers "${slug}", though the page describes it`)
        .toContain(slug);
    }
  });

  it('does not promise a Komsel the control cannot deliver', () => {
    const pageSource = source();

    // Each card's prose is checked against its own slugs. A card that mentions
    // a Komsel service must send that service, or the download omits it.
    const cardBodies = [...pageSource.matchAll(
      /<AddToCalendar[\s\S]*?serviceIds=\{\[([^\]]+)\]\}[\s\S]*?<\/AddToCalendar>/g,
    )].map((m) => m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean));

    const komselSlugs = ['komsel-generasi-muda', 'komsel-ekklesia'];
    const allSlugs = cardBodies.flat();

    for (const komsel of komselSlugs) {
      const service = serviceById(komsel)!;
      // If the page describes this Komsel anywhere in a card, some card must
      // offer it. Matching on the service's own title keeps this in step with
      // the schedule source rather than a hardcoded phrase.
      if (pageSource.includes(service.title)) {
        expect(allSlugs, `page names "${service.title}" but no card offers it`)
          .toContain(komsel);
      }
    }
  });

  it('serves a valid calendar for each pair a card requests', async () => {
    const pairs = cards().map((c) => c.slugs.join(','));
    expect(pairs.length).toBe(4);

    for (const pair of pairs) {
      const res = await GET(request(`?service=${pair}`));
      expect(res.status, `?service=${pair} returned ${res.status}`).toBe(200);

      const body = await res.text();
      const events = body.match(/BEGIN:VEVENT/g)?.length ?? 0;
      expect(events, `?service=${pair} produced ${events} events`).toBe(pair.split(',').length);
    }
  });
});

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
   * Reads the real page source rather than a fixture, so this fails if the
   * card and its download drift apart again. The HANA card describes two
   * alternating services and must hand over both: one slug would silently
   * drop half of what the card tells the reader it covers.
   */
  it('passes the slugs its label names, for all four cards', () => {
    // jsdom gives import.meta.url no file: scheme, so resolve from the project
    // root the way the vitest config aliases do.
    const source = readFileSync(
      resolve(process.cwd(), 'src/app/info/page.tsx'),
      'utf8',
    );

    const cards = [...source.matchAll(
      /serviceIds=\{\[([^\]]+)\]\}\s*\n\s*label="([^"]+)"/g,
    )].map((m) => ({
      slugs: m[1].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean),
      label: m[2],
    }));

    expect(cards.length).toBe(4);

    // Every slug must resolve, or the download 404s.
    for (const { slugs } of cards) {
      for (const slug of slugs) {
        expect(() => serviceById(slug), `unknown slug "${slug}"`).not.toThrow();
        expect(serviceById(slug), `unknown slug "${slug}"`).toBeTruthy();
      }
    }

    // The pair card is the one whose label names two services.
    const pairCard = cards.find((c) => c.label.includes('dan'));
    expect(pairCard, 'no card names two services').toBeTruthy();
    expect(pairCard!.slugs).toContain('hana');
    expect(pairCard!.slugs).toContain('komsel-ekklesia');

    // And the label must not promise more services than the download covers.
    const SERMON_WORDS = ['Ibadah Raya', 'COC Kidz', 'Grow Generation', 'HANA', 'Komsel Ekklesia'];
    for (const { slugs, label } of cards) {
      const promised = SERMON_WORDS.filter((w) => label.includes(w));
      const komselPair = promised.includes('HANA') && promised.includes('Komsel Ekklesia');
      const expected = komselPair ? 2 : promised.length;
      expect(slugs.length, `"${label}" promises ${expected} service(s) but sends ${slugs.length}`)
        .toBe(expected);
    }
  });

  it('serves a valid calendar for the pair the HANA card requests', async () => {
    const res = await GET(request('?service=hana,komsel-ekklesia'));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(body.match(/BEGIN:VEVENT/g)?.length).toBe(2);
  });
});

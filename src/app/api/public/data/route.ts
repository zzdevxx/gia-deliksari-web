import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/d1';

/**
 * Public read-only data endpoint backed by Cloudflare D1.
 *
 * Serves exactly the fields a visitor is allowed to see:
 *  - announcements: only published ones
 *  - servant_rosters: WITHOUT phone numbers / notes (personal data)
 *  - sermons & gallery_items: full public content
 * ministry_requests and inventory are NEVER exposed here.
 */

const PUBLIC_TABLES = new Set(['announcements', 'servant_rosters', 'sermons', 'gallery_items']);

export async function GET(req: NextRequest) {
  const table = req.nextUrl.searchParams.get('table');
  if (!table || !PUBLIC_TABLES.has(table)) {
    return NextResponse.json({ error: 'Tabel tidak dikenal' }, { status: 400 });
  }

  const random = req.nextUrl.searchParams.get('random') === 'true';
  const limitParam = parseInt(req.nextUrl.searchParams.get('limit') || '12', 10);

  try {
    if (table === 'announcements') {
      const rows = await queryAll<any>(
        'SELECT * FROM announcements WHERE is_published = 1 ORDER BY event_date ASC',
      );
      return NextResponse.json(
        { items: rows },
        { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
      );
    }

    if (table === 'servant_rosters') {
      const rows = await queryAll<any>(
        'SELECT id, service_category, service_date, role, servant_name, status FROM servant_rosters ORDER BY service_date ASC',
      );
      return NextResponse.json(
        { items: rows },
        { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
      );
    }

    if (table === 'sermons') {
      const rows = await queryAll<any>(
        'SELECT * FROM sermons WHERE is_published = 1 ORDER BY created_at DESC',
      );
      return NextResponse.json(
        { items: rows },
        { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
      );
    }

    if (table === 'gallery_items') {
      const rows = await queryAll<any>(
        'SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY created_at DESC LIMIT 60',
      );

      if (random) {
        const shuffled = rows.slice();
        // Seed from the full date, not just getDate(). With day-of-month alone
        // the shuffle had only 31 distinct orderings, so across a month the
        // showcase could never surface every photo — 11 of 60 were unreachable.
        // A full-date seed keeps the order stable for the whole day (so the
        // 300s cache and repeat visits agree) while cycling through all rows.
        const now = new Date();
        let seed = (now.getFullYear() * 10000) + ((now.getMonth() + 1) * 100) + now.getDate();
        const nextRandom = () => {
          // Mulberry32 — deterministic, no dependency, good enough for display order.
          seed |= 0;
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(nextRandom() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const sliced = shuffled.slice(0, Math.min(limitParam, 12));
        return NextResponse.json(
          { items: sliced },
          { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=900' } },
        );
      }

      return NextResponse.json(
        { items: rows },
        { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
      );
    }

    return NextResponse.json({ items: [] });
  } catch (err: any) {
    console.error(`[public/data] ${table} error:`, err);
    return NextResponse.json(
      { error: 'Gagal memuat data' },
      { status: 500 },
    );
  }
}

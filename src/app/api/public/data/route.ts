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
        for (let i = shuffled.length - 1; i > 0; i--) {
          const seed = (i * 9301 + 49297 + new Date().getDate()) % 233280;
          const j = seed % (i + 1);
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
      { error: 'Gagal memuat data', detail: err.message },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { execute, queryFirst } from '@/lib/d1';

/**
 * Public submission endpoint for prayer / sacrament / komsel / volunteer
 * requests backed by Cloudflare D1.
 */

const ALLOWED_TYPES = new Set(['prayer', 'sacrament', 'komsel', 'volunteer']);
const MAX_LENGTHS = { name: 120, phone: 32, message: 2000, subType: 80 };
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 5; // submissions per IP per window
const RL_TABLE = 'public_form_rate_limit';

/**
 * Per-IP throttle, persisted in D1.
 *
 * This was a module-scope Map, which on Cloudflare Workers is per-isolate: an
 * IP-rotating flood simply landed on fresh isolates with empty counters, so the
 * "5 per 10 minutes" limit did not hold. On an unauthenticated endpoint that
 * inserts rows pastoral staff then read, the effect was an unbounded queue that
 * real requests get buried under.
 */
let rlTableReady: Promise<void> | null = null;
function ensureRlTable(): Promise<void> {
  if (!rlTableReady) {
    rlTableReady = execute(
      `CREATE TABLE IF NOT EXISTS ${RL_TABLE} (
         ip TEXT PRIMARY KEY,
         hits TEXT NOT NULL DEFAULT '[]',
         updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
       )`,
    )
      .then(() => undefined)
      .catch((err) => {
        rlTableReady = null;
        throw err;
      });
  }
  return rlTableReady;
}

async function rateLimited(ip: string): Promise<boolean> {
  const now = Date.now();
  try {
    await ensureRlTable();
    const row = await queryFirst<{ hits: string }>(
      `SELECT hits FROM ${RL_TABLE} WHERE ip = ?`,
      [ip],
    );
    let list: number[] = [];
    if (row?.hits) {
      try {
        const parsed = JSON.parse(row.hits);
        if (Array.isArray(parsed)) list = parsed.filter((t) => typeof t === 'number');
      } catch {
        list = [];
      }
    }
    list = list.filter((t) => now - t < RATE_WINDOW_MS);
    if (list.length >= RATE_MAX) {
      return true;
    }
    list.push(now);
    await execute(
      `INSERT INTO ${RL_TABLE} (ip, hits, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(ip) DO UPDATE SET hits = excluded.hits, updated_at = excluded.updated_at`,
      [ip, JSON.stringify(list), new Date().toISOString()],
    );
    return false;
  } catch (err) {
    // Storage trouble must not block a genuine prayer request. Fail open and log.
    console.error('[ministry-requests] rate-limit check failed:', err);
    return false;
  }
}

function clean(value: unknown, maxLen: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : '';
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (await rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Terlalu banyak pengiriman. Coba lagi dalam beberapa menit.' },
      { status: 429 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 });
  }

  const type = clean(body.type, 20);
  const name = clean(body.name, MAX_LENGTHS.name);
  const phone = clean(body.phone, MAX_LENGTHS.phone);
  const message = clean(body.message, MAX_LENGTHS.message);
  const subType = clean(body.sub_type || body.subType, MAX_LENGTHS.subType);
  const needPastoralVisit = Boolean(body.need_pastoral_visit ?? body.needPastoralVisit);

  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: 'Jenis permohonan tidak dikenal' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi' }, { status: 400 });
  }

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO ministry_requests (
        id, type, name, phone, sub_type, message, need_pastoral_visit, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
      [
        id,
        type,
        name,
        phone,
        subType || null,
        message || null,
        needPastoralVisit ? 1 : 0,
        now,
      ],
    );

    return NextResponse.json({ success: true, persisted: true });
  } catch (err: any) {
    console.error('[public/ministry-requests] insert failed:', err);
    return NextResponse.json({ error: 'Gagal menyimpan permohonan' }, { status: 500 });
  }
}

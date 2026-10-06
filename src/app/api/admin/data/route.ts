import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getDb, queryAll, execute } from '@/lib/d1';

/**
 * Server-side mutation gateway for the admin portal backed by Cloudflare D1.
 *
 * Multi-role auth: requires session cookie with role in ['super', 'admin'].
 */

const TABLE_WHITELIST = [
  'announcements',
  'servant_rosters',
  'inventory_items',
  'sermons',
  'gallery_items',
  'ministry_requests',
] as const;

type TableName = (typeof TABLE_WHITELIST)[number];

const TABLE_COLUMNS: Record<TableName, Set<string>> = {
  announcements: new Set([
    'id', 'title', 'category', 'content', 'event_date',
    'is_pinned', 'is_published', 'badge_text', 'author', 'created_at',
  ]),
  servant_rosters: new Set([
    'id', 'service_category', 'service_date', 'role', 'servant_name',
    'phone', 'status', 'notes', 'created_at',
  ]),
  inventory_items: new Set([
    'id', 'name', 'category', 'code', 'quantity', 'is_checked',
    'condition', 'location', 'notes', 'last_checked_at', 'checked_by', 'created_at',
  ]),
  sermons: new Set([
    'id', 'title', 'speaker', 'passage', 'date', 'youtube_url',
    'thumbnail', 'category', 'is_published', 'created_at',
  ]),
  gallery_items: new Set([
    'id', 'title', 'category', 'image', 'thumb_url', 'drive_file_id',
    'drive_web_view_link', 'uploader_name', 'date', 'is_published', 'created_at',
  ]),
  ministry_requests: new Set([
    'id', 'type', 'name', 'phone', 'sub_type', 'message',
    'need_pastoral_visit', 'status', 'created_at',
  ]),
};

const MAX_ITEMS_PER_SAVE = 500;

function isValidTable(value: unknown): value is TableName {
  return typeof value === 'string' && (TABLE_WHITELIST as readonly string[]).includes(value);
}

export async function GET(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'admin']);
  if (guard instanceof Response) return guard;

  const table = req.nextUrl.searchParams.get('table');
  if (!isValidTable(table)) {
    return NextResponse.json({ error: 'Tabel tidak dikenal' }, { status: 400 });
  }

  try {
    const data = await queryAll(`SELECT * FROM ${table}`);
    return NextResponse.json({ table, items: data });
  } catch (err: any) {
    console.error(`[admin/data] GET ${table} failed:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'admin']);
  if (guard instanceof Response) return guard;

  let body: { table?: unknown; items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  const { table, items } = body;
  if (!isValidTable(table)) {
    return NextResponse.json({ error: 'Tabel tidak dikenal' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS_PER_SAVE) {
    return NextResponse.json(
      { error: `items harus array berisi 1-${MAX_ITEMS_PER_SAVE} baris` },
      { status: 400 },
    );
  }
  if (items.some((it) => typeof it !== 'object' || it === null || Array.isArray(it))) {
    return NextResponse.json({ error: 'Setiap item harus objek' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const allowedCols = TABLE_COLUMNS[table];

    const statements = items.map((item: Record<string, unknown>) => {
      const sanitizedRecord: Record<string, unknown> = {};
      const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : crypto.randomUUID();
      sanitizedRecord.id = id;

      for (const [k, v] of Object.entries(item)) {
        if (k === 'id') continue;
        if (!allowedCols.has(k)) continue; // Whitelist security: skip unknown/injection keys

        // SQLite booleans coercion
        if (typeof v === 'boolean') {
          sanitizedRecord[k] = v ? 1 : 0;
        } else {
          sanitizedRecord[k] = v;
        }
      }

      const keys = Object.keys(sanitizedRecord);
      const cols = keys.map((k) => `"${k}"`).join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const updates = keys
        .filter((k) => k !== 'id' && k !== 'created_at')
        .map((k) => `"${k}" = excluded."${k}"`)
        .join(', ');

      const values = Object.values(sanitizedRecord);

      const sql = updates.length > 0
        ? `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET ${updates}`
        : `INSERT OR IGNORE INTO ${table} (${cols}) VALUES (${placeholders})`;

      return db.prepare(sql).bind(...values);
    });

    await db.batch(statements);

    return NextResponse.json({ success: true, table, count: items.length });
  } catch (err: any) {
    console.error(`[admin/data] POST ${table} failed:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'admin']);
  if (guard instanceof Response) return guard;

  const table = req.nextUrl.searchParams.get('table');
  const id = req.nextUrl.searchParams.get('id');

  if (!isValidTable(table)) {
    return NextResponse.json({ error: 'Tabel tidak dikenal' }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 });
  }

  try {
    await execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, table, id });
  } catch (err: any) {
    console.error(`[admin/data] DELETE ${table} failed:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

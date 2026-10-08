import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { queryFirst } from '@/lib/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'admin']);
  if (guard instanceof Response) return guard;

  let d1Test: { ok: boolean; count?: number; error?: string } = { ok: false };
  try {
    const row = await queryFirst<{ count: number }>('SELECT count(*) as count FROM announcements');
    d1Test = { ok: true, count: row?.count ?? 0 };
  } catch (err: any) {
    d1Test = { ok: false, error: err.message || String(err) };
  }

  let r2Configured = false;
  try {
    const ctx = await getCloudflareContext({ async: true });
    r2Configured = Boolean(ctx?.env?.GALLERY_BUCKET);
  } catch {}

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    user: guard.username,
    database: 'Cloudflare D1 (gia-deliksari-db)',
    d1Test,
    r2Configured,
    environment: process.env.NODE_ENV || 'production',
  });
}

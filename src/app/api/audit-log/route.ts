import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { queryAll, queryFirst } from '@/lib/d1';

/**
 * GET /api/audit-log — read paginated audit entries backed by Cloudflare D1 (super only).
 */
export async function GET(req: NextRequest) {
  const guard = await requireRole(req, ['super']);
  if (guard instanceof Response) return guard;

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '50', 10) || 50, 200);
  const offset = Math.max(parseInt(req.nextUrl.searchParams.get('offset') || '0', 10) || 0, 0);
  const actor = req.nextUrl.searchParams.get('actor_username')?.trim();
  const action = req.nextUrl.searchParams.get('action')?.trim();
  const since = req.nextUrl.searchParams.get('since')?.trim();
  const until = req.nextUrl.searchParams.get('until')?.trim();

  try {
    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (actor) {
      whereClauses.push('actor_username = ?');
      params.push(actor);
    }
    if (action) {
      whereClauses.push('action = ?');
      params.push(action);
    }
    if (since) {
      whereClauses.push('created_at >= ?');
      params.push(`${since}T00:00:00.000Z`);
    }
    if (until) {
      whereClauses.push('created_at <= ?');
      params.push(`${until}T23:59:59.999Z`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = await queryFirst<{ total: number }>(
      `SELECT count(*) as total FROM audit_log ${whereSql}`,
      params,
    );

    const dataParams = [...params, limit, offset];
    const rows = await queryAll<any>(
      `SELECT id, actor_id, actor_username, actor_roles, action, target_table, target_id, summary, meta, ip, user_agent, source, created_at
       FROM audit_log
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      dataParams,
    );

    const items = rows.map((r) => ({
      ...r,
      actor_roles: typeof r.actor_roles === 'string' ? JSON.parse(r.actor_roles) : (r.actor_roles || []),
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : (r.meta || null),
    }));

    return NextResponse.json({
      items,
      total: countRow?.total ?? 0,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error('[audit-log] GET failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

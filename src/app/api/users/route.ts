import { NextRequest, NextResponse } from 'next/server';
import { requireRole, createUser, Role } from '@/lib/auth';
import { queryAll } from '@/lib/d1';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';

/**
 * GET /api/users — list all users (super only).
 * Returns: { items: User[] } where User.roles is an array.
 */
export async function GET(req: NextRequest) {
  const guard = await requireRole(req, ['super']);
  if (guard instanceof Response) return guard;

  try {
    const data = await queryAll<any>(
      'SELECT id, username, roles, display_name, active, last_login_at, created_at FROM users ORDER BY created_at ASC',
    );

    const items = data.map((r) => ({
      ...r,
      roles: typeof r.roles === 'string' ? JSON.parse(r.roles) : (r.roles || []),
      active: Boolean(r.active),
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('[users] GET failed:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

/**
 * POST /api/users — create a new user (super only).
 */
export async function POST(req: NextRequest) {
  const guard = await requireRole(req, ['super']);
  if (guard instanceof Response) return guard;

  let body: { username?: unknown; password?: unknown; roles?: unknown; display_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const rolesRaw = Array.isArray(body.roles) ? body.roles : [];
  const roles = rolesRaw.filter(
    (r): r is Role => r === 'super' || r === 'admin' || r === 'treasurer',
  );
  const display_name = typeof body.display_name === 'string' ? body.display_name.trim() || null : null;

  const result = await createUser({ username, password, roles, display_name });
  if (!result.ok) {
    const status = result.error.includes('sudah dipakai') ? 409 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  await logAudit({
    actor: { id: guard.id, username: guard.username, roles: guard.roles },
    action: 'user.create',
    target: { table: 'users', id: result.id, label: username },
    summary: `Membuat user '${username}' dengan roles [${roles.join(', ')}]`,
    meta: { roles, display_name },
    ctx: auditContextFromRequest(req),
  });

  return NextResponse.json({ success: true, id: result.id });
}

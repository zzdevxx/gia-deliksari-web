import { NextRequest, NextResponse } from 'next/server';
import { requireRole, hashPassword, Role } from '@/lib/auth';
import { queryFirst, execute } from '@/lib/d1';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';

/**
 * PATCH /api/users/[id] — update user (super only).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(req, ['super']);
  if (guard instanceof Response) return guard;

  const { id } = await params;

  let body: {
    roles?: unknown;
    display_name?: unknown;
    active?: unknown;
    password?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (Array.isArray(body.roles)) {
    const validRoles: Role[] = ['super', 'admin', 'treasurer'];
    const roles = Array.from(
      new Set((body.roles as unknown[]).filter((r): r is Role => validRoles.includes(r as Role))),
    );
    if (roles.length === 0) {
      return NextResponse.json({ error: 'Minimal 1 role valid' }, { status: 400 });
    }
    patch.roles = JSON.stringify(roles);
  }
  if (typeof body.display_name === 'string') {
    patch.display_name = body.display_name.trim() || null;
  }
  if (typeof body.active === 'boolean') {
    patch.active = body.active ? 1 : 0;
  }
  if (typeof body.password === 'string' && body.password.length >= 4) {
    patch.password_hash = await hashPassword(body.password);
  } else if (typeof body.password === 'string' && body.password.length > 0) {
    return NextResponse.json({ error: 'PIN/password minimal 4 karakter' }, { status: 400 });
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
  }

  try {
    const updates = Object.keys(patch).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(patch), id];

    await execute(`UPDATE users SET ${updates} WHERE id = ?`, values);

    const updatedUser = await queryFirst<any>(
      'SELECT id, username, roles, display_name, active, last_login_at, created_at FROM users WHERE id = ?',
      [id],
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const normalized = {
      ...updatedUser,
      roles: typeof updatedUser.roles === 'string' ? JSON.parse(updatedUser.roles) : (updatedUser.roles || []),
      active: Boolean(updatedUser.active),
    };

    const changes: Record<string, unknown> = {};
    if ('roles' in patch) changes.roles = normalized.roles;
    if ('display_name' in patch) changes.display_name = patch.display_name;
    if ('active' in patch) changes.active = Boolean(patch.active);
    if ('password_hash' in patch) changes.password_changed = true;

    await logAudit({
      actor: { id: guard.id, username: guard.username, roles: guard.roles },
      action: 'user.update',
      target: { table: 'users', id, label: normalized.username },
      summary: `Update user '${normalized.username}' (${Object.keys(changes).join(', ')})`,
      meta: { changes, target_username: normalized.username },
      ctx: auditContextFromRequest(req),
    });

    return NextResponse.json({ success: true, user: normalized });
  } catch (err: any) {
    console.error('[users/patch] failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id] — soft-deactivate (super only).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(req, ['super']);
  if (guard instanceof Response) return guard;

  const { id } = await params;

  try {
    const user = await queryFirst<any>('SELECT id, username FROM users WHERE id = ?', [id]);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    await execute('UPDATE users SET active = 0 WHERE id = ?', [id]);

    await logAudit({
      actor: { id: guard.id, username: guard.username, roles: guard.roles },
      action: 'user.deactivate',
      target: { table: 'users', id, label: user.username },
      summary: `Nonaktifkan user '${user.username}'`,
      ctx: auditContextFromRequest(req),
    });

    return NextResponse.json({ success: true, user: { id, username: user.username, active: false } });
  } catch (err: any) {
    console.error('[users/delete] failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

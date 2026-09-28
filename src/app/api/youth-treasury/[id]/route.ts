import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { queryFirst, execute } from '@/lib/d1';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';

/**
 * PATCH /api/youth-treasury/[id] — update a transaction.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(req, ['super', 'treasurer']);
  if (guard instanceof Response) return guard;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.transaction_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.transaction_date)) {
    patch.transaction_date = body.transaction_date;
  }
  if (typeof body.type === 'string' && ['income', 'expense'].includes(body.type)) {
    patch.type = body.type;
  }
  if (typeof body.category === 'string' && body.category.trim()) {
    patch.category = body.category.trim();
  }
  if (typeof body.amount === 'number' && body.amount > 0 && body.amount <= 1_000_000_000) {
    patch.amount = body.amount;
  }
  if (typeof body.description === 'string') {
    patch.description = body.description.trim() || null;
  }

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
  }

  try {
    const updates = Object.keys(patch).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(patch), id];

    await execute(`UPDATE youth_treasury_transactions SET ${updates} WHERE id = ?`, values);

    const transaction = await queryFirst<any>(
      'SELECT id, transaction_date, type, category, amount, description, created_by, created_at, updated_at FROM youth_treasury_transactions WHERE id = ?',
      [id],
    );

    const changes: Record<string, unknown> = {};
    for (const k of Object.keys(patch)) {
      if (k === 'updated_at') continue;
      changes[k] = patch[k];
    }

    await logAudit({
      actor: { id: guard.id, username: guard.username, roles: guard.roles },
      action: 'kas.update',
      target: { table: 'youth_treasury_transactions', id },
      summary: `Update transaksi kas (${Object.keys(changes).join(', ')})`,
      meta: { changes },
      ctx: auditContextFromRequest(req),
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    console.error('[youth-treasury/patch] failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/youth-treasury/[id] — hard-delete a transaction.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(req, ['super', 'treasurer']);
  if (guard instanceof Response) return guard;

  const { id } = await params;

  try {
    const snapshot = await queryFirst<any>(
      'SELECT transaction_date, type, category, amount FROM youth_treasury_transactions WHERE id = ?',
      [id],
    );

    await execute('DELETE FROM youth_treasury_transactions WHERE id = ?', [id]);

    await logAudit({
      actor: { id: guard.id, username: guard.username, roles: guard.roles },
      action: 'kas.delete',
      target: { table: 'youth_treasury_transactions', id },
      summary: snapshot
        ? `Hapus transaksi ${snapshot.type} Rp ${Number(snapshot.amount).toLocaleString('id-ID')} (${snapshot.category}, ${snapshot.transaction_date})`
        : `Hapus transaksi kas ${id}`,
      meta: snapshot ?? undefined,
      ctx: auditContextFromRequest(req),
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[youth-treasury/delete] failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

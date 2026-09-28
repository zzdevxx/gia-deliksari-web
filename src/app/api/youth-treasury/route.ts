import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { queryAll, queryFirst, execute } from '@/lib/d1';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';

/**
 * GET /api/youth-treasury — list transactions + aggregate balance backed by Cloudflare D1.
 */
export async function GET(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'treasurer']);
  if (guard instanceof Response) return guard;

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '200', 10) || 200, 1000);
  const type = req.nextUrl.searchParams.get('type');
  const since = req.nextUrl.searchParams.get('since');
  const until = req.nextUrl.searchParams.get('until');

  try {
    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (type === 'income' || type === 'expense') {
      whereClauses.push('type = ?');
      params.push(type);
    }
    if (since) {
      whereClauses.push('transaction_date >= ?');
      params.push(since);
    }
    if (until) {
      whereClauses.push('transaction_date <= ?');
      params.push(until);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    params.push(limit);

    const items = await queryAll<any>(
      `SELECT id, transaction_date, type, category, amount, description, created_by, created_at, updated_at
       FROM youth_treasury_transactions
       ${whereSql}
       ORDER BY transaction_date DESC, created_at DESC
       LIMIT ?`,
      params,
    );

    const balance = await queryFirst<any>(
      'SELECT total_income, total_expense, balance, income_count, expense_count FROM youth_treasury_balance',
    );

    return NextResponse.json({
      items: items ?? [],
      balance: balance ?? {
        total_income: 0,
        total_expense: 0,
        balance: 0,
        income_count: 0,
        expense_count: 0,
      },
    });
  } catch (err: any) {
    console.error('[youth-treasury] GET failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/youth-treasury — create a transaction.
 */
export async function POST(req: NextRequest) {
  const guard = await requireRole(req, ['super', 'treasurer']);
  if (guard instanceof Response) return guard;
  if (!(guard as any).id) return new Response(JSON.stringify({ error: 'No user' }), { status: 401 });

  let body: {
    transaction_date?: unknown;
    type?: unknown;
    category?: unknown;
    amount?: unknown;
    description?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  const transaction_date = typeof body.transaction_date === 'string' ? body.transaction_date : '';
  const type = body.type;
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const amount = typeof body.amount === 'number' ? body.amount : Number(body.amount);
  const description = typeof body.description === 'string' ? body.description.trim() || null : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction_date)) {
    return NextResponse.json({ error: 'transaction_date harus format YYYY-MM-DD' }, { status: 400 });
  }
  if (!['income', 'expense'].includes(type as string)) {
    return NextResponse.json({ error: 'type harus income | expense' }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: 'category wajib diisi' }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount harus angka > 0' }, { status: 400 });
  }
  if (amount > 1_000_000_000) {
    return NextResponse.json({ error: 'amount terlalu besar (maks Rp 1 milyar)' }, { status: 400 });
  }

  const user = guard as { id: string };
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await execute(
      `INSERT INTO youth_treasury_transactions (
        id, transaction_date, type, category, amount, description, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, transaction_date, type, category, amount, description, user.id, now, now],
    );

    const transaction = await queryFirst<any>(
      'SELECT id, transaction_date, type, category, amount, description, created_by, created_at FROM youth_treasury_transactions WHERE id = ?',
      [id],
    );

    await logAudit({
      actor: { id: user.id, username: guard.username, roles: guard.roles },
      action: 'kas.create',
      target: { table: 'youth_treasury_transactions', id },
      summary: `Catat ${type} Rp ${amount.toLocaleString('id-ID')} (${category})`,
      meta: { type, category, amount, transaction_date, description },
      ctx: auditContextFromRequest(req),
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    console.error('[youth-treasury] POST failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

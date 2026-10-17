import { execute } from './d1';
import type { Role } from './auth';

/**
 * Audit log writer for sensitive admin/super/kas actions.
 *
 * Logs go to the Cloudflare D1 `audit_log` table. Inserts are best-effort fire-and-forget:
 * the calling action MUST NOT be aborted by an audit failure — we swallow
 * errors after logging them.
 *
 * What to log:
 *   - User CRUD in /super (create / edit / soft-delete)
 *   - Admin CRUD in /admin (warta, roster, inventaris, khotbah, galeri mutations)
 *   - Kas mutations in /kas (create / update / delete transaction)
 *   - Auth events (failed login, lockout) — see lib/auth.ts
 *
 * What NOT to log here (privacy):
 *   - Read operations (SELECT)
 *   - Personal data contents (we log IDs + summary, not full bodies)
 *
 * Usage:
 *   await logAudit(req, {
 *     actor: user,
 *     action: 'warta.create',
 *     target: { table: 'announcements', id: data.id },
 *     summary: `Created announcement "${title}"`,
 *   });
 */

export type AuditAction =
  // user management
  | 'user.create'
  | 'user.update'
  | 'user.deactivate'
  | 'user.password_change'
  // admin CRUD
  | 'warta.create'
  | 'warta.update'
  | 'warta.delete'
  | 'warta.pin'
  | 'roster.create'
  | 'roster.update'
  | 'roster.delete'
  | 'inventory.update'
  | 'sermon.create'
  | 'sermon.update'
  | 'sermon.delete'
  | 'gallery.upload'
  | 'gallery.delete'
  | 'ministry_request.update'
  // kas
  | 'kas.create'
  | 'kas.update'
  | 'kas.delete'
  // auth
  | 'auth.login_success'
  | 'auth.login_failure'
  | 'auth.login_lockout'
  | 'auth.logout';

export interface AuditContext {
  /**
   * Origin identifier — useful when the same action runs from multiple surfaces.
   *
   * 'smoke' marks traffic produced by the CI smoke suite probing production.
   * Those attempts are real requests against the real server and are recorded
   * like any other, because a test must not be able to switch the audit trail
   * off. The label exists so an operator investigating a suspected brute-force
   * attempt can separate test probes from an actual attacker instead of
   * reading 85 rows of CI noise per day of logs.
   */
  source?: 'web' | 'api' | 'cron' | 'smoke';
  /** IP extracted from request headers (already-resolved). */
  ip?: string | null;
  /** UA header if relevant. */
  userAgent?: string | null;
}

export interface AuditEntry {
  /** The authenticated user performing the action. */
  actor: { id: string; username: string; roles: Role[] } | null;
  action: AuditAction;
  /** Free-form target descriptor — keep it small (table + id, no PII). */
  target?: { table?: string; id?: string; label?: string };
  /** Human-readable summary; safe to display in /super audit page. */
  summary: string;
  /** Arbitrary metadata (changeset, search filters, etc.). Avoid PII. */
  meta?: Record<string, unknown>;
  ctx?: AuditContext;
}

interface AuditLogRow {
  id?: string;
  actor_id: string | null;
  actor_username: string | null;
  actor_roles: string[] | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  summary: string;
  meta: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  source: string;
  created_at?: string;
}

/**
 * Write an audit log entry. Never throws — audit failure must not break the
 * underlying action. Returns true on success, false on any failure.
 */
export async function logAudit(entry: AuditEntry): Promise<boolean> {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO audit_log (
        id, actor_id, actor_username, actor_roles, action,
        target_table, target_id, summary, meta, ip, user_agent, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        entry.actor?.id ?? null,
        entry.actor?.username ?? null,
        entry.actor?.roles ? JSON.stringify(entry.actor.roles) : null,
        entry.action,
        entry.target?.table ?? null,
        entry.target?.id ?? null,
        entry.summary.slice(0, 500),
        entry.meta ? JSON.stringify(entry.meta) : null,
        entry.ctx?.ip ?? null,
        entry.ctx?.userAgent ? entry.ctx.userAgent.slice(0, 500) : null,
        entry.ctx?.source ?? 'api',
        now,
      ],
    );
    return true;
  } catch (err) {
    console.error('[auditLog] unexpected error:', err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Extract a normalized AuditContext from a NextRequest.
 * Resolves IP from Cloudflare cf-connecting-ip or standard proxy headers.
 */
export function auditContextFromRequest(
  req: { headers: { get(name: string): string | null } },
  source: AuditContext['source'] = 'api',
): AuditContext {
  const cfIp = req.headers.get('cf-connecting-ip');
  const fwd = req.headers.get('x-forwarded-for');
  const ip = cfIp ?? (fwd ? fwd.split(',')[0]?.trim() : null) ?? req.headers.get('x-real-ip');
  return {
    source,
    ip,
    userAgent: req.headers.get('user-agent'),
  };
}
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, D1Response } from '@cloudflare/workers-types';

/**
 * Cloudflare D1 Database client wrapper.
 * Provides unified access to D1 across production edge runtime,
 * local development (`next dev` with platform proxy), and test environments.
 */

let _mockDb: D1Database | null = null;

export function setMockDb(db: D1Database | null) {
  _mockDb = db;
}

export async function getDb(): Promise<D1Database> {
  if (_mockDb) return _mockDb;

  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DB) {
      return ctx.env.DB;
    }
  } catch (err) {
    // getCloudflareContext throws if called outside of cloudflare request context
  }

  // Fallback: check globalThis for test/mock bindings
  const globalEnv = (globalThis as unknown as { env?: { DB?: D1Database } })?.env;
  if (globalEnv?.DB) {
    return globalEnv.DB;
  }

  throw new Error(
    'Cloudflare D1 database binding `DB` is not available. Ensure wrangler.jsonc has the d1_databases binding configured.',
  );
}

/**
 * Execute a query and return all matching rows.
 */
export async function queryAll<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = await getDb();
  const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
  const result = await stmt.all<T>();
  return result.results || [];
}

/**
 * Execute a query and return the first matching row, or null.
 */
export async function queryFirst<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const db = await getDb();
  const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
  const result = await stmt.first<T>();
  return result ?? null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement.
 */
export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<D1Response> {
  const db = await getDb();
  const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
  return stmt.run();
}

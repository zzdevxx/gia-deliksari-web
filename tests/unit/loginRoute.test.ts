import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockDb } from '@/lib/d1';
import { POST } from '@/app/api/auth/login/route';
import { NextRequest } from 'next/server';

/**
 * Covers the login route's input bounds and rate-limit key construction.
 *
 * The route is the only public endpoint that writes to a fixed-size table
 * before verifying anything about the caller, so its input handling is the part
 * worth pinning. Before these tests the route had no unit coverage at all —
 * lockout behaviour was asserted only by the Playwright suite, which runs
 * against live production and therefore cannot test an oversized username
 * without writing a real oversized row into the real database.
 *
 * The assertion that matters most is the first one: an unbounded username used
 * to become an unbounded `login_rate_limit` PRIMARY KEY, letting an
 * unauthenticated caller grow D1 storage at will.
 */

/** Build a D1 mock that records every bound parameter set it is asked to run. */
function recordingDb() {
  const executed: unknown[][] = [];
  const db: any = {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn((...params: unknown[]) => {
        executed.push(params);
        return {
          // The rate-limit read path uses `.first()`; the write path uses `.run()`.
          // Returning a row for `first()` would short-circuit the failure count,
          // so hand back null and let the count start empty.
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        };
      }),
      first: vi.fn().mockResolvedValue(null),
      run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
      all: vi.fn().mockResolvedValue({ results: [] }),
      _sql: sql,
    })),
  };
  return { db, executed };
}

function loginRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('https://giadeliksari.my.id/api/auth/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.7',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/** Every string parameter handed to D1 across all recorded calls. */
function allStringParams(executed: unknown[][]): string[] {
  return executed.flat().filter((p): p is string => typeof p === 'string');
}

describe('POST /api/auth/login — input bounds', () => {
  beforeEach(() => setMockDb(null));

  it('refuses an oversized username instead of writing it to D1', async () => {
    const { db, executed } = recordingDb();
    setMockDb(db);

    // 100 KB username. Under the old code this became a 100 KB rate-limit key,
    // and the key is the table's PRIMARY KEY.
    const huge = 'a'.repeat(100_000);
    const res = await POST(loginRequest({ username: huge, password: 'x' }));

    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);

    // Nothing that reached D1 may carry the oversized string.
    const leaked = allStringParams(executed).filter((p) => p.length > 200);
    expect(leaked, 'oversized username reached the database').toHaveLength(0);
  });

  it('accepts a username at the boundary and still bounds the key', async () => {
    const { db, executed } = recordingDb();
    setMockDb(db);

    const atLimit = 'b'.repeat(64);
    await POST(loginRequest({ username: atLimit, password: 'wrong' }));

    // The rate key is `${ip}::${username}` — 64 chars plus the ip prefix.
    const keys = allStringParams(executed).filter((p) => p.includes('::'));
    expect(keys.length, 'no rate-limit key was written').toBeGreaterThan(0);
    for (const k of keys) {
      expect(k.length).toBeLessThanOrEqual(64 + '203.0.113.7'.length + 8);
    }
  });

  it('labels a smoke-suite probe so it can be filtered out of the audit trail', async () => {
    const { db, executed } = recordingDb();
    setMockDb(db);

    await POST(
      loginRequest(
        { username: '__smoke_nonexistent__', password: 'wrong' },
        { 'x-gia-smoke-check': '1' },
      ),
    );

    // The audit insert carries `source`; a smoke probe must record 'smoke'
    // rather than 'api', or CI noise becomes indistinguishable from an attack.
    expect(allStringParams(executed)).toContain('smoke');
  });

  it('records a real caller as api, not smoke', async () => {
    const { db, executed } = recordingDb();
    setMockDb(db);

    await POST(loginRequest({ username: 'someone', password: 'wrong' }));

    const params = allStringParams(executed);
    expect(params).toContain('api');
    expect(params).not.toContain('smoke');
  });
});

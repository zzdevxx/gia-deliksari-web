/**
 * Multi-role authentication for /super, /admin, /kas portals.
 *
 * Architecture:
 *   - User data is stored in the Cloudflare D1 `users` table.
 *   - Each user has a `roles` JSON array: ['super'], ['admin'],
 *     ['treasurer'], or multi-role like ['admin', 'treasurer'].
 *   - Passwords are bcrypt-hashed (cost 10). PIN must be at least 4 digits
 *     (per user requirement). Longer passwords allowed for super.
 *   - Session is a signed cookie with HMAC-SHA256 over a JSON payload
 *     `{ userId, username, roles, expiresAt }`.
 *   - `getCurrentUser(req)` reads & verifies the cookie, then fetches
 *     the fresh user record from D1.
 *   - `requireRole(req, allowed)` returns User if any of user.roles
 *     is in `allowed`.
 *
 * Roles (per user, can be multiple):
 *   - 'super'      → /super + /admin + /kas (full access)
 *   - 'admin'      → /admin (Warta, Roster, Khotbah, Inventaris)
 *   - 'treasurer'  → /kas (manajemen kas youth)
 *
 * Security:
 *   - Cookies are httpOnly + Secure (in production) + sameSite=lax.
 *   - Session max age: 12 hours.
 *   - Password verification uses bcrypt.compare (timing-safe).
 *   - User lookup is cached briefly (60s) to avoid hammering the DB.
 *   - PIN 4-digit enforced server-side at user creation.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { queryFirst, execute } from './d1';

export type Role = 'super' | 'admin' | 'treasurer';

export interface User {
  id: string;
  username: string;
  roles: Role[];
  display_name: string | null;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface SessionPayload {
  userId: string;
  username: string;
  roles: Role[];
  expiresAt: number;
}

const COOKIE_NAME = 'gia_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours
const BCRYPT_COST = 10;
const PIN_MIN = 4;    // PIN minimal 4 digit (per user requirement)
const PIN_MAX = 64;   // Max password length
// A super account can mint and revoke every other identity, so it may not use
// the 4-digit PIN the treasurer/kidz-facing roles are allowed. This is a floor
// only — it deliberately does not demand symbols, which would push operators
// toward a weak-but-complex password they must write down.
const SUPER_MIN = 8;

// Session signing.

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[auth] FATAL: ADMIN_SESSION_SECRET is not configured in production. Set it via wrangler secret put ADMIN_SESSION_SECRET.',
      );
    }
    return 'gia-deliksari-semarang-secret-key-2026';
  }
  return secret;
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

export function encodeSession(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, provided, ...rest] = token.split('.');
  if (!encoded || !provided || rest.length > 0) return null;
  const expected = sign(encoded);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= Date.now()) return null;
    if (!Array.isArray(payload.roles) || payload.roles.length === 0) return null;
    return payload;
  } catch {
    return null;
  }
}

// Cookie helpers.

export function setSessionCookie(res: { cookies: { set(name: string, value: string, opts: any): void } }, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearSessionCookie(res: { cookies: { set(name: string, value: string, opts: any): void } }) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// -.
// Password / PIN helpers — bcrypt cost 10
// PIN must be 4-64 chars; canonical PIN is exactly 4 digits but we accept
// longer passwords for superuser accounts.
// -.

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Validate a new PIN/password before hashing & storing.
 * - Must be 4-64 chars (super accounts: 8-64 — see SUPER_MIN)
 * - Whitespace trimmed
 * - Returns trimmed value on success, error message string on failure
 *
 * `minLength` lets createUser raise the floor for super accounts while the
 * treasurer/kidz PIN flow keeps its 4-digit requirement.
 */
export function validateNewPassword(
  plain: unknown,
  minLength: number = PIN_MIN,
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof plain !== 'string') {
    return { ok: false, error: 'Password harus string' };
  }
  const trimmed = plain.trim();
  if (trimmed.length < minLength) {
    return { ok: false, error: `Password minimal ${minLength} karakter` };
  }
  if (trimmed.length > PIN_MAX) {
    return { ok: false, error: `Password maksimal ${PIN_MAX} karakter` };
  }
  return { ok: true, value: trimmed };
}

// User lookup.

interface UserCacheEntry {
  user: User;
  expiresAt: number;
}
const userCache = new Map<string, UserCacheEntry>();
const CACHE_TTL_MS = 60_000; // 1 minute

async function fetchUserById(userId: string): Promise<User | null> {
  const cached = userCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.user;

  try {
    const data = await queryFirst<any>(
      'SELECT id, username, roles, display_name, active, last_login_at, created_at FROM users WHERE id = ? AND active = 1',
      [userId],
    );
    if (!data) return null;

    const user: User = normalizeUser(data);
    userCache.set(userId, { user, expiresAt: Date.now() + CACHE_TTL_MS });
    return user;
  } catch (err) {
    console.error('[auth] fetchUserById error:', err);
    return null;
  }
}

function normalizeUser(row: any): User {
  let roles: Role[] = [];
  let rawRoles = row.roles;
  if (typeof rawRoles === 'string') {
    try {
      rawRoles = JSON.parse(rawRoles);
    } catch {
      rawRoles = [rawRoles];
    }
  }

  if (Array.isArray(rawRoles) && rawRoles.length > 0) {
    roles = rawRoles.filter((r: string) =>
      r === 'super' || r === 'admin' || r === 'treasurer',
    );
  } else if (typeof row.role === 'string') {
    if (row.role === 'super' || row.role === 'admin' || row.role === 'treasurer') {
      roles = [row.role];
    }
  }
  // Fail-closed: do NOT default to ['admin'] if roles is empty or invalid.
  return {
    id: row.id,
    username: row.username,
    roles,
    display_name: row.display_name,
    active: Boolean(row.active),
    last_login_at: row.last_login_at,
    created_at: row.created_at,
  };
}

async function fetchUserByCredential(username: string, plainPassword: string): Promise<User | null> {
  try {
    const data = await queryFirst<any>(
      'SELECT id, username, password_hash, roles, display_name, active, last_login_at, created_at FROM users WHERE lower(username) = lower(?) AND active = 1',
      [username],
    );
    if (!data) {
      // The attempted name is deliberately not logged: these lines are readable
      // through `wrangler tail`, and the two distinct messages would together
      // reveal which usernames exist. Counts still reach the rate limiter.
      console.warn('[auth] login rejected: no matching active user');
      return null;
    }
    const ok = await verifyPassword(plainPassword, data.password_hash);
    if (!ok) {
      console.warn('[auth] login rejected: password mismatch');
      return null;
    }
    return normalizeUser(data);
  } catch (err) {
    console.error('[auth] fetchUserByCredential error:', err);
    return null;
  }
}

// Cookie reader.

export function readSessionFromCookie(req: { cookies: { get(name: string): { value: string } | undefined } }): SessionPayload | null {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  return decodeSession(cookie);
}

export async function getCurrentUser(req: {
  cookies: { get(name: string): { value: string } | undefined };
}): Promise<User | null> {
  const session = readSessionFromCookie(req);
  if (!session) return null;
  return fetchUserById(session.userId);
}

/**
 * Route guard — returns the User if any of their roles is in `allowed`.
 * Otherwise returns a 401/403 Response.
 */
export async function requireRole(
  req: { cookies: { get(name: string): { value: string } | undefined } },
  allowed: Role[],
): Promise<User | Response> {
  const user = await getCurrentUser(req);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const hasRole = user.roles.some((r) => allowed.includes(r));
  if (!hasRole) {
    return new Response(
      JSON.stringify({
        error: `Forbidden: roles [${user.roles.join(', ')}] not in [${allowed.join(', ')}]`,
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }
  return user;
}

// Login.

export async function login(
  username: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  const user = await fetchUserByCredential(username, password);
  if (!user) return null;
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    roles: user.roles,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1_000,
  };
  const token = encodeSession(payload);

  try {
    await execute('UPDATE users SET last_login_at = ? WHERE id = ?', [
      new Date().toISOString(),
      user.id,
    ]);
    userCache.delete(user.id);
  } catch (err) {
    console.warn('[auth] could not update last_login_at:', err);
  }

  return { user, token };
}

// User creation.

export interface CreateUserInput {
  username: string;
  password: string;
  roles: Role[];
  display_name?: string | null;
}

export async function createUser(input: CreateUserInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const username = input.username.trim();
  const trimmed = input.password.trim();

  // Username validation
  if (username.length < 3 || username.length > 64) {
    return { ok: false, error: 'Username harus 3-64 karakter' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return { ok: false, error: 'Username hanya boleh huruf, angka, dot, underscore, dash' };
  }
  // Roles validation — must happen before password validation so the floor can
  // depend on whether the new account is a super.
  if (!Array.isArray(input.roles) || input.roles.length === 0) {
    return { ok: false, error: 'Pilih minimal 1 role' };
  }
  const validRoles: Role[] = ['super', 'admin', 'treasurer'];
  const roles = Array.from(new Set(input.roles.filter((r) => validRoles.includes(r))));
  if (roles.length === 0) {
    return { ok: false, error: 'Role tidak valid' };
  }
  // Password validation — super accounts may not use a 4-digit PIN.
  const pwCheck = validateNewPassword(trimmed, roles.includes('super') ? SUPER_MIN : PIN_MIN);
  if (!pwCheck.ok) return { ok: false, error: pwCheck.error };
  // Check duplicate
  try {
    const existing = await queryFirst<{ id: string }>(
      'SELECT id FROM users WHERE lower(username) = lower(?)',
      [username],
    );
    if (existing) {
      return { ok: false, error: `Username '${username}' sudah dipakai` };
    }

    // Insert
    const password_hash = await hashPassword(pwCheck.value);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      'INSERT INTO users (id, username, password_hash, roles, display_name, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)',
      [
        id,
        username,
        password_hash,
        JSON.stringify(roles),
        input.display_name?.trim() || null,
        now,
      ],
    );

    return { ok: true, id };
  } catch (err: any) {
    console.error('[auth] createUser error:', err);
    return { ok: false, error: err.message || 'Gagal membuat user' };
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_SECONDS;
export const SUPER_MIN_PASSWORD_LENGTH = SUPER_MIN;

// -.
// Rate limiting (login attempt lockout)
//
// The counter lives in D1, not memory.
//
// It used to be a module-scope Map, which on Cloudflare Workers is per-isolate
// state: a fresh isolate saw an empty map, so a lockout recorded in one instance
// was invisible to the next. With requests spread across instances the 429
// branch almost never fired, so the documented "3 failed attempts -> 1 minute
// lockout" was effectively dead. It also made the smoke suite flap, because its
// outcome depended on which isolate happened to answer.
//
// A 2-second in-process memo sits in front of D1 so a burst against one isolate
// does not hit the database on every request. The memo is an optimisation only.
// -.

const LOGIN_MAX_FAILS = 3;
const LOGIN_LOCKOUT_MS = 60_000; // 1 minute
const LOGIN_WINDOW_MS = 5 * 60_000; // 5 minutes
const RL_TABLE = 'login_rate_limit';

interface RateLimitState {
  failures: number[];
  lockedUntil: number;
}

const localRlCache = new Map<string, RateLimitState & { readAt: number }>();
const LOCAL_RL_TTL_MS = 2_000;

let rlTableReady: Promise<void> | null = null;
/**
 * Create the rate-limit table on first use. `IF NOT EXISTS` is idempotent and
 * the promise is cached, so this costs one round trip per isolate rather than
 * one per login. Lazy, so no migration ordering is imposed on deploys.
 */
function ensureRateLimitTable(): Promise<void> {
  if (!rlTableReady) {
    rlTableReady = execute(
      `CREATE TABLE IF NOT EXISTS ${RL_TABLE} (
         key TEXT PRIMARY KEY,
         failures TEXT NOT NULL DEFAULT '[]',
         locked_until INTEGER NOT NULL DEFAULT 0,
         updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
       )`,
    )
      .then(() => undefined)
      .catch((err) => {
        rlTableReady = null; // let a later request retry rather than cache the failure
        throw err;
      });
  }
  return rlTableReady;
}

async function readRateLimit(key: string): Promise<RateLimitState> {
  const now = Date.now();
  const cached = localRlCache.get(key);
  if (cached && now - cached.readAt < LOCAL_RL_TTL_MS) {
    return { failures: cached.failures, lockedUntil: cached.lockedUntil };
  }
  try {
    await ensureRateLimitTable();
    const row = await queryFirst<{ failures: string; locked_until: number }>(
      `SELECT failures, locked_until FROM ${RL_TABLE} WHERE key = ?`,
      [key],
    );
    let failures: number[] = [];
    if (row?.failures) {
      try {
        const parsed = JSON.parse(row.failures);
        if (Array.isArray(parsed)) failures = parsed.filter((t) => typeof t === 'number');
      } catch {
        failures = [];
      }
    }
    const state: RateLimitState = { failures, lockedUntil: row?.locked_until ?? 0 };
    localRlCache.set(key, { ...state, readAt: now });
    return state;
  } catch (err) {
    // A storage problem must not lock every operator out. Fail open, exactly as
    // a fresh isolate did before, and leave the reason in the log.
    console.error('[auth] rate-limit read failed:', err);
    return { failures: [], lockedUntil: 0 };
  }
}

async function writeRateLimit(key: string, state: RateLimitState): Promise<void> {
  localRlCache.set(key, { ...state, readAt: Date.now() });
  try {
    await ensureRateLimitTable();
    await execute(
      `INSERT INTO ${RL_TABLE} (key, failures, locked_until, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         failures = excluded.failures,
         locked_until = excluded.locked_until,
         updated_at = excluded.updated_at`,
      [key, JSON.stringify(state.failures), state.lockedUntil, new Date().toISOString()],
    );
  } catch (err) {
    console.error('[auth] rate-limit write failed:', err);
  }
}

/** Returns { ok: true } if not locked, else { ok: false, retryAfterSec } */
export async function checkLoginRateLimit(
  key: string,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const now = Date.now();
  const state = await readRateLimit(key);
  if (state.lockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((state.lockedUntil - now) / 1000) };
  }
  // Lock expired or window moved: prune stale failures so the key can re-arm.
  const pruned = state.failures.filter((t) => now - t < LOGIN_WINDOW_MS);
  if (state.lockedUntil !== 0 || pruned.length !== state.failures.length) {
    await writeRateLimit(key, { failures: pruned, lockedUntil: 0 });
  }
  return { ok: true };
}

export async function recordLoginFailure(
  key: string,
): Promise<{ locked: boolean; retryAfterSec: number }> {
  const now = Date.now();
  const state = await readRateLimit(key);
  state.failures = state.failures.filter((t) => now - t < LOGIN_WINDOW_MS);
  state.failures.push(now);

  let locked = false;
  let retryAfterSec = 0;
  if (state.failures.length >= LOGIN_MAX_FAILS) {
    state.lockedUntil = now + LOGIN_LOCKOUT_MS;
    locked = true;
    retryAfterSec = Math.ceil(LOGIN_LOCKOUT_MS / 1000);
  }
  await writeRateLimit(key, state);
  return { locked, retryAfterSec };
}

export async function clearLoginFailures(key: string) {
  localRlCache.delete(key);
  try {
    await ensureRateLimitTable();
    await execute(`DELETE FROM ${RL_TABLE} WHERE key = ?`, [key]);
  } catch (err) {
    console.error('[auth] rate-limit clear failed:', err);
  }
}
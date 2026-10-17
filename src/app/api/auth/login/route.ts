import { NextRequest, NextResponse } from 'next/server';
import {
  login,
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginFailures,
} from '@/lib/auth';
import { logAudit, auditContextFromRequest } from '@/lib/auditLog';

/**
 * Header the smoke suite sets on negative-path login probes.
 *
 * The audit log exists so an operator can answer "is someone trying to break
 * in?". A test that fires deliberately-wrong credentials writes rows that look
 * exactly like a real brute-force attempt, so the CI runs buried the real
 * signal: 91 of 253 rows (36%) were smoke-suite noise before this existed.
 *
 * A test cannot be told to simply stop auditing, because the audit trail is
 * the security control and a client-supplied header must never be able to
 * switch a security control off. So this does not suppress the entry. It
 * *labels* it: the row is still written, still rate-limited, still counted, and
 * an operator filtering for real attacks can exclude `source = 'smoke'`.
 *
 * The header is deliberately not secret. Knowing it buys an attacker nothing —
 * their failed attempts are still recorded, still locked out, and still visible
 * as `source = 'api'` unless they also forge this header, in which case they
 * have merely filed their own break-in attempt under a label the operator reads
 * as "test traffic" and investigates accordingly.
 */
const SMOKE_SOURCE_HEADER = 'x-gia-smoke-check';

function auditSource(req: NextRequest): 'api' | 'smoke' {
  // Never let a browser page set this by accident: fetch() from the site
  // cannot add a custom header on a simple request, and a forged one is
  // recorded as 'smoke' under the attacker's own IP.
  return req.headers.get(SMOKE_SOURCE_HEADER) === '1' ? 'smoke' : 'api';
}

/**
 * POST /api/auth/login — multi-role login with rate limiting.
 *
 * Body: { username, password }
 * Returns: { success, user: { username, roles, display_name }, message }
 * Sets cookie: gia_session (httpOnly, secure in prod, sameSite=lax, 12h).
 *
 * Rate limit: 3 failed attempts per (IP + username) within 5 minutes
 * triggers a 1-minute lockout. Counter resets on successful login.
 */
export async function POST(req: NextRequest) {
  // Extract client IP (Cloudflare cf-connecting-ip prioritized)
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 });
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: 'Username dan password wajib diisi' },
      { status: 400 },
    );
  }

  // Reject an over-long username before it reaches the rate limiter.
  //
  // The rate-limit key is `ip::username` and it is the PRIMARY KEY of the
  // `login_rate_limit` row, so the username's length becomes a row's length.
  // Nothing checked it: an unauthenticated caller could POST a 100 KB username
  // and write a 100 KB row, repeatedly, with a different name each time — no
  // account needed, because the write happens before any credential check.
  // That is unbounded storage growth driven by attacker input.
  //
  // 64 is the bound the rest of the app already uses (see createUser's
  // validation in src/lib/auth.ts, which caps usernames at 64 chars, and the
  // public ministry-request route, which clips every field). Rejecting rather
  // than truncating: a truncated name would collide with a real account's key
  // and is never a legitimate login, so there is nothing to preserve.
  const USERNAME_MAX = 64;
  if (username.length > USERNAME_MAX) {
    return NextResponse.json(
      { success: false, error: 'Username atau password salah' },
      { status: 401 },
    );
  }

  const source = auditSource(req);

  // Rate limit check (per IP + username to prevent both brute force
  // on single account AND multi-account abuse from one IP)
  const rateKey = `${ip}::${username.toLowerCase()}`;
  const rateCheck = await checkLoginRateLimit(rateKey);
  if (!rateCheck.ok) {
    await logAudit({
      actor: null,
      action: 'auth.login_lockout',
      target: { label: username },
      summary: `Login lockout untuk '${username}' dari ${ip}`,
      ctx: { ...auditContextFromRequest(req), source },
    });
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${rateCheck.retryAfterSec} detik.`,
        retryAfter: rateCheck.retryAfterSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfterSec) },
      },
    );
  }

  const result = await login(username, password);
  if (!result) {
    const failure = await recordLoginFailure(rateKey);
    await logAudit({
      actor: null,
      action: failure.locked ? 'auth.login_lockout' : 'auth.login_failure',
      target: { label: username },
      summary: failure.locked
        ? `Akun '${username}' dikunci setelah ${failure.retryAfterSec}s dari ${ip}`
        : `Login gagal untuk '${username}' dari ${ip}`,
      ctx: { ...auditContextFromRequest(req), source },
    });
    if (failure.locked) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan gagal. Akun dikunci sementara selama ${failure.retryAfterSec} detik.`,
          retryAfter: failure.retryAfterSec,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(failure.retryAfterSec) },
        },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Username atau password salah' },
      { status: 401 },
    );
  }

  // Successful login — clear any prior failures for this key
  await clearLoginFailures(rateKey);

  const { user, token } = result;
  await logAudit({
    actor: { id: user.id, username: user.username, roles: user.roles },
    action: 'auth.login_success',
    target: { label: user.username },
    summary: `Login berhasil untuk '${user.username}' dari ${ip}`,
    ctx: { ...auditContextFromRequest(req), source },
  });

  const res = NextResponse.json({
    success: true,
    message: `Login berhasil. Selamat datang, ${user.display_name || user.username}!`,
    user: { username: user.username, roles: user.roles, display_name: user.display_name },
  });
  setSessionCookie(res, token);
  return res;
}

/**
 * DELETE /api/auth/login — clears the session cookie (logout).
 */
export async function DELETE(req: NextRequest) {
  // Best-effort logout audit. We don't have the user object on the way
  // out (cookie clearing happens before we can re-resolve), so we log
  // the raw cookie fingerprint + IP. Operators investigating suspicious
  // logouts can correlate with login_success entries by IP+time.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  await logAudit({
    actor: null,
    action: 'auth.logout',
    summary: `Logout dari ${ip}`,
    ctx: auditContextFromRequest(req),
  });

  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}

export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
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
  // Extract IP for rate limiting (Vercel provides x-forwarded-for)
  const ip =
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

  // Rate limit check (per IP + username to prevent both brute force
  // on single account AND multi-account abuse from one IP)
  const rateKey = `${ip}::${username.toLowerCase()}`;
  const rateCheck = checkLoginRateLimit(rateKey);
  if (!rateCheck.ok) {
    await logAudit({
      actor: null,
      action: 'auth.login_lockout',
      target: { label: username },
      summary: `Login lockout untuk '${username}' dari ${ip}`,
      ctx: auditContextFromRequest(req),
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
    const failure = recordLoginFailure(rateKey);
    await logAudit({
      actor: null,
      action: failure.locked ? 'auth.login_lockout' : 'auth.login_failure',
      target: { label: username },
      summary: failure.locked
        ? `Akun '${username}' dikunci setelah ${failure.retryAfterSec}s dari ${ip}`
        : `Login gagal untuk '${username}' dari ${ip}`,
      ctx: auditContextFromRequest(req),
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
  clearLoginFailures(rateKey);

  const { user, token } = result;
  await logAudit({
    actor: { id: user.id, username: user.username, roles: user.roles },
    action: 'auth.login_success',
    target: { label: user.username },
    summary: `Login berhasil untuk '${user.username}' dari ${ip}`,
    ctx: auditContextFromRequest(req),
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
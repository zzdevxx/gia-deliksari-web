import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/auth/check — returns current authenticated user (or null).
 *
 * Used by /admin, /super, /kas to decide whether to render the login screen
 * or the dashboard.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      username: user.username,
      roles: user.roles,
      display_name: user.display_name,
    },
  });
}
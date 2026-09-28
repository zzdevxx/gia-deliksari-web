import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  clearSessionCookie(response);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  clearSessionCookie(response);
  return response;
}

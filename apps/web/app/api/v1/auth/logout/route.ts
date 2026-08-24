import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'apix_session';

export async function POST() {
  const response = NextResponse.json({
    data: { message: 'Logged out successfully' },
    meta: { generated_at: new Date().toISOString() }
  });

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}
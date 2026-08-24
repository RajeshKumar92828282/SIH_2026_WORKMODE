import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  return NextResponse.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    },
    meta: { generated_at: new Date().toISOString() }
  });
}
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'apix_super_secret_session_jwt_key_2026';
const SESSION_COOKIE_NAME = 'apix_session';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifySession(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSig) return null;

    const user = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionUser;
    
    // Check expiry
    if (user.exp && user.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): SessionUser | NextResponse {
  const user = verifySession(req);
  if (!user) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  return user;
}

export function requireRole(req: NextRequest, requiredRole: string): SessionUser | NextResponse {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  
  if (requiredRole === 'admin' && auth.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'forbidden', message: 'Admin role required' } },
      { status: 403 }
    );
  }
  
  return auth;
}
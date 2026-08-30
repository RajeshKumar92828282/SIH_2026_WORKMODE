import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { db } from '@/lib/db';
import { checkRateLimit, RateTier } from '@/lib/rate-limit';
import crypto from 'crypto';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'apix_super_secret_session_jwt_key_2026';
const SESSION_COOKIE_NAME = 'apix_session';

export interface AuthContext {
  apiKeyRecord?: Awaited<ReturnType<typeof verifyApiKey>>['keyRecord'];
  organization?: Awaited<ReturnType<typeof verifyApiKey>>['organization'];
  userRole?: string | null;
  userId?: string;
}

function verifySession(req: NextRequest): { userId: string; email: string; role: string } | null {
  const token = req.cookies.get('apix_session')?.value;
  console.log('[DEBUG] Session cookie:', token ? 'present' : 'missing');
  if (!token) {
    console.log('[DEBUG] No session cookie found');
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[DEBUG] Invalid token format, parts:', parts.length);
      return null;
    }

    const [header, payload, signature] = parts;
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSig) {
      console.log('[DEBUG] Signature verification failed');
      return null;
    }

    const user = JSON.parse(Buffer.from(payload, 'base64url').toString());
    console.log('[DEBUG] Session user:', user);
    
    // Check expiry
    if (user.exp && user.exp < Math.floor(Date.now() / 1000)) {
      console.log('[DEBUG] Token expired');
      return null;
    }

    return { userId: user.sub, email: user.email, role: user.role };
  } catch (e) {
    console.log('[DEBUG] Session verification error:', e);
    return null;
  }
}

export async function requireApiKey(req: NextRequest, requiredScope?: string): Promise<AuthContext | NextResponse> {
  const authHeader = req.headers.get('authorization');
  const result = await verifyApiKey(authHeader, requiredScope);
  
  if (!result.valid) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: result.error } },
      { status: 401 }
    );
  }
  
  // Apply tier-based rate limit after successful auth
  const tier = (result.keyRecord?.rateTier as RateTier) || 'standard';
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateCheck = checkRateLimit(`key:${result.keyRecord?.id || ip}`, tier);
  
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limit_exceeded', message: `Rate limit exceeded for tier: ${tier}` } },
      { status: 429 }
    );
  }
  
  return { apiKeyRecord: result.keyRecord, organization: result.organization };
}

export async function requireAdmin(req: NextRequest): Promise<AuthContext | NextResponse> {
  // First check for API key with admin scope
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const result = await verifyApiKey(authHeader, 'admin');
    
    if (result.valid) {
      // Admin keys use institutional tier
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const rateCheck = checkRateLimit(`key:${result.keyRecord?.id || ip}`, 'institutional');
      
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: { code: 'rate_limit_exceeded', message: 'Admin rate limit exceeded' } },
          { status: 429 }
        );
      }
      
      return { apiKeyRecord: result.keyRecord, organization: result.organization, userRole: 'admin', userId: result.keyRecord?.id };
    }
  }
  
  // Fallback to session-based auth
  const sessionUser = verifySession(req);
  console.log('[DEBUG] Session user after verification:', sessionUser);
  console.log('[DEBUG] Cookie header:', req.headers.get('cookie'));
  if (sessionUser && sessionUser.role === 'admin') {
    return { userRole: 'admin', userId: sessionUser.userId };
  }
  
  return NextResponse.json(
    { error: { code: 'forbidden', message: 'Admin access required', debug: { sessionUser, cookieHeader: req.headers.get('cookie') } } },
    { status: 403 }
  );
}

export async function requireAuth(req: NextRequest): Promise<AuthContext | NextResponse> {
  // First check for API key
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const result = await verifyApiKey(authHeader);
    if (result.valid) {
      const tier = (result.keyRecord?.rateTier as 'standard' | 'institutional' | 'unlimited') || 'standard';
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const rateCheck = checkRateLimit(`key:${result.keyRecord?.id || ip}`, tier);
      
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: { code: 'rate_limit_exceeded', message: `Rate limit exceeded for tier: ${tier}` } },
          { status: 429 }
        );
      }
      
      return { apiKeyRecord: result.keyRecord, organization: result.organization, userRole: 'api_user', userId: result.keyRecord?.id };
    }
  }
  
  // Fallback to session-based auth
  const sessionUser = verifySession(req);
  if (sessionUser) {
    return { userRole: sessionUser.role, userId: sessionUser.userId };
  }
  
  return NextResponse.json(
    { error: { code: 'unauthorized', message: 'Authentication required' } },
    { status: 401 }
  );
}

export function createErrorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
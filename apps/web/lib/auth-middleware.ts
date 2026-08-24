import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { db } from '@/lib/db';
import { checkRateLimit, RateTier } from '@/lib/rate-limit';

export interface AuthContext {
  apiKeyRecord?: Awaited<ReturnType<typeof verifyApiKey>>['keyRecord'];
  organization?: Awaited<ReturnType<typeof verifyApiKey>>['organization'];
  userRole?: string | null;
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
  const authHeader = req.headers.get('authorization');
  const result = await verifyApiKey(authHeader, 'admin');
  
  if (!result.valid) {
    return NextResponse.json(
      { error: { code: 'forbidden', message: result.error || 'Admin scope required' } },
      { status: 403 }
    );
  }
  
  // Admin keys use institutional tier
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateCheck = checkRateLimit(`key:${result.keyRecord?.id || ip}`, 'institutional');
  
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: { code: 'rate_limit_exceeded', message: 'Admin rate limit exceeded' } },
      { status: 429 }
    );
  }
  
  return { apiKeyRecord: result.keyRecord, organization: result.organization, userRole: 'admin' };
}

export function createErrorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}
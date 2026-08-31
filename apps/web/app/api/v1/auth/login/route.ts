import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/auth';
import crypto from 'crypto';
import { validateStoredCredentials } from '@/lib/backend-store';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'apix_super_secret_session_jwt_key_2026';
const SESSION_COOKIE_NAME = 'apix_session';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Read raw buffer first (bodyParser disabled)
    const arrayBuffer = await req.arrayBuffer();
    const rawBody = new TextDecoder().decode(arrayBuffer);
    console.log('[LOGIN DEBUG] Raw body length:', rawBody.length);
    console.log('[LOGIN DEBUG] Raw body first 100 chars:', rawBody.substring(0, 100));
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('[LOGIN DEBUG] JSON parse error:', parseError);
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Invalid JSON in request body', debug: { rawBody: rawBody.substring(0, 100) } } },
        { status: 400 }
      );
    }
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const user = await validateStoredCredentials(email, password);

    if (!user) {
      await createAuditLog(email, 'LOGIN_FAILED', 'User not found or invalid password');
      return NextResponse.json(
        { error: { code: 'user_not_found', message: 'No account found with this email or password is invalid' } },
        { status: 404 }
      );
    }

    // Create JWT token
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 // 8 hours
    };

    // Simple base64 encoding for demo (in production, use proper JWT library)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    const token = `${header}.${payload}.${signature}`;

    // Set httpOnly cookie
    const response = NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
      meta: { generated_at: new Date().toISOString() }
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    });

    await createAuditLog(user.id, 'LOGIN_SUCCESS', `User logged in: ${user.email}`);

    return response;
  } catch (error: any) {
    console.error('[API POST /api/v1/auth/login ERROR]', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: error.message || 'Failed to process login' } },
      { status: 500 }
    );
  }
}
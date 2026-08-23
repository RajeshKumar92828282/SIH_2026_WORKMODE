import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RegisterUserSchema } from '@/lib/validation';
import { hashPassword, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let parsed: any = null;
  try {
    const body = await req.json();
    parsed = RegisterUserSchema.parse(body);

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: parsed.email.toLowerCase() }
    });

    if (existing) {
      return NextResponse.json(
        { error: { code: 'user_exists', message: 'A user with this email address already exists.' } },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(parsed.password);

    // Strict Rule: Public registration is always hardcoded to 'analyst'
    const user = await db.user.create({
      data: {
        email: parsed.email.toLowerCase(),
        passwordHash,
        role: 'analyst'
      }
    });

    // Record audit entry
    await createAuditLog(user.id, 'USER_REGISTER', `Analyst account registered: ${user.email}`);

    return NextResponse.json(
      {
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        },
        meta: { generated_at: new Date().toISOString() }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/v1/auth/register ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid input' } },
        { status: 400 }
      );
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[API POST /api/v1/auth/register] DB offline, returning simulated registration response for dev testing.');
      return NextResponse.json(
        {
          data: {
            id: 'mock_usr_' + Math.random().toString(36).substring(2, 9),
            email: parsed.email.toLowerCase(),
            role: 'analyst',
            createdAt: new Date().toISOString()
          },
          meta: {
            generated_at: new Date().toISOString(),
            is_mock_simulation: true
          }
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to process registration.' } },
      { status: 500 }
    );
  }
}

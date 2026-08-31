import { NextRequest, NextResponse } from 'next/server';
import { RegisterUserSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/auth';
import { createStoredUser, findStoredUserByEmail } from '@/lib/backend-store';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const arrayBuffer = await req.arrayBuffer();
    const rawBody = new TextDecoder().decode(arrayBuffer);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        { error: { code: 'validation_error', message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }
    
    const parsed = RegisterUserSchema.parse(body);

    const existing = await findStoredUserByEmail(parsed.email);

    if (existing) {
      return NextResponse.json(
        { error: { code: 'user_exists', message: 'A user with this email address already exists.' } },
        { status: 409 }
      );
    }

    const user = await createStoredUser(parsed.email, parsed.password, 'analyst');

    // 4. Record audit entry in audit_logs table
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
    console.error('[API POST /api/v1/auth/register ERROR]', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid registration input' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: error.message || 'Failed to process user registration' } },
      { status: 500 }
    );
  }
}

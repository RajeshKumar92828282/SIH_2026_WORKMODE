import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UpdateUserRoleSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/auth';
import { requireAdmin } from '@/lib/auth-middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const parsed = UpdateUserRoleSchema.parse(body);

    const targetUser = await db.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: { code: 'not_found', message: `User with ID '${userId}' not found.` } },
        { status: 404 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: parsed.role }
    });

    await createAuditLog(
      'ADMIN',
      'PROMOTE_ROLE',
      `Promoted role of ${updatedUser.email} (ID: ${userId}) to '${parsed.role}'`
    );

    return NextResponse.json({
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt.toISOString()
      },
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error: any) {
    console.error('[API POST /api/v1/admin/users/[id] ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid role payload' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to update user role' } },
      { status: 500 }
    );
  }
}

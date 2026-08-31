import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  const auth = await requireApiKey(req as any, 'read:index');
  if (auth instanceof NextResponse) return auth;
  try {
    const alerts = await db.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      data: alerts.map((a: any) => ({
        id: a.id,
        type: a.type,
        routeId: a.routeId,
        message: a.message,
        createdAt: a.createdAt.toISOString()
      })),
      meta: {
        generated_at: new Date().toISOString(),
        total: alerts.length
      }
    });
  } catch (error) {
    console.error('[API GET /api/v1/alerts ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch alerts' } },
      { status: 500 }
    );
  }
}

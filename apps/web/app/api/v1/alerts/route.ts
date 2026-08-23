import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      data: alerts.map((a) => ({
        id: a.id,
        type: a.type,
        routeId: a.routeId,
        message: a.message,
        createdAt: a.createdAt.toISOString()
      })),
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/alerts ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch alerts' } },
      { status: 500 }
    );
  }
}

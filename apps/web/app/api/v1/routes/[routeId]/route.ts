import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  try {
    const { routeId } = await params;
    const route = await db.route.findUnique({
      where: { id: routeId }
    });

    if (!route) {
      return NextResponse.json(
        { error: { code: 'not_found', message: `Route ${routeId} not found` } },
        { status: 404 }
      );
    }

    const history = await db.indexResult.findMany({
      where: { routeId },
      orderBy: { computedAt: 'asc' },
      take: 200
    });

    return NextResponse.json({
      data: {
        route,
        observationsCount: history.length,
        history
      },
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/routes/[routeId] ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch route detail' } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const auth = await requireApiKey(req, 'read:routes');
  if (auth instanceof NextResponse) return auth;

  try {
    const { routeId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

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
      where: {
        OR: [
          { origin: route.origin, destination: route.destination },
          { origin: route.destination, destination: route.origin }
        ]
      },
      orderBy: { observedAt: 'asc' },
      skip: offset,
      take: limit
    });

    return NextResponse.json({
      data: {
        route,
        observationsCount: history.length,
        history: history.map((h) => ({
          id: h.id,
          origin: h.origin,
          destination: h.destination,
          indexValue: Math.round(h.indexValue * 100) / 100,
          cabinClass: h.cabinClass,
          observedAt: h.observedAt.toISOString(),
          runId: h.runId
        }))
      },
      meta: { generated_at: new Date().toISOString(), limit, offset }
    });
  } catch (error) {
    console.error('[API GET /api/v1/routes/[routeId] ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch route detail' } },
      { status: 500 }
    );
  }
}
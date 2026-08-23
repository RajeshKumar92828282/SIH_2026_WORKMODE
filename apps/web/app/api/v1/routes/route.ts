import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const routes = await db.route.findMany({
      orderBy: { id: 'asc' }
    });

    const latestTickRecord = await db.indexResult.findFirst({
      orderBy: { computedAt: 'desc' }
    });

    const enrichedRoutes = await Promise.all(
      routes.map(async (r) => {
        let avgRelativePrice = 100.0;
        let avgLiveFare = 0.0;
        let avgStaticFare = 0.0;

        if (latestTickRecord) {
          const routeRows = await db.indexResult.findMany({
            where: {
              computedAt: latestTickRecord.computedAt,
              routeId: r.id
            }
          });

          if (routeRows.length > 0) {
            const sumRel = routeRows.reduce((acc, row) => acc + row.relativePrice, 0);
            avgRelativePrice = sumRel / routeRows.length;
            avgLiveFare = routeRows.reduce((acc, row) => acc + Number(row.liveTotalFare), 0) / routeRows.length;
            avgStaticFare = routeRows.reduce((acc, row) => acc + Number(row.staticTotalFare), 0) / routeRows.length;
          }
        }

        return {
          id: r.id,
          origin: r.origin,
          destination: r.destination,
          weight: r.weight,
          weightPercentage: `${(r.weight * 100).toFixed(0)}%`,
          relativePrice: Math.round(avgRelativePrice * 100) / 100,
          avgLiveFare: Math.round(avgLiveFare),
          avgStaticFare: Math.round(avgStaticFare),
          fareChangePct: Math.round(((avgRelativePrice - 100)) * 100) / 100
        };
      })
    );

    return NextResponse.json({
      data: enrichedRoutes,
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/routes ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch routes' } },
      { status: 500 }
    );
  }
}

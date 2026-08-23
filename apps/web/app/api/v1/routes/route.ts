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
    console.warn('[API GET /api/v1/routes] DB offline or error, returning baseline route basket.');
    return NextResponse.json({
      data: [
        {
          id: 'DEL-BOM',
          origin: 'Delhi',
          destination: 'Mumbai',
          weight: 0.45,
          weightPercentage: '45%',
          relativePrice: 106.2,
          avgLiveFare: 6250,
          avgStaticFare: 5880,
          fareChangePct: 6.2
        },
        {
          id: 'DEL-BLR',
          origin: 'Delhi',
          destination: 'Bengaluru',
          weight: 0.35,
          weightPercentage: '35%',
          relativePrice: 104.5,
          avgLiveFare: 7100,
          avgStaticFare: 6790,
          fareChangePct: 4.5
        },
        {
          id: 'BOM-BLR',
          origin: 'Mumbai',
          destination: 'Bengaluru',
          weight: 0.20,
          weightPercentage: '20%',
          relativePrice: 102.1,
          avgLiveFare: 4950,
          avgStaticFare: 4850,
          fareChangePct: 2.1
        }
      ],
      meta: {
        generated_at: new Date().toISOString(),
        is_sample_data: true
      }
    });
  }
}

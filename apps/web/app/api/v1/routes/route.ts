import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const routes = await db.route.findMany({
      orderBy: { weight: 'desc' }
    });

    const latestRecord = await db.indexResult.findFirst({
      orderBy: { observedAt: 'desc' }
    });

    const latestRows = latestRecord
      ? await db.indexResult.findMany({ where: { observedAt: latestRecord.observedAt } })
      : [];

    const enrichedRoutes = await Promise.all(
      routes.map(async (r) => {
        // 1. Matching index relative price
        const matchingIndexRows = latestRows.filter(
          (row) =>
            (row.origin === r.origin && row.destination === r.destination) ||
            (row.origin === r.destination && row.destination === r.origin) ||
            (r.id.includes(row.origin) && r.id.includes(row.destination))
        );

        const avgRelativePrice =
          matchingIndexRows.length > 0
            ? matchingIndexRows.reduce((acc, row) => acc + row.indexValue, 0) / matchingIndexRows.length
            : 100.0;

        // 2. Average live fare from live_fares (DB2)
        const liveStats = await db.liveFare.aggregate({
          where: {
            OR: [
              { origin: r.origin, destination: r.destination },
              { origin: r.origin === 'DEL' ? 'Delhi' : r.origin === 'BOM' ? 'Mumbai' : 'Bangalore', destination: r.destination === 'BOM' ? 'Mumbai' : r.destination === 'BLR' ? 'Bangalore' : 'Delhi' }
            ]
          },
          _avg: { totalFare: true }
        });

        // 3. Average static fare from static_fares (DB1)
        const staticStats = await db.staticFare.aggregate({
          where: {
            OR: [
              { origin: r.origin, destination: r.destination },
              { origin: r.origin === 'DEL' ? 'Delhi' : r.origin === 'BOM' ? 'Mumbai' : 'Bangalore', destination: r.destination === 'BOM' ? 'Mumbai' : r.destination === 'BLR' ? 'Bangalore' : 'Delhi' }
            ]
          },
          _avg: { totalFare: true }
        });

        const avgLiveFare = liveStats._avg.totalFare || 0;
        const avgStaticFare = staticStats._avg.totalFare || 0;
        const fareChangePct = avgRelativePrice - 100;

        return {
          id: r.id,
          origin: r.origin,
          destination: r.destination,
          weight: r.weight,
          weightPercentage: `${(r.weight * 100).toFixed(0)}%`,
          relativePrice: Math.round(avgRelativePrice * 100) / 100,
          avgLiveFare: Math.round(avgLiveFare),
          avgStaticFare: Math.round(avgStaticFare),
          fareChangePct: Math.round(fareChangePct * 100) / 100
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

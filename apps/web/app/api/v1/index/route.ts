import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  const auth = await requireApiKey(req as any, 'read:index');
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Fetch latest observed_at from index_results (DB3)
    const latestRecord = await db.indexResult.findFirst({
      orderBy: { observedAt: 'desc' }
    });

    if (!latestRecord) {
      return NextResponse.json(
        {
          error: {
            code: 'no_data',
            message: 'No computed index results available in database'
          }
        },
        { status: 404 }
      );
    }

    const latestObservedAt = latestRecord.observedAt;

    // 2. Fetch all index_results for the latest run
    const latestRows = await db.indexResult.findMany({
      where: { observedAt: latestObservedAt }
    });

    // 3. Fetch basket routes with weights
    const routes = await db.route.findMany({
      orderBy: { weight: 'desc' }
    });

    // 4. Calculate weighted sum for current tick - use exact origin/destination matching
    let currentIndex = 0;
    for (const r of routes) {
      const matchingRows = latestRows.filter(
        (row) =>
          (row.origin === r.origin && row.destination === r.destination) ||
          (row.origin === r.destination && row.destination === r.origin)
      );

      const avgRouteIndex =
        matchingRows.length > 0
          ? matchingRows.reduce((acc, row) => acc + row.indexValue, 0) / matchingRows.length
          : 100.0;

      currentIndex += r.weight * avgRouteIndex;
    }

    // 5. Fetch previous run for change calculation
    const prevRecord = await db.indexResult.findFirst({
      where: { observedAt: { lt: latestObservedAt } },
      orderBy: { observedAt: 'desc' }
    });

    let prevIndex = currentIndex;
    if (prevRecord) {
      const prevRows = await db.indexResult.findMany({
        where: { observedAt: prevRecord.observedAt }
      });

      let calcPrev = 0;
      for (const r of routes) {
        const matchingRows = prevRows.filter(
          (row) =>
            (row.origin === r.origin && row.destination === r.destination) ||
            (row.origin === r.destination && row.destination === r.origin)
        );
        const avgRouteIndex =
          matchingRows.length > 0
            ? matchingRows.reduce((acc, row) => acc + row.indexValue, 0) / matchingRows.length
            : 100.0;
        calcPrev += r.weight * avgRouteIndex;
      }
      prevIndex = calcPrev;
    }

    const pctChange24h = prevIndex > 0 ? ((currentIndex - prevIndex) / prevIndex) * 100 : 0;
    const status =
      Math.abs(pctChange24h) > 15
        ? 'HIGH_SPIKE'
        : Math.abs(pctChange24h) > 5
        ? 'VOLATILE'
        : 'STABLE';

    return NextResponse.json({
      data: {
        currentIndex: Math.round(currentIndex * 100) / 100,
        prevIndex: Math.round(prevIndex * 100) / 100,
        pctChange24h: Math.round(pctChange24h * 100) / 100,
        lastUpdated: latestObservedAt.toISOString(),
        sampleCount: latestRows.length,
        runId: latestRecord.runId,
        status
      },
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/index ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to compute APIx index overview' } },
      { status: 500 }
    );
  }
}
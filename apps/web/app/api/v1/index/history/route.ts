import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { IndexHistoryQuerySchema } from '@/lib/validation';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const auth = await requireApiKey(req, 'read:index');
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const query = IndexHistoryQuerySchema.parse(Object.fromEntries(searchParams));

    // 1. Fetch basket routes
    const routes = await db.route.findMany({
      orderBy: { weight: 'desc' }
    });

    // 2. Build where clause for from/to filters
    const where: any = {};
    if (query.from || query.to) {
      where.observedAt = {};
      if (query.from) where.observedAt.gte = new Date(query.from);
      if (query.to) where.observedAt.lte = new Date(query.to);
    }

    // 3. Fetch distinct run timestamps from index_results (DB3) - latest first
    const distinctRuns = await db.indexResult.findMany({
      where,
      select: { observedAt: true, runId: true },
      distinct: ['observedAt'],
      orderBy: { observedAt: 'desc' },
      take: query.limit
    });

    if (distinctRuns.length === 0) {
      return NextResponse.json({
        data: [],
        meta: {
          generated_at: new Date().toISOString(),
          total: 0
        }
      });
    }

    // 4. Single query to fetch all index_results for all runs (fixes N+1)
    const runTimestamps = distinctRuns.map(r => r.observedAt);
    const allRows = await db.indexResult.findMany({
      where: { observedAt: { in: runTimestamps } }
    });

    // Group rows by observedAt for efficient lookup
    const rowsByRun = new Map<string, typeof allRows>();
    for (const row of allRows) {
      const key = row.observedAt.toISOString();
      if (!rowsByRun.has(key)) rowsByRun.set(key, []);
      rowsByRun.get(key)!.push(row);
    }

    const historyPoints = [];

    for (const run of distinctRuns) {
      const rows = rowsByRun.get(run.observedAt.toISOString()) || [];

      let totalIndex = 0;
      let delBomContrib = 0;
      let delBlrContrib = 0;
      let bomBlrContrib = 0;

      for (const r of routes) {
        const matchingRows = rows.filter(
          (row) =>
            (row.origin === r.origin && row.destination === r.destination) ||
            (row.origin === r.destination && row.destination === r.origin)
        );

        const avgRouteIndex =
          matchingRows.length > 0
            ? matchingRows.reduce((acc, row) => acc + row.indexValue, 0) / matchingRows.length
            : 100.0;

        const contrib = r.weight * avgRouteIndex;
        totalIndex += contrib;

        if (r.id === 'DEL-BOM') delBomContrib = contrib;
        if (r.id === 'DEL-BLR') delBlrContrib = contrib;
        if (r.id === 'BOM-BLR') bomBlrContrib = contrib;
      }

      historyPoints.push({
        timestamp: run.observedAt.toISOString(),
        runId: run.runId,
        indexValue: Math.round(totalIndex * 100) / 100,
        delBomContribution: Math.round(delBomContrib * 100) / 100,
        delBlrContribution: Math.round(delBlrContrib * 100) / 100,
        bomBlrContribution: Math.round(bomBlrContrib * 100) / 100
      });
    }

    return NextResponse.json({
      data: historyPoints,
      meta: {
        generated_at: new Date().toISOString(),
        total: historyPoints.length
      }
    });
  } catch (error: any) {
    console.error('[API GET /api/v1/index/history ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid query parameters' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch index history time series' } },
      { status: 500 }
    );
  }
}
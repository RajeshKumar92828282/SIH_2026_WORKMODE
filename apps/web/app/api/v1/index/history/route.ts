import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { IndexHistoryQuerySchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = IndexHistoryQuerySchema.parse(Object.fromEntries(searchParams));

    // Group index_results by computedAt
    const distinctTicks = await db.indexResult.findMany({
      select: { computedAt: true },
      distinct: ['computedAt'],
      orderBy: { computedAt: 'asc' },
      take: query.limit
    });

    const historyPoints = [];

    for (const tick of distinctTicks) {
      const rows = await db.indexResult.findMany({
        where: { computedAt: tick.computedAt }
      });

      const totalIndex = rows.reduce((acc, r) => acc + Number(r.indexContribution), 0);

      const delBomContrib = rows
        .filter((r) => r.routeId === 'DEL-BOM')
        .reduce((acc, r) => acc + Number(r.indexContribution), 0);

      const delBlrContrib = rows
        .filter((r) => r.routeId === 'DEL-BLR')
        .reduce((acc, r) => acc + Number(r.indexContribution), 0);

      const bomBlrContrib = rows
        .filter((r) => r.routeId === 'BOM-BLR')
        .reduce((acc, r) => acc + Number(r.indexContribution), 0);

      historyPoints.push({
        timestamp: tick.computedAt.toISOString(),
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
  } catch (error) {
    console.error('[API GET /api/v1/index/history ERROR]', error);
    return NextResponse.json(
      { error: { code: 'bad_request', message: 'Failed to fetch index history time series' } },
      { status: 400 }
    );
  }
}

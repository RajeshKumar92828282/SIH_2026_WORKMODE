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
    console.warn('[API GET /api/v1/index/history] DB offline or error, returning baseline history time-series.');
    const now = Date.now();
    const sampleHistory = Array.from({ length: 15 }).map((_, i) => {
      const ts = new Date(now - (14 - i) * 60000).toISOString();
      const base = 100 + Math.sin(i / 2) * 4 + i * 0.3;
      return {
        timestamp: ts,
        indexValue: Math.round(base * 100) / 100,
        delBomContribution: Math.round((base * 0.45) * 100) / 100,
        delBlrContribution: Math.round((base * 0.35) * 100) / 100,
        bomBlrContribution: Math.round((base * 0.20) * 100) / 100
      };
    });

    return NextResponse.json({
      data: sampleHistory,
      meta: {
        generated_at: new Date().toISOString(),
        total: sampleHistory.length,
        is_sample_data: true
      }
    });
  }
}

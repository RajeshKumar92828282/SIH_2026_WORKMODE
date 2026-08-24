import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const latestRecord = await db.indexResult.findFirst({
      orderBy: { observedAt: 'desc' }
    });

    const latestRows = latestRecord
      ? await db.indexResult.findMany({ where: { observedAt: latestRecord.observedAt } })
      : [];

    const hubs = [
      { state: 'Delhi (NCR)', code: 'DEL', match: ['DEL', 'Delhi'], hub: 'Indira Gandhi Intl (DEL)' },
      { state: 'Maharashtra', code: 'MH', match: ['BOM', 'Mumbai'], hub: 'Chhatrapati Shivaji Intl (BOM)' },
      { state: 'Karnataka', code: 'KA', match: ['BLR', 'Bangalore', 'Bengaluru'], hub: 'Kempegowda Intl (BLR)' },
      { state: 'Tamil Nadu', code: 'TN', match: ['MAA', 'Chennai'], hub: 'Chennai Intl (MAA)' },
      { state: 'West Bengal', code: 'WB', match: ['CCU', 'Kolkata'], hub: 'Netaji Subhash Chandra Bose (CCU)' },
      { state: 'Telangana', code: 'TG', match: ['HYD', 'Hyderabad'], hub: 'Rajiv Gandhi Intl (HYD)' }
    ];

    const stateHeatmap = hubs.map((h) => {
      const matchingRows = latestRows.filter(
        (row) => h.match.includes(row.origin) || h.match.includes(row.destination)
      );

      const avgIndex =
        matchingRows.length > 0
          ? matchingRows.reduce((acc, r) => acc + r.indexValue, 0) / matchingRows.length
          : 100.0;

      const rounded = Math.round(avgIndex * 100) / 100;
      const status = rounded > 105 ? 'HIGH' : rounded > 102 ? 'MODERATE' : 'STABLE';

      return {
        state: h.state,
        code: h.code,
        indexValue: rounded,
        status,
        hub: h.hub
      };
    });

    return NextResponse.json({
      data: stateHeatmap,
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/heatmap ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch heatmap data' } },
      { status: 500 }
    );
  }
}

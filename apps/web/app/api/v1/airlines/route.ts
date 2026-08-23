import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const carriers = await db.carrier.findMany();
    const latestTickRecord = await db.indexResult.findFirst({
      orderBy: { computedAt: 'desc' }
    });

    const carrierStats = await Promise.all(
      carriers.map(async (c) => {
        let avgFare = 0;
        let avgDiff = 0;
        let avgPctChange = 0;

        if (latestTickRecord) {
          const rows = await db.indexResult.findMany({
            where: {
              computedAt: latestTickRecord.computedAt,
              carrierId: c.id
            }
          });

          if (rows.length > 0) {
            avgFare = rows.reduce((acc, r) => acc + Number(r.liveTotalFare), 0) / rows.length;
            avgDiff = rows.reduce((acc, r) => acc + Number(r.fareDiff), 0) / rows.length;
            avgPctChange = rows.reduce((acc, r) => acc + r.pctChange, 0) / rows.length;
          }
        }

        return {
          id: c.id,
          name: c.name,
          code: c.code,
          avgLiveFare: Math.round(avgFare),
          avgFareDiff: Math.round(avgDiff),
          avgPctChange: Math.round(avgPctChange * 100) / 100
        };
      })
    );

    return NextResponse.json({
      data: carrierStats,
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/airlines ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch airline comparison data' } },
      { status: 500 }
    );
  }
}

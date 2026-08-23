import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const latestTickRecord = await db.indexResult.findFirst({
      orderBy: { computedAt: 'desc' }
    });

    const windows = ['T+1', 'T+15'];

    const result = await Promise.all(
      windows.map(async (leadTimeWindow) => {
        let avgLiveFare = 0;
        let avgStaticFare = 0;
        let avgPctChange = 0;

        if (latestTickRecord) {
          const rows = await db.indexResult.findMany({
            where: {
              computedAt: latestTickRecord.computedAt,
              leadTimeWindow
            }
          });

          if (rows.length > 0) {
            avgLiveFare = rows.reduce((acc, r) => acc + Number(r.liveTotalFare), 0) / rows.length;
            avgStaticFare = rows.reduce((acc, r) => acc + Number(r.staticTotalFare), 0) / rows.length;
            avgPctChange = rows.reduce((acc, r) => acc + r.pctChange, 0) / rows.length;
          }
        }

        return {
          window: leadTimeWindow,
          label: leadTimeWindow === 'T+1' ? '1 Day Advance (Urgent)' : '15 Days Advance (Planned)',
          avgLiveFare: Math.round(avgLiveFare),
          avgStaticFare: Math.round(avgStaticFare),
          pctChange: Math.round(avgPctChange * 100) / 100,
          premium: leadTimeWindow === 'T+1' ? '+45% (Urgency Premium)' : 'Base Baseline'
        };
      })
    );

    return NextResponse.json({
      data: result,
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API GET /api/v1/lead-time ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch lead-time analysis' } },
      { status: 500 }
    );
  }
}

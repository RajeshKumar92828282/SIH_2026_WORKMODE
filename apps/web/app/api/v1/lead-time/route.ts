import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  const auth = await requireApiKey(req as any, 'read:index');
  if (auth instanceof NextResponse) return auth;

  try {
    // Use actual advance_window field instead of flight_time heuristics
    const t1Live = await db.liveFare.aggregate({
      where: {
        advanceWindow: 'T+1'
      },
      _avg: { totalFare: true }
    });

    const t1Static = await db.staticFare.aggregate({
      where: {
        advanceWindow: 'T+1'
      },
      _avg: { totalFare: true }
    });

    const t15Live = await db.liveFare.aggregate({
      where: {
        advanceWindow: 'T+15'
      },
      _avg: { totalFare: true }
    });

    const t15Static = await db.staticFare.aggregate({
      where: {
        advanceWindow: 'T+15'
      },
      _avg: { totalFare: true }
    });

    const t1LiveAvg = t1Live._avg.totalFare || 0;
    const t1StaticAvg = t1Static._avg.totalFare || 0;
    const t1Pct = t1StaticAvg > 0 ? ((t1LiveAvg - t1StaticAvg) / t1StaticAvg) * 100 : 0;

    const t15LiveAvg = t15Live._avg.totalFare || 0;
    const t15StaticAvg = t15Static._avg.totalFare || 0;
    const t15Pct = t15StaticAvg > 0 ? ((t15LiveAvg - t15StaticAvg) / t15StaticAvg) * 100 : 0;

    const result = [
      {
        window: 'T+1',
        label: '1 Day Advance (Urgent Window)',
        avgLiveFare: Math.round(t1LiveAvg),
        avgStaticFare: Math.round(t1StaticAvg),
        pctChange: Math.round(t1Pct * 100) / 100,
        premium: t1Pct > 0 ? `+${Math.round(t1Pct)}% (Urgency Premium)` : 'Base'
      },
      {
        window: 'T+15',
        label: '15 Days Advance (Planned Window)',
        avgLiveFare: Math.round(t15LiveAvg),
        avgStaticFare: Math.round(t15StaticAvg),
        pctChange: Math.round(t15Pct * 100) / 100,
        premium: 'Base Baseline'
      }
    ];

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
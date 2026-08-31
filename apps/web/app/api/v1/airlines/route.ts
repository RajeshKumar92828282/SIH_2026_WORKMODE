import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  const auth = await requireApiKey(req as any, 'read:index');
  if (auth instanceof NextResponse) return auth;

  try {
    const carriers = await db.carrier.findMany({
      orderBy: { name: 'asc' }
    });

    const carrierStats = await Promise.all(
      carriers.map(async (c: any) => {
        // Match carrier by exact name or code
        const liveAgg = await db.liveFare.aggregate({
          where: {
            OR: [
              { carrier: c.name },
              { carrier: c.code }
            ]
          },
          _avg: { totalFare: true }
        });

        const staticAgg = await db.staticFare.aggregate({
          where: {
            OR: [
              { carrier: c.name },
              { carrier: c.code }
            ]
          },
          _avg: { totalFare: true }
        });

        const avgLive = liveAgg._avg.totalFare || 0;
        const avgStatic = staticAgg._avg.totalFare || avgLive;
        const diff = avgLive - avgStatic;
        const pctChange = avgStatic > 0 ? (diff / avgStatic) * 100 : 0;

        return {
          id: c.id,
          name: c.name,
          code: c.code,
          avgLiveFare: Math.round(avgLive),
          avgFareDiff: Math.round(diff),
          avgPctChange: Math.round(pctChange * 100) / 100
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
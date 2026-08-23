import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ObservationsQuerySchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = ObservationsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: any = {};
    if (query.route) where.routeId = query.route;
    if (query.carrier) where.carrierId = query.carrier;
    if (query.leadTime) where.leadTimeWindow = query.leadTime;

    const skip = (query.page - 1) * query.limit;

    const [total, observations] = await Promise.all([
      db.indexResult.count({ where }),
      db.indexResult.findMany({
        where,
        orderBy: { computedAt: 'desc' },
        skip,
        take: query.limit
      })
    ]);

    return NextResponse.json({
      data: observations.map((o) => ({
        id: o.id,
        computedAt: o.computedAt.toISOString(),
        routeId: o.routeId,
        carrierId: o.carrierId,
        leadTimeWindow: o.leadTimeWindow,
        staticTotalFare: Number(o.staticTotalFare),
        liveTotalFare: Number(o.liveTotalFare),
        fareDiff: Number(o.fareDiff),
        pctChange: Math.round(o.pctChange * 100) / 100,
        relativePrice: Math.round(o.relativePrice * 100) / 100,
        routeWeight: o.routeWeight,
        indexContribution: Math.round(o.indexContribution * 100) / 100
      })),
      meta: {
        generated_at: new Date().toISOString(),
        page: query.page,
        total,
        limit: query.limit
      }
    });
  } catch (error) {
    console.error('[API GET /api/v1/observations ERROR]', error);
    return NextResponse.json(
      { error: { code: 'bad_request', message: 'Failed to fetch observations' } },
      { status: 400 }
    );
  }
}

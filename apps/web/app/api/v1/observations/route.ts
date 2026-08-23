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
    console.warn('[API GET /api/v1/observations] DB offline or error, returning baseline observations.');
    return NextResponse.json({
      data: [
        {
          id: 1,
          computedAt: new Date().toISOString(),
          routeId: 'DEL-BOM',
          carrierId: 'IGO',
          leadTimeWindow: 'T+1',
          staticTotalFare: 6400,
          liveTotalFare: 6850,
          fareDiff: 450,
          pctChange: 7.03,
          relativePrice: 107.03,
          routeWeight: 0.45,
          indexContribution: 12.04
        },
        {
          id: 2,
          computedAt: new Date().toISOString(),
          routeId: 'DEL-BOM',
          carrierId: 'SEJ',
          leadTimeWindow: 'T+15',
          staticTotalFare: 4180,
          liveTotalFare: 4250,
          fareDiff: 70,
          pctChange: 1.67,
          relativePrice: 101.67,
          routeWeight: 0.45,
          indexContribution: 11.44
        },
        {
          id: 3,
          computedAt: new Date().toISOString(),
          routeId: 'DEL-BLR',
          carrierId: 'IGO',
          leadTimeWindow: 'T+1',
          staticTotalFare: 7200,
          liveTotalFare: 7500,
          fareDiff: 300,
          pctChange: 4.17,
          relativePrice: 104.17,
          routeWeight: 0.35,
          indexContribution: 9.11
        }
      ],
      meta: {
        generated_at: new Date().toISOString(),
        page: 1,
        total: 3,
        limit: 50,
        is_sample_data: true
      }
    });
  }
}

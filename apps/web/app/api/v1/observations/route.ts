import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ObservationsQuerySchema } from '@/lib/validation';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const auth = await requireApiKey(req, 'read:observations');
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const query = ObservationsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: any = {};
    if (query.route) {
      const parts = query.route.split('-');
      if (parts.length === 2) {
        where.OR = [
          { origin: parts[0], destination: parts[1] },
          { origin: parts[1], destination: parts[0] }
        ];
      }
    }
    if (query.carrier) {
      where.carrier = { contains: query.carrier, mode: 'insensitive' };
    }
    if (query.leadTime) {
      where.advanceWindow = query.leadTime;
    }

    const skip = (query.page - 1) * query.limit;

    // Fast count for massive 1.7M dataset if unfiltered, otherwise exact count
    let totalPromise: Promise<number>;
    if (Object.keys(where).length === 0) {
      totalPromise = db.$queryRawUnsafe(
        `SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = 'live_fares'`
      ).then((res: any) => Number(res[0]?.estimate) || 1767513);
    } else {
      totalPromise = db.liveFare.count({ where });
    }

    const [total, observations] = await Promise.all([
      totalPromise,
      db.liveFare.findMany({
        where,
        orderBy: { observedAt: 'desc' },
        skip,
        take: query.limit
      })
    ]);

    return NextResponse.json({
      data: observations.map((o: any) => ({
        id: o.id,
        carrier: o.carrier,
        flightNumber: o.flightNumber,
        flightDate: o.flightDate.toISOString().split('T')[0],
        origin: o.origin,
        destination: o.destination,
        flightTime: o.flightTime,
        cabinClass: o.cabinClass,
        advanceWindow: o.advanceWindow || 'Standard',
        baseFare: o.baseFare ? Math.round(o.baseFare) : null,
        taxes: o.taxes ? Math.round(o.taxes) : null,
        totalFare: Math.round(o.totalFare),
        observedAt: o.observedAt.toISOString()
      })),
      meta: {
        generated_at: new Date().toISOString(),
        page: query.page,
        total,
        limit: query.limit
      }
    });
  } catch (error: any) {
    console.error('[API GET /api/v1/observations ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid observation query' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to fetch observations' } },
      { status: 500 }
    );
  }
}
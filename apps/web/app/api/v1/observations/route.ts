import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ObservationsQuerySchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = ObservationsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: any = {};
    if (query.route) {
      const parts = query.route.split('-');
      if (parts.length === 2) {
        where.OR = [
          { origin: parts[0], destination: parts[1] },
          { origin: parts[0] === 'DEL' ? 'Delhi' : parts[0] === 'BOM' ? 'Mumbai' : 'Bangalore', destination: parts[1] === 'BOM' ? 'Mumbai' : parts[1] === 'BLR' ? 'Bangalore' : 'Delhi' }
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

    const [total, observations] = await Promise.all([
      db.liveFare.count({ where }),
      db.liveFare.findMany({
        where,
        orderBy: { observedAt: 'desc' },
        skip,
        take: query.limit
      })
    ]);

    return NextResponse.json({
      data: observations.map((o) => ({
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

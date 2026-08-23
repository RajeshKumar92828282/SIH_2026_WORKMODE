import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      data: alerts.map((a) => ({
        id: a.id,
        type: a.type,
        routeId: a.routeId,
        message: a.message,
        createdAt: a.createdAt.toISOString()
      })),
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.warn('[API GET /api/v1/alerts] DB offline, returning sample alerts.');
    return NextResponse.json({
      data: [
        {
          id: 1,
          type: 'FARE_SPIKE',
          routeId: 'DEL-BOM',
          message: 'Sharp fare spike (+27.4%) detected on route DEL-BOM (IndiGo, T+1)',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          type: 'DATA_QUALITY',
          routeId: 'DEL-BLR',
          message: 'Normal market variance recorded within 5% band across all carriers',
          createdAt: new Date().toISOString()
        }
      ],
      meta: {
        generated_at: new Date().toISOString(),
        is_sample_data: true
      }
    });
  }
}

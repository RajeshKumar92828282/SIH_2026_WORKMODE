import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireApiKey } from '@/lib/auth-middleware';

export async function GET(req: Request) {
  const auth = await requireApiKey(req as any, 'read:index');
  if (auth instanceof NextResponse) return auth;

  try {
    const latestRecord = await db.indexResult.findFirst({
      orderBy: { observedAt: 'desc' }
    });

    const latestRows = latestRecord
      ? await db.indexResult.findMany({ where: { observedAt: latestRecord.observedAt } })
      : [];

    // Get actual routes from DB
    const routes = await db.route.findMany({
      select: { origin: true, destination: true, weight: true }
    });

    // Build state mapping from actual routes
    const stateMap = new Map<string, { state: string; code: string; hub: string; origins: string[] }>();
    
    for (const route of routes) {
      const originState = getStateFromAirport(route.origin);
      const destState = getStateFromAirport(route.destination);
      
      if (!stateMap.has(originState.code)) {
        stateMap.set(originState.code, { 
          state: originState.state, 
          code: originState.code, 
          hub: originState.hub,
          origins: [] 
        });
      }
      stateMap.get(originState.code)!.origins.push(route.origin);
      
      if (!stateMap.has(destState.code)) {
        stateMap.set(destState.code, { 
          state: destState.state, 
          code: destState.code, 
          hub: destState.hub,
          origins: [] 
        });
      }
      stateMap.get(destState.code)!.origins.push(route.destination);
    }

    const stateHeatmap = Array.from(stateMap.values()).map((h) => {
      const matchingRows = latestRows.filter(
        (row) => h.origins.includes(row.origin) || h.origins.includes(row.destination)
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

function getStateFromAirport(airport: string): { state: string; code: string; hub: string } {
  const airportMap: Record<string, { state: string; code: string; hub: string }> = {
    'DEL': { state: 'Delhi (NCR)', code: 'DL', hub: 'Indira Gandhi Intl (DEL)' },
    'BOM': { state: 'Maharashtra', code: 'MH', hub: 'Chhatrapati Shivaji Intl (BOM)' },
    'BLR': { state: 'Karnataka', code: 'KA', hub: 'Kempegowda Intl (BLR)' },
    'MAA': { state: 'Tamil Nadu', code: 'TN', hub: 'Chennai Intl (MAA)' },
    'CCU': { state: 'West Bengal', code: 'WB', hub: 'Netaji Subhash Chandra Bose (CCU)' },
    'HYD': { state: 'Telangana', code: 'TG', hub: 'Rajiv Gandhi Intl (HYD)' },
  };
  return airportMap[airport] || { state: 'Unknown', code: 'UN', hub: 'Unknown' };
}
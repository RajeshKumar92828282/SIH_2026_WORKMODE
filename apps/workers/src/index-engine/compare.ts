import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runCompareEngine(computedAt: Date) {
  console.log(`[INDEX ENGINE] Running 2-pass compare job at ${computedAt.toISOString()}...`);

  // Fetch static baseline, live mutated fares, and route weights
  const staticFares = await prisma.staticFare.findMany();
  const liveFares = await prisma.liveFare.findMany();
  const routes = await prisma.route.findMany();

  const routeWeightMap = new Map<string, number>();
  routes.forEach((r) => routeWeightMap.set(r.id, r.weight));

  const staticMap = new Map<string, typeof staticFares[0]>();
  staticFares.forEach((sf) => {
    const key = `${sf.routeId}_${sf.carrierId}_${sf.leadTimeWindow}`;
    staticMap.set(key, sf);
  });

  // Intermediate raw calculation objects
  interface RawPairing {
    routeId: string;
    carrierId: string;
    leadTimeWindow: string;
    staticTotal: number;
    liveTotal: number;
    fareDiff: number;
    pctChange: number;
    relativePrice: number;
    routeWeight: number;
  }

  const rawPairings: RawPairing[] = [];

  for (const lf of liveFares) {
    const key = `${lf.routeId}_${lf.carrierId}_${lf.leadTimeWindow}`;
    const sf = staticMap.get(key);
    if (!sf) continue;

    const staticTotal = Number(sf.totalFare);
    const liveTotal = Number(lf.totalFare);
    const fareDiff = liveTotal - staticTotal;
    const pctChange = staticTotal > 0 ? (fareDiff / staticTotal) * 100 : 0;
    const relativePrice = staticTotal > 0 ? (liveTotal / staticTotal) * 100 : 100;
    const routeWeight = routeWeightMap.get(lf.routeId) ?? 0;

    rawPairings.push({
      routeId: lf.routeId,
      carrierId: lf.carrierId,
      leadTimeWindow: lf.leadTimeWindow,
      staticTotal,
      liveTotal,
      fareDiff,
      pctChange,
      relativePrice,
      routeWeight
    });
  }

  // --- PASS 1: Per-route aggregation (average relative price per route) ---
  const routeSums = new Map<string, { sumRelPrice: number; count: number }>();
  for (const p of rawPairings) {
    const current = routeSums.get(p.routeId) ?? { sumRelPrice: 0, count: 0 };
    routeSums.set(p.routeId, {
      sumRelPrice: current.sumRelPrice + p.relativePrice,
      count: current.count + 1
    });
  }

  const routeAvgRelPrice = new Map<string, number>();
  for (const [routeId, data] of routeSums.entries()) {
    routeAvgRelPrice.set(routeId, data.sumRelPrice / data.count);
  }

  // --- PASS 2: Weighting pass & proration per row ---
  // Each route has total index contribution = routeWeight * routeAvgRelPrice
  // Each row in that route receives a prorated portion (total_contrib / row_count)
  const indexResultsToInsert = rawPairings.map((p) => {
    const avgRelPrice = routeAvgRelPrice.get(p.routeId) ?? 100;
    const totalRouteContribution = p.routeWeight * avgRelPrice;
    const routeRowCount = routeSums.get(p.routeId)?.count ?? 1;
    const rowContribution = totalRouteContribution / routeRowCount;

    return {
      computedAt,
      routeId: p.routeId,
      carrierId: p.carrierId,
      leadTimeWindow: p.leadTimeWindow,
      staticTotalFare: p.staticTotal,
      liveTotalFare: p.liveTotal,
      fareDiff: p.fareDiff,
      pctChange: p.pctChange,
      relativePrice: p.relativePrice,
      routeWeight: p.routeWeight,
      indexContribution: rowContribution
    };
  });

  // Append-only write into index_results (DB3)
  await prisma.indexResult.createMany({
    data: indexResultsToInsert
  });

  console.log(`[INDEX ENGINE] Appended ${indexResultsToInsert.length} index_results rows at tick ${computedAt.toISOString()}.`);

  // Check for alerts (>25% spike)
  for (const p of rawPairings) {
    if (p.pctChange > 25) {
      await prisma.alert.create({
        data: {
          type: 'FARE_SPIKE',
          routeId: p.routeId,
          message: `Sharp fare spike (+${p.pctChange.toFixed(1)}%) detected on route ${p.routeId} (${p.carrierId}, ${p.leadTimeWindow})`
        }
      });
      console.log(`[ALERT] Spike detected on ${p.routeId}: +${p.pctChange.toFixed(1)}%`);
    }
  }
}

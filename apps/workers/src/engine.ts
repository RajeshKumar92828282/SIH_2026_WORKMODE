import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROUTE_WEIGHTS: Record<string, number> = {
  'DEL-BOM': 0.45,
  'DEL-BLR': 0.35,
  'BOM-BLR': 0.20,
};

export async function runSimulationCycle(cycleNumber: number) {
  console.log(`\n==================================================`);
  console.log(`[WORKER TICK #${cycleNumber}] Starting simulation cycle at ${new Date().toISOString()}`);
  console.log(`==================================================`);

  try {
    // 1. Fetch static base fares
    const staticFares = await prisma.staticFare.findMany();
    if (staticFares.length === 0) {
      console.log('[WORKER TICK] No static baseline fares found in DB. Skipping tick.');
      return;
    }

    // 2. Mutate live fares (DB2)
    for (const staticFare of staticFares) {
      const swingPct = (Math.random() * 0.12 - 0.04); // -4% to +8% swing
      const newLiveFare = Math.round(staticFare.totalFare * (1 + swingPct));

      await prisma.liveFare.upsert({
        where: {
          routeId_carrierId_leadTimeWindow: {
            routeId: staticFare.routeId,
            carrierId: staticFare.carrierId,
            leadTimeWindow: staticFare.leadTimeWindow,
          },
        },
        update: {
          totalFare: newLiveFare,
          updatedAt: new Date(),
        },
        create: {
          routeId: staticFare.routeId,
          carrierId: staticFare.carrierId,
          leadTimeWindow: staticFare.leadTimeWindow,
          origin: staticFare.origin,
          destination: staticFare.destination,
          baseFare: Math.round(newLiveFare * 0.75),
          fuelSurcharge: Math.round(newLiveFare * 0.15),
          airportFee: Math.round(newLiveFare * 0.05),
          taxes: Math.round(newLiveFare * 0.05),
          totalFare: newLiveFare,
          updatedAt: new Date(),
        },
      });
    }

    // 3. Compute 2-pass weight-normalized index
    const liveFares = await prisma.liveFare.findMany();
    const staticMap = new Map(
      staticFares.map((sf) => [`${sf.routeId}_${sf.carrierId}_${sf.leadTimeWindow}`, sf.totalFare])
    );

    // Pass 1: Aggregate relative prices by route
    const routePrices: Record<string, number[]> = {};
    for (const lf of liveFares) {
      const staticFare = staticMap.get(`${lf.routeId}_${lf.carrierId}_${lf.leadTimeWindow}`);
      if (staticFare && staticFare > 0) {
        const relativePrice = (lf.totalFare / staticFare) * 100;
        if (!routePrices[lf.routeId]) routePrices[lf.routeId] = [];
        routePrices[lf.routeId].push(relativePrice);
      }
    }

    // Pass 2: Apply route weights once per route
    let totalIndex = 0;
    const now = new Date();

    for (const [routeId, prices] of Object.entries(routePrices)) {
      const avgRelPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const weight = ROUTE_WEIGHTS[routeId] || (1 / Object.keys(routePrices).length);
      const contribution = avgRelPrice * weight;
      totalIndex += contribution;

      const [origin, destination] = routeId.split('-');
      await prisma.indexResult.create({
        data: {
          observedAt: now,
          indexType: 'HEADLINE',
          routeId,
          origin: origin || 'DEL',
          destination: destination || 'BOM',
          indexValue: Math.round(avgRelPrice * 100) / 100,
          rawAggregatePrice: Math.round(avgRelPrice * 45),
        },
      });
    }

    console.log(`[WORKER TICK #${cycleNumber}] Overall APIx Index: ${totalIndex.toFixed(2)} pts`);
    console.log(`[WORKER TICK #${cycleNumber}] Cycle completed successfully.`);
    console.log(`==================================================\n`);
  } catch (err: any) {
    console.error(`[WORKER TICK #${cycleNumber} ERROR]`, err?.message || err);
  }
}

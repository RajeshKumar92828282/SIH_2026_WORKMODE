import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROUTE_WEIGHTS: Record<string, number> = {
  'DEL-BOM': 0.45,
  'DEL-BLR': 0.35,
  'BOM-BLR': 0.20,
};

async function ensureDatabaseSeeded() {
  const routesCount = await prisma.route.count();
  if (routesCount === 0) {
    console.log('[WORKER ENGINE] Seeding database routes & carriers...');
    await prisma.route.createMany({
      data: [
        { id: 'DEL-BOM', origin: 'DEL', destination: 'BOM', weight: 0.45 },
        { id: 'DEL-BLR', origin: 'DEL', destination: 'BLR', weight: 0.35 },
        { id: 'BOM-BLR', origin: 'BOM', destination: 'BLR', weight: 0.20 },
      ],
      skipDuplicates: true,
    });
  }

  const carrierCount = await prisma.carrier.count();
  if (carrierCount === 0) {
    await prisma.carrier.createMany({
      data: [
        { id: 'IGO', name: 'IndiGo', code: '6E' },
        { id: 'SEJ', name: 'SpiceJet', code: 'SG' },
        { id: 'AIC', name: 'Air India', code: 'AI' },
        { id: 'VTI', name: 'Vistara', code: 'UK' },
        { id: 'AKJ', name: 'Akasa Air', code: 'QP' },
      ],
      skipDuplicates: true,
    });
  }

  const staticCount = await prisma.staticFare.count();
  if (staticCount === 0) {
    console.log('[WORKER ENGINE] Seeding static_fares baseline (DB1)...');
    const staticRows = [
      { routeId: 'DEL-BOM', carrierId: 'IGO', leadTimeWindow: 'T+1', origin: 'DEL', destination: 'BOM', baseFare: 4800, taxes: 720, fees: 280, totalFare: 5800 },
      { routeId: 'DEL-BOM', carrierId: 'IGO', leadTimeWindow: 'T+15', origin: 'DEL', destination: 'BOM', baseFare: 3200, taxes: 480, fees: 220, totalFare: 3900 },
      { routeId: 'DEL-BOM', carrierId: 'SEJ', leadTimeWindow: 'T+1', origin: 'DEL', destination: 'BOM', baseFare: 4600, taxes: 690, fees: 260, totalFare: 5550 },
      { routeId: 'DEL-BOM', carrierId: 'SEJ', leadTimeWindow: 'T+15', origin: 'DEL', destination: 'BOM', baseFare: 3100, taxes: 465, fees: 205, totalFare: 3770 },
      { routeId: 'DEL-BLR', carrierId: 'IGO', leadTimeWindow: 'T+1', origin: 'DEL', destination: 'BLR', baseFare: 5500, taxes: 825, fees: 325, totalFare: 6650 },
      { routeId: 'DEL-BLR', carrierId: 'IGO', leadTimeWindow: 'T+15', origin: 'DEL', destination: 'BLR', baseFare: 3800, taxes: 570, fees: 250, totalFare: 4620 },
      { routeId: 'DEL-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+1', origin: 'DEL', destination: 'BLR', baseFare: 5300, taxes: 795, fees: 305, totalFare: 6400 },
      { routeId: 'DEL-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+15', origin: 'DEL', destination: 'BLR', baseFare: 3650, taxes: 547, fees: 233, totalFare: 4430 },
      { routeId: 'BOM-BLR', carrierId: 'IGO', leadTimeWindow: 'T+1', origin: 'BOM', destination: 'BLR', baseFare: 3900, taxes: 585, fees: 215, totalFare: 4700 },
      { routeId: 'BOM-BLR', carrierId: 'IGO', leadTimeWindow: 'T+15', origin: 'BOM', destination: 'BLR', baseFare: 2600, taxes: 390, fees: 180, totalFare: 3170 },
      { routeId: 'BOM-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+1', origin: 'BOM', destination: 'BLR', baseFare: 3750, taxes: 562, fees: 208, totalFare: 4520 },
      { routeId: 'BOM-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+15', origin: 'BOM', destination: 'BLR', baseFare: 2500, taxes: 375, fees: 175, totalFare: 3050 },
    ];
    await prisma.staticFare.createMany({ data: staticRows, skipDuplicates: true });
  }

  const resultsCount = await prisma.indexResult.count();
  if (resultsCount === 0) {
    console.log('[WORKER ENGINE] Seeding historical index_results (DB3)...');
    const now = new Date();
    const daysBack = [5, 4, 3, 2, 1, 0];
    const routesList = [
      { id: 'DEL-BOM', origin: 'DEL', dest: 'BOM', rels: [108.4, 109.1, 111.8, 110.2, 112.5, 114.28] },
      { id: 'DEL-BLR', origin: 'DEL', dest: 'BLR', rels: [104.2, 105.0, 106.1, 105.8, 107.2, 108.5] },
      { id: 'BOM-BLR', origin: 'BOM', dest: 'BLR', rels: [101.9, 102.3, 103.0, 102.8, 103.5, 104.1] },
    ];

    for (let i = 0; i < daysBack.length; i++) {
      const dateOffset = new Date(now.getTime() - daysBack[i] * 24 * 60 * 60 * 1000);
      for (const r of routesList) {
        await prisma.indexResult.create({
          data: {
            observedAt: dateOffset,
            indexType: 'HEADLINE',
            routeId: r.id,
            origin: r.origin,
            destination: r.dest,
            indexValue: r.rels[i],
            rawAggregatePrice: Math.round(r.rels[i] * 45),
          },
        });
      }
    }
  }
}

export async function runSimulationCycle(cycleNumber: number) {
  console.log(`\n==================================================`);
  console.log(`[WORKER TICK #${cycleNumber}] Starting simulation cycle at ${new Date().toISOString()}`);
  console.log(`==================================================`);

  try {
    await ensureDatabaseSeeded();

    // 1. Fetch static base fares
    const staticFares = await prisma.staticFare.findMany();

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

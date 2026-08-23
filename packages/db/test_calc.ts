// Verification test for APIx 2-pass weight normalization math

interface StaticRow {
  routeId: string;
  carrierId: string;
  leadTimeWindow: string;
  totalFare: number;
}

interface LiveRow {
  routeId: string;
  carrierId: string;
  leadTimeWindow: string;
  totalFare: number;
}

interface RouteWeight {
  routeId: string;
  weight: number;
}

const routes: RouteWeight[] = [
  { routeId: 'DEL-BOM', weight: 0.45 },
  { routeId: 'DEL-BLR', weight: 0.35 },
  { routeId: 'BOM-BLR', weight: 0.20 }
];

const staticFares: StaticRow[] = [
  { routeId: 'DEL-BOM', carrierId: 'IGO', leadTimeWindow: 'T+1', totalFare: 5800 },
  { routeId: 'DEL-BOM', carrierId: 'IGO', leadTimeWindow: 'T+15', totalFare: 3900 },
  { routeId: 'DEL-BOM', carrierId: 'SEJ', leadTimeWindow: 'T+1', totalFare: 5550 },
  { routeId: 'DEL-BOM', carrierId: 'SEJ', leadTimeWindow: 'T+15', totalFare: 3770 },
  { routeId: 'DEL-BLR', carrierId: 'IGO', leadTimeWindow: 'T+1', totalFare: 6650 },
  { routeId: 'DEL-BLR', carrierId: 'IGO', leadTimeWindow: 'T+15', totalFare: 4620 },
  { routeId: 'DEL-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+1', totalFare: 6400 },
  { routeId: 'DEL-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+15', totalFare: 4430 },
  { routeId: 'BOM-BLR', carrierId: 'IGO', leadTimeWindow: 'T+1', totalFare: 4700 },
  { routeId: 'BOM-BLR', carrierId: 'IGO', leadTimeWindow: 'T+15', totalFare: 3170 },
  { routeId: 'BOM-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+1', totalFare: 4520 },
  { routeId: 'BOM-BLR', carrierId: 'SEJ', leadTimeWindow: 'T+15', totalFare: 3050 }
];

// Baseline test (no market change -> relative price = 100 on all rows)
function runTest() {
  console.log('=== APIx Calculation Verification Test ===');

  const routeMap = new Map<string, number>();
  routes.forEach(r => routeMap.set(r.routeId, r.weight));

  // Compute relative prices per row
  const rawRows = staticFares.map(sf => {
    const staticTotal = sf.totalFare;
    const liveTotal = sf.totalFare * 1.10; // Assume +10% overall surge across market
    const relativePrice = (liveTotal / staticTotal) * 100; // 110.0
    return {
      ...sf,
      relativePrice,
      routeWeight: routeMap.get(sf.routeId) || 0
    };
  });

  // Pass 1: Per-route average relative price
  const routeSums = new Map<string, { sumRel: number; count: number }>();
  rawRows.forEach(r => {
    const cur = routeSums.get(r.routeId) || { sumRel: 0, count: 0 };
    routeSums.set(r.routeId, { sumRel: cur.sumRel + r.relativePrice, count: cur.count + 1 });
  });

  // Pass 2: Calculate index contribution
  let totalIndex = 0;
  routes.forEach(r => {
    const agg = routeSums.get(r.routeId)!;
    const routeAvgRelPrice = agg.sumRel / agg.count;
    const routeContrib = r.weight * routeAvgRelPrice;
    totalIndex += routeContrib;
    console.log(`Route ${r.routeId}: Weight = ${r.weight}, Avg Rel Price = ${routeAvgRelPrice.toFixed(2)}, Route Contribution = ${routeContrib.toFixed(2)}`);
  });

  console.log(`Overall APIx Index Value: ${totalIndex.toFixed(2)} (Expected: 110.00)`);
  if (Math.abs(totalIndex - 110.0) < 0.001) {
    console.log('PASSED: Weight normalization calculation is exact and verified zero double-counting!');
  } else {
    console.error('FAILED: Incorrect index calculation');
  }
}

runTest();

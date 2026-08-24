import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testIndexCalc() {
  console.log('Testing live index computation from PostgreSQL index_results...');

  // 1. Get latest observed_at
  const latestRecord = await prisma.indexResult.findFirst({
    orderBy: { observedAt: 'desc' }
  });

  if (!latestRecord) {
    console.log('No index_results rows found.');
    return;
  }

  console.log('Latest observedAt:', latestRecord.observedAt, 'runId:', latestRecord.runId);

  // 2. Fetch all index_results for latest run
  const latestRows = await prisma.indexResult.findMany({
    where: { observedAt: latestRecord.observedAt }
  });
  console.log(`Fetched ${latestRows.length} index_results rows for latest run.`);

  // 3. Fetch routes
  const routes = await prisma.route.findMany();

  // 4. Calculate per-route average index_value and weighted sum
  let totalIndex = 0;
  for (const r of routes) {
    const matchingRows = latestRows.filter(
      (row) =>
        (row.origin === r.origin && row.destination === r.destination) ||
        (row.origin === r.destination && row.destination === r.origin) ||
        (r.id.includes(row.origin) && r.id.includes(row.destination))
    );

    let routeIndex = 100.0;
    if (matchingRows.length > 0) {
      const sum = matchingRows.reduce((acc, row) => acc + row.indexValue, 0);
      routeIndex = sum / matchingRows.length;
    }
    const contribution = r.weight * routeIndex;
    totalIndex += contribution;
    console.log(`Route ${r.id} (weight: ${r.weight}): avg index = ${routeIndex.toFixed(2)}, contribution = ${contribution.toFixed(2)}`);
  }

  console.log(`\n===> Overall APIx Current Index Value: ${totalIndex.toFixed(2)} <===`);

  await prisma.$disconnect();
}

testIndexCalc();

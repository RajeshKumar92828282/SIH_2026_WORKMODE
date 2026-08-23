import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loadStaticCsv() {
  console.log('[LOADER] Initializing routes, carriers, and static_fares (DB1)...');

  // 1. Seed Routes
  const routesData = [
    { id: 'DEL-BOM', origin: 'Delhi', destination: 'Mumbai', weight: 0.45 },
    { id: 'DEL-BLR', origin: 'Delhi', destination: 'Bengaluru', weight: 0.35 },
    { id: 'BOM-BLR', origin: 'Mumbai', destination: 'Bengaluru', weight: 0.20 }
  ];

  for (const r of routesData) {
    await prisma.route.upsert({
      where: { id: r.id },
      update: { weight: r.weight, origin: r.origin, destination: r.destination },
      create: r
    });
  }

  // 2. Seed Carriers
  const carriersData = [
    { id: 'IGO', name: 'IndiGo', code: '6E' },
    { id: 'SEJ', name: 'SpiceJet', code: 'SG' }
  ];

  for (const c of carriersData) {
    await prisma.carrier.upsert({
      where: { id: c.id },
      update: { name: c.name, code: c.code },
      create: c
    });
  }

  // 3. Read CSV snapshot
  const csvFilePath = path.join(__dirname, '../../../../packages/db/prisma/seed_data.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });

  console.log(`[LOADER] Ingesting ${records.length} fare records from CSV...`);

  for (const record of records) {
    const routeId = record.route_id.trim();
    const carrierId = record.carrier_id.trim();
    const leadTimeWindow = record.lead_time_window.trim();
    const baseFare = parseFloat(record.base_fare);
    const taxes = parseFloat(record.taxes);
    const fees = parseFloat(record.fees);
    const totalFare = parseFloat(record.total_fare);

    // Upsert into static_fares (DB1)
    await prisma.staticFare.upsert({
      where: {
        routeId_carrierId_leadTimeWindow: { routeId, carrierId, leadTimeWindow }
      },
      update: { baseFare, taxes, fees, totalFare },
      create: { routeId, carrierId, leadTimeWindow, baseFare, taxes, fees, totalFare }
    });

    // Initialize live_fares (DB2) matching baseline
    await prisma.liveFare.upsert({
      where: {
        routeId_carrierId_leadTimeWindow: { routeId, carrierId, leadTimeWindow }
      },
      update: { baseFare, taxes, fees, totalFare, tick: 0 },
      create: { routeId, carrierId, leadTimeWindow, baseFare, taxes, fees, totalFare, tick: 0 }
    });
  }

  console.log('[LOADER] Static CSV loading complete!');
}

if (require.main === module) {
  loadStaticCsv()
    .catch((e) => {
      console.error('[LOADER ERROR]', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

import { PrismaClient } from '@prisma/client';

const dbUrl = 'postgresql://neondb_owner:npg_bcTtIoOjLZ01@ep-cool-silence-axleeqyx-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function sampleRows() {
  console.log('--- Sample index_results ---');
  const indexRows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "index_results" ORDER BY observed_at DESC LIMIT 5;`);
  console.log(indexRows);

  console.log('--- Distinct routes in index_results ---');
  const routes: any[] = await prisma.$queryRawUnsafe(`SELECT DISTINCT origin, destination FROM "index_results";`);
  console.log(routes);

  console.log('--- Sample static_fares ---');
  const staticRows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "static_fares" LIMIT 2;`);
  console.log(staticRows);

  console.log('--- Sample live_fares ---');
  const liveRows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "live_fares" LIMIT 2;`);
  console.log(liveRows);

  console.log('--- Distinct carriers in live_fares ---');
  const carriers: any[] = await prisma.$queryRawUnsafe(`SELECT DISTINCT carrier, count(*) FROM "live_fares" GROUP BY carrier;`);
  console.log(carriers);

  await prisma.$disconnect();
}

sampleRows();

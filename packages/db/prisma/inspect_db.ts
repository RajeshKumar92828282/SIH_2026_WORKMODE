import { PrismaClient } from '@prisma/client';

const dbUrl = 'postgresql://neondb_owner:npg_bcTtIoOjLZ01@ep-cool-silence-axleeqyx-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

async function inspectSchema() {
  console.log('Inspecting live database tables & columns...');
  try {
    const columns: any[] = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    console.log(JSON.stringify(columns, null, 2));

    // Also check row counts
    const countStatic: any[] = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "static_fares";`);
    const countLive: any[] = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "live_fares";`);
    const countIndex: any[] = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "index_results";`);
    console.log('\nRow counts in live database:');
    console.log(`static_fares: ${countStatic[0]?.count}`);
    console.log(`live_fares: ${countLive[0]?.count}`);
    console.log(`index_results: ${countIndex[0]?.count}`);
  } catch (err: any) {
    console.error('Inspection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectSchema();

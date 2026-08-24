import { PrismaClient } from '@prisma/client';

const dbUrl = 'postgresql://neondb_owner:npg_bcTtIoOjLZ01@ep-cool-silence-axleeqyx-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

async function checkDatabase() {
  console.log('Connecting to database...');
  try {
    const startTime = Date.now();
    const result: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const elapsed = Date.now() - startTime;
    console.log(`\nConnection SUCCESS! (Response time: ${elapsed}ms)`);
    console.log(`Total public tables found: ${result.length}`);
    if (result.length > 0) {
      console.log('Tables:');
      result.forEach((r, i) => console.log(`  ${i + 1}. ${r.table_name}`));
    } else {
      console.log('Database is currently empty (0 public tables).');
    }
  } catch (err: any) {
    console.error('\nConnection FAILED!');
    console.error('Error details:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectSchema() {
  console.log('Connecting to database:', process.env.DATABASE_URL);
  try {
    const tables: any[] = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log(`\nTotal public tables found: ${tables.length}`);
    tables.forEach((t, i) => console.log(`  ${i + 1}. ${t.table_name}`));

    const columns: any[] = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    console.log('\nColumn details:');
    console.log(JSON.stringify(columns, null, 2));

  } catch (err: any) {
    console.error('Inspection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectSchema();

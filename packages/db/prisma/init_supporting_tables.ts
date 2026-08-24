import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initTables() {
  console.log('--- Initializing Supporting & Governance Tables in PostgreSQL ---');

  const ddlStatements = [
    // 1. routes
    `CREATE TABLE IF NOT EXISTS "routes" (
      "id" TEXT PRIMARY KEY,
      "origin" TEXT NOT NULL,
      "destination" TEXT NOT NULL,
      "weight" DOUBLE PRECISION NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 2. carriers
    `CREATE TABLE IF NOT EXISTS "carriers" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 3. users
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password_hash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'analyst',
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 4. organizations
    `CREATE TABLE IF NOT EXISTS "organizations" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "contact_email" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    // 5. api_keys
    `CREATE TABLE IF NOT EXISTS "api_keys" (
      "id" TEXT PRIMARY KEY,
      "org_id" TEXT NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "key_hash" TEXT NOT NULL UNIQUE,
      "key_mask" TEXT NOT NULL,
      "scope" TEXT NOT NULL DEFAULT 'read:index',
      "rate_tier" TEXT NOT NULL DEFAULT 'standard',
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "revoked_at" TIMESTAMP(3)
    );`,
    `CREATE INDEX IF NOT EXISTS "api_keys_org_id_idx" ON "api_keys"("org_id");`,

    // 6. alerts
    `CREATE TABLE IF NOT EXISTS "alerts" (
      "id" SERIAL PRIMARY KEY,
      "type" TEXT NOT NULL,
      "route_id" TEXT REFERENCES "routes"("id") ON DELETE SET NULL,
      "message" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS "alerts_created_at_idx" ON "alerts"("created_at");`,

    // 7. audit_logs
    `CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" SERIAL PRIMARY KEY,
      "actor" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "target" TEXT NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");`
  ];

  for (const ddl of ddlStatements) {
    await prisma.$executeRawUnsafe(ddl);
  }

  console.log('✅ All 7 supporting tables and indexes successfully created in PostgreSQL!');

  // Verify all tables in public schema
  const tables: any[] = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log('\nCurrent public schema tables:');
  tables.forEach((t, i) => console.log(`  ${i + 1}. ${t.table_name}`));

  await prisma.$disconnect();
}

initTables().catch((e) => {
  console.error('Init tables failed:', e);
  process.exit(1);
});

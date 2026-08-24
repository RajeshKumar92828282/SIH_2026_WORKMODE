import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function seedDatabase() {
  console.log('[SEED] Starting supporting & admin provisioning...');

  // 1. Seed Routes (MVP basket with DGCA proportional traffic share weights summing to 1.0)
  // Note: Weights are derived from DGCA annual domestic passenger traffic shares across top metro pairs
  const routesData = [
    { id: 'DEL-BOM', origin: 'DEL', destination: 'BOM', weight: 0.45 },
    { id: 'DEL-BLR', origin: 'DEL', destination: 'BLR', weight: 0.35 },
    { id: 'BOM-BLR', origin: 'BOM', destination: 'BLR', weight: 0.20 }
  ];

  for (const r of routesData) {
    await prisma.route.upsert({
      where: { id: r.id },
      update: { origin: r.origin, destination: r.destination, weight: r.weight },
      create: r
    });
  }
  console.log(`[SEED] Seeded ${routesData.length} MVP basket routes (weights sum to 1.0).`);

  // 2. Seed Carriers
  const carriersData = [
    { id: 'IGO', name: 'IndiGo', code: '6E' },
    { id: 'SEJ', name: 'SpiceJet', code: 'SG' },
    { id: 'AIC', name: 'Air India', code: 'AI' },
    { id: 'VTI', name: 'Vistara', code: 'UK' }
  ];

  for (const c of carriersData) {
    await prisma.carrier.upsert({
      where: { id: c.id },
      update: { name: c.name, code: c.code },
      create: c
    });
  }
  console.log(`[SEED] Seeded ${carriersData.length} domestic carriers.`);

  // 3. Seed Organizations
  const orgs = [
    {
      id: 'org_rbi_mpd',
      name: 'Reserve Bank of India (Monetary Policy Dept)',
      type: 'rbi',
      contactEmail: 'mpd@rbi.org.in'
    },
    {
      id: 'org_nso_cpi',
      name: 'National Statistical Office (Price Statistics Division)',
      type: 'nso',
      contactEmail: 'cpi-division@mospi.gov.in'
    },
    {
      id: 'org_dgca_stats',
      name: 'Directorate General of Civil Aviation (DGCA)',
      type: 'govt_agency',
      contactEmail: 'stats@dgca.gov.in'
    },
    {
      id: 'org_macro_research',
      name: 'Centre for Advanced Macroeconomic Research',
      type: 'researcher',
      contactEmail: 'macro-analytics@res.org.in'
    }
  ];

  for (const org of orgs) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: { name: org.name, type: org.type, contactEmail: org.contactEmail },
      create: org
    });
  }
  console.log(`[SEED] Seeded ${orgs.length} institutional organizations.`);

  // 4. Seed Admin User (Password from ENV var — NEVER hardcoded in production)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@apix.gov.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@APIx2026!';
  const passwordHash = hashPassword(adminPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'admin'
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'admin'
    }
  });
  console.log(`[SEED] Admin account established: ${adminUser.email} (role: ${adminUser.role})`);

  // 5. Seed Institutional API Key for RBI Demo
  const rbiRawKey = 'apix_live_rbi_demo_institution_key_2026';
  const rbiKeyHash = hashApiKey(rbiRawKey);
  const rbiKeyMask = 'apix_live_...2026';

  await prisma.apiKey.upsert({
    where: { keyHash: rbiKeyHash },
    update: {
      orgId: 'org_rbi_mpd',
      scope: 'read:index,read:observations,read:routes',
      rateTier: 'institutional'
    },
    create: {
      orgId: 'org_rbi_mpd',
      keyHash: rbiKeyHash,
      keyMask: rbiKeyMask,
      scope: 'read:index,read:observations,read:routes',
      rateTier: 'institutional'
    }
  });
  console.log(`[SEED] Demo Institutional API Key provisioned: ${rbiKeyMask}`);

  // 6. Record System Audit Log
  await prisma.auditLog.create({
    data: {
      actor: 'SYSTEM_SEED',
      action: 'INITIAL_PROVISION',
      target: `Routes: ${routesData.length}, Carriers: ${carriersData.length}, Admin: ${adminEmail}`
    }
  });

  console.log('✅ Seed process completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((err) => {
      console.error('[SEED ERROR]', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

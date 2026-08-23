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

export async function seedAdmin() {
  console.log('[SEED ADMIN] Initializing system organizations & admin account...');

  // 1. Seed Core Organizations
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
  console.log(`[SEED ADMIN] Seeded ${orgs.length} institutional organizations.`);

  // 2. Seed Admin User
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

  console.log(`[SEED ADMIN] Admin account established: ${adminUser.email} (ID: ${adminUser.id})`);

  // 3. Seed Default Institutional API Key for RBI Demo
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

  console.log(`[SEED ADMIN] Demo Institutional API Key initialized: ${rbiKeyMask}`);

  // 4. Create Audit Log
  await prisma.auditLog.create({
    data: {
      actor: 'SYSTEM_SEED',
      action: 'INITIAL_SEED',
      target: `Admin: ${adminEmail}, Orgs: ${orgs.length}`
    }
  });

  console.log('[SEED ADMIN] Seed completed successfully!');
}

if (require.main === module) {
  seedAdmin()
    .catch((err) => {
      console.error('[SEED ADMIN ERROR]', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

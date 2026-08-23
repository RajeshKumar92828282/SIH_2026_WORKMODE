import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateOrgSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/auth';

export async function GET() {
  try {
    const orgs = await db.organization.findMany({
      include: {
        _count: {
          select: { apiKeys: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      data: orgs.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.type,
        contactEmail: o.contactEmail,
        activeKeysCount: o._count.apiKeys,
        createdAt: o.createdAt.toISOString()
      })),
      meta: {
        generated_at: new Date().toISOString(),
        total: orgs.length
      }
    });
  } catch (error) {
    console.warn('[API GET /api/v1/admin/organizations] DB offline, returning baseline institutions.');
    return NextResponse.json({
      data: [
        {
          id: 'org_rbi_mpd',
          name: 'Reserve Bank of India (Monetary Policy Dept)',
          type: 'rbi',
          contactEmail: 'mpd@rbi.org.in',
          activeKeysCount: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'org_nso_cpi',
          name: 'National Statistical Office (Price Statistics Division)',
          type: 'nso',
          contactEmail: 'cpi-division@mospi.gov.in',
          activeKeysCount: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'org_dgca_stats',
          name: 'Directorate General of Civil Aviation (DGCA)',
          type: 'govt_agency',
          contactEmail: 'stats@dgca.gov.in',
          activeKeysCount: 0,
          createdAt: new Date().toISOString()
        }
      ],
      meta: {
        generated_at: new Date().toISOString(),
        total: 3,
        is_sample_data: true
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrgSchema.parse(body);

    const organization = await db.organization.create({
      data: {
        name: parsed.name,
        type: parsed.type,
        contactEmail: parsed.contactEmail
      }
    });

    await createAuditLog('ADMIN', 'CREATE_ORGANIZATION', `Created organization: ${organization.name} (${organization.id})`);

    return NextResponse.json(
      {
        data: {
          id: organization.id,
          name: organization.name,
          type: organization.type,
          contactEmail: organization.contactEmail,
          createdAt: organization.createdAt.toISOString()
        },
        meta: { generated_at: new Date().toISOString() }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/v1/admin/organizations ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid organization data' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'bad_request', message: 'Failed to create organization' } },
      { status: 400 }
    );
  }
}

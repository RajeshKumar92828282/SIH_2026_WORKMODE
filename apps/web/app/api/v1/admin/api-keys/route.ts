import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateApiKey, createAuditLog } from '@/lib/auth';
import { CreateApiKeySchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const keys = await db.apiKey.findMany({
      include: {
        organization: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      data: keys.map((k) => ({
        id: k.id,
        orgId: k.orgId,
        orgName: k.organization?.name || 'Unknown Organization',
        orgType: k.organization?.type || 'other',
        keyMask: k.keyMask,
        scope: k.scope,
        rateTier: k.rateTier,
        createdAt: k.createdAt.toISOString(),
        revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
        isActive: !k.revokedAt
      })),
      meta: {
        generated_at: new Date().toISOString(),
        total: keys.length
      }
    });
  } catch (error) {
    console.error('[API GET /api/v1/admin/api-keys ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to list API keys' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const parsed = CreateApiKeySchema.parse(body);

    // Verify organization exists
    const org = await db.organization.findUnique({
      where: { id: parsed.orgId }
    });

    if (!org) {
      return NextResponse.json(
        { error: { code: 'not_found', message: `Organization with ID '${parsed.orgId}' not found.` } },
        { status: 404 }
      );
    }

    const { apiKey, keyHash, keyMask } = generateApiKey(parsed.orgId);

    const record = await db.apiKey.create({
      data: {
        orgId: parsed.orgId,
        keyHash,
        keyMask,
        scope: parsed.scope,
        rateTier: parsed.rateTier
      }
    });

    await createAuditLog('ADMIN', 'ISSUE_API_KEY', `Issued ${parsed.rateTier} API key for ${org.name} (${keyMask})`);

    return NextResponse.json(
      {
        data: {
          id: record.id,
          apiKey, // Returned ONLY ONCE upon generation
          keyMask: record.keyMask,
          orgId: record.orgId,
          orgName: org.name,
          scope: record.scope,
          rateTier: record.rateTier,
          createdAt: record.createdAt.toISOString()
        },
        meta: { generated_at: new Date().toISOString() }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/v1/admin/api-keys ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid API key request parameters' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: 'bad_request', message: 'Failed to issue API key' } },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || action !== 'revoke') {
      return NextResponse.json(
        { error: { code: 'bad_request', message: 'Valid key ID and action: "revoke" required.' } },
        { status: 400 }
      );
    }

    const existing = await db.apiKey.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: { code: 'not_found', message: `API Key with ID '${id}' not found.` } },
        { status: 404 }
      );
    }

    const updated = await db.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() }
    });

    await createAuditLog('ADMIN', 'REVOKE_API_KEY', `Revoked API key ID: ${id} (${updated.keyMask})`);

    return NextResponse.json({
      data: {
        id: updated.id,
        keyMask: updated.keyMask,
        revokedAt: updated.revokedAt?.toISOString(),
        isActive: false
      },
      meta: { generated_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('[API PATCH /api/v1/admin/api-keys ERROR]', error);
    return NextResponse.json(
      { error: { code: 'internal_server_error', message: 'Failed to revoke API key' } },
      { status: 500 }
    );
  }
}

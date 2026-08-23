import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateApiKey } from '@/lib/auth';
import { CreateApiKeySchema } from '@/lib/validation';

export async function GET() {
  try {
    const keys = await db.apiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      data: keys.map((k) => ({
        id: k.id,
        orgId: k.orgId,
        keyMask: k.keyMask,
        scope: k.scope,
        rateTier: k.rateTier,
        createdAt: k.createdAt.toISOString(),
        revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null
      })),
      meta: { generated_at: new Date().toISOString() }
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
  try {
    const body = await req.json();
    const parsed = CreateApiKeySchema.parse(body);

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

    return NextResponse.json(
      {
        data: {
          id: record.id,
          apiKey, // Returned ONLY ONCE upon creation
          keyMask: record.keyMask,
          orgId: record.orgId,
          scope: record.scope,
          rateTier: record.rateTier,
          createdAt: record.createdAt.toISOString()
        },
        meta: { generated_at: new Date().toISOString() }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API POST /api/v1/admin/api-keys ERROR]', error);
    return NextResponse.json(
      { error: { code: 'bad_request', message: 'Invalid API key request parameters' } },
      { status: 400 }
    );
  }
}

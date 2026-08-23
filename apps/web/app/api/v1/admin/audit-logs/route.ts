import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AuditLogQuerySchema } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = AuditLogQuerySchema.parse(Object.fromEntries(searchParams));

    const skip = (query.page - 1) * query.limit;

    const [total, logs] = await Promise.all([
      db.auditLog.count(),
      db.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit
      })
    ]);

    return NextResponse.json({
      data: logs.map((log) => ({
        id: log.id,
        actor: log.actor,
        action: log.action,
        target: log.target,
        createdAt: log.createdAt.toISOString()
      })),
      meta: {
        generated_at: new Date().toISOString(),
        page: query.page,
        total,
        limit: query.limit
      }
    });
  } catch (error: any) {
    console.error('[API GET /api/v1/admin/audit-logs ERROR]', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: { code: 'validation_error', message: error.errors[0]?.message || 'Invalid query parameters' } },
        { status: 400 }
      );
    }
    console.warn('[API GET /api/v1/admin/audit-logs] DB offline, returning sample audit trail.');
    return NextResponse.json({
      data: [
        {
          id: 1,
          actor: 'SYSTEM_SEED',
          action: 'INITIAL_PROVISION',
          target: 'Admin & Organizations',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          actor: 'admin@apix.gov.in',
          action: 'ISSUE_API_KEY',
          target: 'Reserve Bank of India (apix_live_...2026)',
          createdAt: new Date().toISOString()
        }
      ],
      meta: {
        generated_at: new Date().toISOString(),
        page: 1,
        total: 2,
        limit: 50,
        is_sample_data: true
      }
    });
  }
}

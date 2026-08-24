import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './lib/rate-limit';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/v1')) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'standard');

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: { code: 'rate_limit_exceeded', message: `Too many requests. Limit: ${rateCheck.limit} req/min.` } },
        { status: 429 }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateCheck.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*'
};

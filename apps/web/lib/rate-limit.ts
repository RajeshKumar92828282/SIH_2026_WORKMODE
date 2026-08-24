const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export type RateTier = 'standard' | 'institutional' | 'unlimited';

export const TIER_LIMITS: Record<RateTier, { limit: number; windowMs: number }> = {
  standard: { limit: 60, windowMs: 60000 },       // 60 req/min
  institutional: { limit: 600, windowMs: 60000 },  // 600 req/min
  unlimited: { limit: 10000, windowMs: 60000 }     // 10k req/min
};

export function checkRateLimit(ipOrKey: string, tier: RateTier = 'standard'): { allowed: boolean; remaining: number; limit: number } {
  const { limit, windowMs } = TIER_LIMITS[tier];
  const now = Date.now();
  const record = rateLimitStore.get(ipOrKey);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ipOrKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, limit };
}
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ipOrKey: string, limit = 60, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ipOrKey);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ipOrKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

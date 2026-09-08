type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): boolean {
  const now = input.now ?? Date.now();
  const current = buckets.get(input.key);

  if (!current || now >= current.resetAt) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return true;
  }

  if (current.count >= input.limit) {
    return false;
  }

  current.count += 1;
  return true;
}

export function resetRateLimitsForTests() {
  buckets.clear();
}

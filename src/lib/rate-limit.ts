const store = new Map<string, { count: number; resetAt: number }>();

function key(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}

export function checkRateLimit(
  prefix: string,
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const k = key(prefix, identifier);
  const entry = store.get(k);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(k, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  return { allowed: entry.count <= maxRequests, remaining, resetAt: entry.resetAt };
}

const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now >= v.resetAt) store.delete(k);
  }
}, CLEANUP_INTERVAL);

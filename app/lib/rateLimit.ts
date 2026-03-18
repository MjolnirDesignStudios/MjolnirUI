// app/lib/rateLimit.ts
// In-memory rate limiter for API routes.
// Uses a sliding window approach with automatic cleanup of expired entries.

interface RateLimitOptions {
  interval: number;            // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max unique tokens tracked per interval
}

interface TokenRecord {
  count: number;
  expiresAt: number;
}

export function rateLimit({ interval, uniqueTokenPerInterval }: RateLimitOptions) {
  const tokenMap = new Map<string, TokenRecord>();

  // Periodically clean expired entries to prevent memory leaks
  const cleanup = () => {
    const now = Date.now();
    for (const [key, record] of tokenMap) {
      if (now >= record.expiresAt) {
        tokenMap.delete(key);
      }
    }
  };

  const cleanupInterval = setInterval(cleanup, interval);
  // Allow the process to exit without waiting for the cleanup timer
  if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }

  return {
    /**
     * Check if a request is within the rate limit.
     * @param limit - Maximum number of requests allowed within the interval
     * @param token - Unique identifier for the requester (e.g. IP address)
     * @throws Error with status 429 if rate limit exceeded
     */
    async check(limit: number, token: string): Promise<void> {
      const now = Date.now();

      // Clean expired entries if map is getting large
      if (tokenMap.size > uniqueTokenPerInterval) {
        cleanup();
      }

      const existing = tokenMap.get(token);

      if (existing) {
        // If the window has expired, reset the counter
        if (now >= existing.expiresAt) {
          tokenMap.set(token, { count: 1, expiresAt: now + interval });
          return;
        }

        // Within the window — check if limit is exceeded
        if (existing.count >= limit) {
          const error = new Error('Rate limit exceeded');
          (error as any).status = 429;
          throw error;
        }

        // Increment the counter
        existing.count += 1;
      } else {
        // First request from this token
        tokenMap.set(token, { count: 1, expiresAt: now + interval });
      }
    },
  };
}

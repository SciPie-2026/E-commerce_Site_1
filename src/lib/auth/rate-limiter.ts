interface RateLimitEntry {
  timestamps: number[];
}

class SlidingWindowRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Periodic sweep every 5 minutes
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  public check(key: string): { allowed: boolean; remaining: number; resetInSeconds: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    // Filter out timestamps outside window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const resetInSeconds = Math.max(1, Math.ceil((oldestInWindow + this.windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
      };
    }

    entry.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxRequests - entry.timestamps.length,
      resetInSeconds: Math.ceil(this.windowMs / 1000),
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, entry] of this.store.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
      if (entry.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// 5 attempts per 15 minutes for authentication routes
export const authRateLimiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);

// 100 requests per minute for standard API endpoints
export const apiRateLimiter = new SlidingWindowRateLimiter(100, 60 * 1000);

/**
 * Extracts client IP from request headers or falls back to '127.0.0.1'.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

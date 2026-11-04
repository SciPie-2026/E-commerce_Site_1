interface RateLimitEntry {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
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

  public reset(key: string): void {
    this.store.delete(key);
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

// 5 attempts per 15 minutes for customer/admin login & registration
export const authRateLimiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);

// 3 attempts per 15 minutes for password resets
export const resetRateLimiter = new SlidingWindowRateLimiter(3, 15 * 60 * 1000);

// 15 coupon code attempts per 5 minutes to prevent promo code enumeration
export const couponRateLimiter = new SlidingWindowRateLimiter(15, 5 * 60 * 1000);

// 10 order placements per 10 minutes to prevent checkout spam / stock hoarding
export const checkoutRateLimiter = new SlidingWindowRateLimiter(10, 10 * 60 * 1000);

// 10 payment verification attempts per 5 minutes to prevent replay / brute force
export const paymentVerifyRateLimiter = new SlidingWindowRateLimiter(10, 5 * 60 * 1000);

// 60 requests per minute for privileged admin dashboard actions
export const adminRateLimiter = new SlidingWindowRateLimiter(60, 60 * 1000);

// 100 requests per minute for standard API endpoints
export const apiRateLimiter = new SlidingWindowRateLimiter(100, 60 * 1000);

/**
 * Extracts client IP from request headers or falls back to '127.0.0.1'.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  );
}

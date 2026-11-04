import crypto from "node:crypto";

/**
 * Generates a cryptographically secure random hex token (default 32 bytes = 64 hex chars).
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hashes a token using SHA-256 (for safe storage of reset tokens and refresh token signatures).
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Timing-safe string comparison to prevent side-channel timing attacks.
 */
export function timingSafeMatch(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");

  if (bufA.length !== bufB.length) {
    // Prevent length timing leak by doing a dummy comparison
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

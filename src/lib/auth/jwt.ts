import jwt from "jsonwebtoken";

const DEFAULT_JWT_SECRET =
  "aidah_jwt_secret_production_ready_high_entropy_key_2026_random_secure_hex";
const DEFAULT_REFRESH_TOKEN_SECRET =
  "aidah_refresh_secret_production_ready_high_entropy_key_2026_random_secure_hex";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret === DEFAULT_JWT_SECRET)) {
    throw new Error(
      "SECURITY CRITICAL: JWT_SECRET environment variable is missing or using default development secret in production.",
    );
  }
  return secret || DEFAULT_JWT_SECRET;
}

export function getRefreshTokenSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    (!secret || secret === DEFAULT_REFRESH_TOKEN_SECRET)
  ) {
    throw new Error(
      "SECURITY CRITICAL: REFRESH_TOKEN_SECRET environment variable is missing or using default development secret in production.",
    );
  }
  return secret || DEFAULT_REFRESH_TOKEN_SECRET;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

/**
 * Signs a short-lived access token (15 minutes).
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "15m",
    algorithm: "HS256",
  });
}

/**
 * Verifies an access token with strict algorithm enforcement (HS256).
 * Returns payload or null if invalid/expired/algorithm mismatch.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Signs a long-lived refresh token (7 days).
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, getRefreshTokenSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

/**
 * Verifies a refresh token with strict algorithm enforcement (HS256).
 * Returns payload or null if invalid/expired/algorithm mismatch.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, getRefreshTokenSecret(), {
      algorithms: ["HS256"],
    }) as RefreshTokenPayload;
  } catch {
    return null;
  }
}

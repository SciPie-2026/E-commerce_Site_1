import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "aidah_jwt_secret_production_ready_high_entropy_key_2026_random_secure_hex";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  "aidah_refresh_secret_production_ready_high_entropy_key_2026_random_secure_hex";

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
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
    algorithm: "HS256",
  });
}

/**
 * Verifies an access token. Returns payload or null if invalid/expired.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Signs a long-lived refresh token (7 days).
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });
}

/**
 * Verifies a refresh token. Returns payload or null if invalid/expired.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}

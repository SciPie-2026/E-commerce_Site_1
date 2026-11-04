import * as cookie from "cookie";

export const ACCESS_COOKIE_NAME = "aidah_access_token";
export const REFRESH_COOKIE_NAME = "aidah_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Creates Set-Cookie header string for short-lived access token (15 mins = 900s).
 */
export function createAccessCookie(token: string): string {
  return cookie.serialize(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });
}

/**
 * Creates Set-Cookie header string for long-lived refresh token (7 days = 604800s).
 */
export function createRefreshCookie(token: string): string {
  return cookie.serialize(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Creates expired Set-Cookie strings to clear authentication cookies on logout.
 */
export function clearAuthCookies(): string[] {
  return [
    cookie.serialize(ACCESS_COOKIE_NAME, "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    }),
    cookie.serialize(REFRESH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    }),
  ];
}

/**
 * Parses raw Cookie header string into key-value map.
 */
export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return cookie.parse(cookieHeader);
}

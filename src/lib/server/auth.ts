import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
  getRequestIP,
  getRequestHeader,
} from "@tanstack/react-start/server";
import { prisma } from "../db";
import { hashPassword, verifyPassword, validatePasswordPolicy } from "../auth/password";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../auth/jwt";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../auth/cookies";
import { generateSecureToken, hashToken } from "../auth/crypto";
import { authRateLimiter, resetRateLimiter } from "../auth/rate-limiter";
import {
  RegisterInputSchema,
  LoginInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  ProfileUpdateSchema,
  ChangePasswordSchema,
  AddressInputSchema,
} from "../auth/validators";

const isProduction = process.env.NODE_ENV === "production";

function setAuthCookies(accessToken: string, refreshToken: string) {
  setCookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 mins
  });

  setCookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

function clearAuthCookies() {
  deleteCookie(ACCESS_COOKIE_NAME, { path: "/" });
  deleteCookie(REFRESH_COOKIE_NAME, { path: "/" });
}

/**
 * Register a new customer
 */
export const registerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => RegisterInputSchema.parse(data))
  .handler(async ({ data }) => {
    const ip = getRequestIP() || "127.0.0.1";
    const limiter = authRateLimiter.check(`auth_${ip}`);
    if (!limiter.allowed) {
      throw new Error(`Too many attempts. Please try again in ${limiter.resetInSeconds} seconds.`);
    }

    const email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: "CUSTOMER",
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    // Create session
    const rawRefreshToken = generateSecureToken(32);
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const userAgent = getRequestHeader("user-agent") || null;

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: ip,
        userAgent,
        expiresAt,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    setAuthCookies(accessToken, refreshToken);

    return { user };
  });

/**
 * Customer & Admin Login
 */
export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => LoginInputSchema.parse(data))
  .handler(async ({ data }) => {
    const ip = getRequestIP() || "127.0.0.1";
    const ipLimiter = authRateLimiter.check(`auth_ip_${ip}`);
    if (!ipLimiter.allowed) {
      throw new Error(`Too many login attempts. Please wait ${ipLimiter.resetInSeconds} seconds.`);
    }

    const email = data.email.toLowerCase().trim();
    const acctLimiter = authRateLimiter.check(`auth_acct_${email}`);
    if (!acctLimiter.allowed) {
      throw new Error(
        `Too many login attempts for this account. Please wait ${acctLimiter.resetInSeconds} seconds.`,
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password.");
    }

    // Create session
    const rawRefreshToken = generateSecureToken(32);
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const userAgent = getRequestHeader("user-agent") || null;

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        ipAddress: ip,
        userAgent,
        expiresAt,
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });

    setAuthCookies(accessToken, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  });

/**
 * Logout and invalidate session
 */
export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const refreshToken = getCookie(REFRESH_COOKIE_NAME);
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload?.sessionId) {
      await prisma.session.updateMany({
        where: { id: payload.sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  clearAuthCookies();
  return { success: true };
});

/**
 * Get currently authenticated user with silent token refresh
 */
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(async () => {
  const accessToken = getCookie(ACCESS_COOKIE_NAME);

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      });
      if (user) return { user };
    }
  }

  // If access token is missing or expired, attempt refresh
  const refreshToken = getCookie(REFRESH_COOKIE_NAME);
  if (!refreshToken) {
    return { user: null };
  }

  const refreshPayload = verifyRefreshToken(refreshToken);
  if (!refreshPayload) {
    clearAuthCookies();
    return { user: null };
  }

  const session = await prisma.session.findUnique({
    where: { id: refreshPayload.sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
    clearAuthCookies();
    return { user: null };
  }

  // Rotate access token
  const newAccessToken = signAccessToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    name: session.user.name,
  });

  setCookie(ACCESS_COOKIE_NAME, newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  return { user: session.user };
});

/**
 * Request password reset token
 */
export const forgotPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ForgotPasswordInputSchema.parse(data))
  .handler(async ({ data }) => {
    const ip = getRequestIP() || "127.0.0.1";
    const limiter = resetRateLimiter.check(`forgot_ip_${ip}`);
    if (!limiter.allowed) {
      throw new Error(`Too many requests. Please wait ${limiter.resetInSeconds} seconds.`);
    }

    const email = data.email.toLowerCase().trim();
    const acctLimiter = resetRateLimiter.check(`forgot_acct_${email}`);
    if (!acctLimiter.allowed) {
      throw new Error(`Too many requests for this account. Please wait ${acctLimiter.resetInSeconds} seconds.`);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = generateSecureToken(32);
      const hashedToken = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpires: expiresAt,
        },
      });

      // Never return devResetToken unless explicitly enabled in local development mode
      const allowDevToken =
        process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_RESET_TOKEN === "true";

      return {
        success: true,
        message: "If an account exists with this email, a reset link has been dispatched.",
        devResetToken: allowDevToken ? rawToken : undefined,
      };
    }

    return {
      success: true,
      message: "If an account exists with this email, a reset link has been dispatched.",
    };
  });

/**
 * Reset password using cryptographically verified token
 */
export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ResetPasswordInputSchema.parse(data))
  .handler(async ({ data }) => {
    const ip = getRequestIP() || "127.0.0.1";
    const limiter = resetRateLimiter.check(`reset_${ip}`);
    if (!limiter.allowed) {
      throw new Error(`Too many attempts. Please wait ${limiter.resetInSeconds} seconds.`);
    }

    const hashedToken = hashToken(data.token);
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error("Reset link is invalid or has expired. Please request a new one.");
    }

    const policy = validatePasswordPolicy(data.password);
    if (!policy.valid) {
      throw new Error(policy.errors[0]);
    }

    const passwordHash = await hashPassword(data.password);

    // Update password, clear token, and revoke all active sessions for immediate security
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetToken: null,
          resetTokenExpires: null,
        },
      }),
      prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    clearAuthCookies();
    return { success: true, message: "Password updated successfully. Please sign in." };
  });

/**
 * Update Customer Profile
 */
export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ProfileUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await getCurrentUserFn();
    if (!auth.user) throw new Error("Unauthorized. Please log in.");

    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    return { user: updated };
  });

/**
 * Change Customer Password
 */
export const changePasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ChangePasswordSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await getCurrentUserFn();
    if (!auth.user) throw new Error("Unauthorized. Please log in.");

    const user = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (!user) throw new Error("User not found.");

    const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValid) throw new Error("Current password does not match.");

    const policy = validatePasswordPolicy(data.newPassword);
    if (!policy.valid) throw new Error(policy.errors[0]);

    const newHash = await hashPassword(data.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),
      // Revoke all other sessions
      prisma.session.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { success: true, message: "Password updated successfully." };
  });

/**
 * Address Management
 */
export const getUserAddressesFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await getCurrentUserFn();
  if (!auth.user) throw new Error("Unauthorized");

  const addresses = await prisma.address.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return { addresses };
});

export const saveAddressFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => AddressInputSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await getCurrentUserFn();
    if (!auth.user) throw new Error("Unauthorized");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.user.id,
        type: data.type,
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault,
      },
    });

    return { address };
  });

export const deleteAddressFn = createServerFn({ method: "POST" })
  .validator((id: unknown) => {
    if (typeof id !== "string") throw new Error("Invalid address ID");
    return id;
  })
  .handler(async ({ data: id }) => {
    const auth = await getCurrentUserFn();
    if (!auth.user) throw new Error("Unauthorized");

    await prisma.address.deleteMany({
      where: { id, userId: auth.user.id },
    });

    return { success: true };
  });

/**
 * Get Customer Orders
 */
export const getUserOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await getCurrentUserFn();
  if (!auth.user) throw new Error("Unauthorized");

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: auth.user.id }, { customerEmail: auth.user.email }],
    },
    include: {
      orderItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { orders };
});

import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";

const isProduction = process.env.NODE_ENV === "production";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

/**
 * Enterprise Content Security Policy definition
 */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://checkout.razorpay.com",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

/**
 * Enterprise Security Headers Middleware
 * Protects against clickjacking, MIME sniffing, XSS, and enforces HTTPS & trusted origins.
 */
export const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  if (result instanceof Response) {
    result.headers.set("Content-Security-Policy", cspDirectives);
    result.headers.set("X-Frame-Options", "DENY");
    result.headers.set("X-Content-Type-Options", "nosniff");
    result.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    result.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    result.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    result.headers.set("X-Permitted-Cross-Domain-Policies", "none");
    result.headers.set("X-XSS-Protection", "0");
    result.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(self 'https://checkout.razorpay.com')",
    );

    if (isProduction) {
      result.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
      );
    }
  }
  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware, securityHeadersMiddleware],
}));

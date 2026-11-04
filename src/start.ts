import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";

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
 * Enterprise Security Headers Middleware
 * Protects against clickjacking, MIME sniffing, and enforces HTTPS & trusted origins.
 */
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  if (result instanceof Response) {
    result.headers.set("X-Frame-Options", "DENY");
    result.headers.set("X-Content-Type-Options", "nosniff");
    result.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    result.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(self 'https://checkout.razorpay.com')",
    );

    if (process.env.NODE_ENV === "production") {
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

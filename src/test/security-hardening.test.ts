import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { sanitizeRedirectUrl } from "@/lib/utils";
import {
  signAccessToken,
  verifyAccessToken,
  getJwtSecret,
  getRefreshTokenSecret,
} from "@/lib/auth/jwt";
import { getPaymentGateway } from "@/lib/payment";
import {
  couponRateLimiter,
  checkoutRateLimiter,
  paymentVerifyRateLimiter,
  authRateLimiter,
} from "@/lib/auth/rate-limiter";
import {
  LoginInputSchema,
  RegisterInputSchema,
  CreateOrderInputSchema,
  OrderItemInputSchema,
  ProductAdminSchema,
  CouponAdminSchema,
} from "@/lib/auth/validators";
import jwt from "jsonwebtoken";

describe("Open Redirect & DOM XSS Sanitization (OWASP A01 & A03)", () => {
  it("sanitizes javascript: protocol injection", () => {
    expect(sanitizeRedirectUrl("javascript:alert(document.cookie)")).toBe("/account");
    expect(sanitizeRedirectUrl("JAVASCRIPT:alert(1)")).toBe("/account");
  });

  it("sanitizes data: and vbscript: URIs", () => {
    expect(sanitizeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe("/account");
    expect(sanitizeRedirectUrl("vbscript:msgbox(1)")).toBe("/account");
  });

  it("sanitizes absolute external URLs (Open Redirect)", () => {
    expect(sanitizeRedirectUrl("https://attacker-phishing.com")).toBe("/account");
    expect(sanitizeRedirectUrl("http://attacker.com/steal")).toBe("/account");
  });

  it("sanitizes protocol-relative external URLs", () => {
    expect(sanitizeRedirectUrl("//attacker.com")).toBe("/account");
    expect(sanitizeRedirectUrl("/\\attacker.com")).toBe("/account");
    expect(sanitizeRedirectUrl("\\attacker.com")).toBe("/account");
  });

  it("sanitizes null bytes and control characters", () => {
    expect(sanitizeRedirectUrl("/account\0evil")).toBe("/account");
  });

  it("allows safe internal application relative paths", () => {
    expect(sanitizeRedirectUrl("/shop")).toBe("/shop");
    expect(sanitizeRedirectUrl("/cart")).toBe("/cart");
    expect(sanitizeRedirectUrl("/product/seraphina-ice-blue-gown")).toBe(
      "/product/seraphina-ice-blue-gown",
    );
    expect(sanitizeRedirectUrl("/collections/ethnic-wear")).toBe("/collections/ethnic-wear");
  });

  it("uses custom default path when provided", () => {
    expect(sanitizeRedirectUrl("https://evil.com", "/shop")).toBe("/shop");
    expect(sanitizeRedirectUrl("", "/admin")).toBe("/admin");
    expect(sanitizeRedirectUrl(null, "/")).toBe("/");
  });
});

describe("JWT Algorithm Confusion & Production Secret Guard (OWASP A02 & A07)", () => {
  it("rejects tokens forged with algorithm: 'none'", () => {
    const payload = {
      userId: "victim_user_1",
      email: "victim@aidah.com",
      role: "ADMIN",
      name: "Target Admin",
    };
    // Forge unsigned token with algorithm 'none'
    const noneToken = jwt.sign(payload, "", { algorithm: "none" });
    const verified = verifyAccessToken(noneToken);
    expect(verified).toBeNull();
  });

  it("rejects tokens signed with mismatched algorithm (e.g. HS512 when expecting HS256)", () => {
    const payload = {
      userId: "user_123",
      email: "test@aidah.com",
      role: "CUSTOMER",
      name: "Test",
    };
    const hs512Token = jwt.sign(payload, getJwtSecret(), { algorithm: "HS512" });
    const verified = verifyAccessToken(hs512Token);
    expect(verified).toBeNull();
  });

  it("throws fatal error in production if JWT_SECRET is missing or default", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = "production";
      delete process.env.JWT_SECRET;

      expect(() => getJwtSecret()).toThrow(/SECURITY CRITICAL/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it("throws fatal error in production if REFRESH_TOKEN_SECRET is missing or default", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.REFRESH_TOKEN_SECRET;
    try {
      process.env.NODE_ENV = "production";
      delete process.env.REFRESH_TOKEN_SECRET;

      expect(() => getRefreshTokenSecret()).toThrow(/SECURITY CRITICAL/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.REFRESH_TOKEN_SECRET = originalSecret;
    }
  });
});

describe("Production Mock Payment Lockout (OWASP A05 & Business Logic)", () => {
  it("prohibits MockPaymentGateway in production environment without explicit flag", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalProvider = process.env.PAYMENT_GATEWAY_PROVIDER;
    const originalAllow = process.env.ALLOW_MOCK_PAYMENTS;
    try {
      process.env.NODE_ENV = "production";
      process.env.PAYMENT_GATEWAY_PROVIDER = "MOCK";
      delete process.env.ALLOW_MOCK_PAYMENTS;

      expect(() => getPaymentGateway()).toThrow(/SECURITY CRITICAL.*MockPaymentGateway/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.PAYMENT_GATEWAY_PROVIDER = originalProvider;
      process.env.ALLOW_MOCK_PAYMENTS = originalAllow;
    }
  });
});

describe("Rate Limiting Protection (OWASP A04 - Resource Consumption)", () => {
  it("enforces coupon rate limiter against brute-force enumeration", () => {
    const testKey = `test_coupon_ip_${Date.now()}`;
    for (let i = 0; i < 15; i++) {
      const res = couponRateLimiter.check(testKey);
      expect(res.allowed).toBe(true);
    }
    const blockedRes = couponRateLimiter.check(testKey);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.resetInSeconds).toBeGreaterThan(0);
  });

  it("enforces checkout rate limiter against order spam", () => {
    const testKey = `test_checkout_ip_${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const res = checkoutRateLimiter.check(testKey);
      expect(res.allowed).toBe(true);
    }
    const blockedRes = checkoutRateLimiter.check(testKey);
    expect(blockedRes.allowed).toBe(false);
  });

  it("enforces payment verification rate limiter", () => {
    const testKey = `test_verify_ip_${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const res = paymentVerifyRateLimiter.check(testKey);
      expect(res.allowed).toBe(true);
    }
    const blockedRes = paymentVerifyRateLimiter.check(testKey);
    expect(blockedRes.allowed).toBe(false);
  });
});

describe("Schema Hardening & Input Constraints (OWASP A04 & DoS Mitigation)", () => {
  it("rejects oversized password in LoginInputSchema to prevent bcrypt CPU exhaustion", () => {
    const oversizedPassword = "A".repeat(100);
    const validResult = LoginInputSchema.safeParse({
      email: "test@aidah.com",
      password: oversizedPassword,
    });
    expect(validResult.success).toBe(false);
  });

  it("rejects oversized order items array in CreateOrderInputSchema", () => {
    const items = Array(51).fill({
      productSlug: "seraphina-ice-blue-gown",
      productTitle: "Seraphina Ice Blue Saree Gown",
      unitPrice: 2850000,
      quantity: 1,
    });

    const res = CreateOrderInputSchema.safeParse({
      items,
      customerEmail: "patron@aidah.com",
      customerPhone: "+91 98765 43210",
      shippingAddress: {
        type: "SHIPPING",
        name: "Aanya",
        street: "DLF Phase 5",
        city: "Gurugram",
        state: "Haryana",
        postalCode: "122002",
        country: "India",
        phone: "+91 98765 43210",
        isDefault: false,
      },
    });
    expect(res.success).toBe(false);
  });

  it("rejects excessive item quantities in OrderItemInputSchema", () => {
    const item = {
      productSlug: "seraphina-ice-blue-gown",
      productTitle: "Seraphina Ice Blue Saree Gown",
      unitPrice: 2850000,
      quantity: 101, // Max is 100
    };
    expect(OrderItemInputSchema.safeParse(item).success).toBe(false);
  });

  it("rejects malicious or javascript image URLs in ProductAdminSchema", () => {
    const product = {
      title: "Test Gown",
      slug: "test-gown",
      description: "Handcrafted gown for evening wear occasions.",
      price: 2500000,
      category: "evening-wear",
      sku: "TEST-01",
      images: ["javascript:alert(1)"],
    };
    expect(ProductAdminSchema.safeParse(product).success).toBe(false);
  });

  it("rejects invalid coupon codes in CouponAdminSchema", () => {
    const invalidCoupon = {
      code: "DISCOUNT<script>",
      discountType: "PERCENTAGE",
      value: 10,
    };
    expect(CouponAdminSchema.safeParse(invalidCoupon).success).toBe(false);
  });
});

import { createOrderFn, verifyPaymentFn, validatePromoCodeFn } from "@/lib/server/checkout";
import { processRazorpayWebhook } from "@/lib/server/webhook";
import { prisma } from "@/lib/db";

describe("Business Logic & Order Tampering Protections (OWASP A04)", () => {
  it("enforces server-authoritative pricing and rejects client price tampering", async () => {
    // Client attempts to buy ₹28,500 (2850000 paise) gown for 1 paisa (₹0.01)
    const tamperedOrder = await createOrderFn({
      data: {
        customerEmail: "attacker@test.com",
        customerPhone: "+91 99999 88888",
        shippingAddress: {
          type: "SHIPPING",
          name: "Test Attacker",
          street: "123 Exploit Lane",
          city: "New Delhi",
          state: "Delhi",
          postalCode: "110001",
          country: "India",
          phone: "+91 99999 88888",
          isDefault: false,
        },
        items: [
          {
            productSlug: "seraphina-ice-blue-gown",
            productTitle: "Seraphina Ice Blue Saree Gown",
            unitPrice: 1, // Tampered: 1 paisa instead of 2850000 paise
            quantity: 1,
          },
        ],
      },
    });

    // Verify order was created with authoritative price (₹28,500 = 2850000 paise), NOT 1 paisa!
    expect(tamperedOrder.totalAmountPaise).toBe(2850000);
    expect(tamperedOrder.gatewayOrder.amount).toBe(2850000);

    const savedOrder = await prisma.order.findUnique({
      where: { id: tamperedOrder.orderId },
      include: { orderItems: true },
    });
    expect(savedOrder?.subtotal).toBe(2850000);
    expect(savedOrder?.orderItems[0].unitPrice).toBe(2850000);

    // Clean up test order
    await prisma.orderItem.deleteMany({ where: { orderId: tamperedOrder.orderId } });
    await prisma.order.delete({ where: { id: tamperedOrder.orderId } });
  });

  it("prevents replay attacks on verifyPaymentFn (idempotency)", async () => {
    // 1. Create order
    const orderRes = await createOrderFn({
      data: {
        customerEmail: "patron@aidah.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: {
          type: "SHIPPING",
          name: "Aanya",
          street: "DLF Phase 5",
          city: "Gurugram",
          state: "Haryana",
          postalCode: "122002",
          country: "India",
          phone: "+91 98765 43210",
          isDefault: false,
        },
        items: [
          {
            productSlug: "seraphina-ice-blue-gown",
            productTitle: "Seraphina Ice Blue Saree Gown",
            unitPrice: 2850000,
            quantity: 1,
          },
        ],
      },
    });

    const mockPaymentId = `pay_mock_${Date.now()}`;
    const mockSig = `sig_mock_${Date.now()}`;

    // 2. First verification (should succeed)
    const firstVerify = await verifyPaymentFn({
      data: {
        orderNumber: orderRes.orderNumber,
        razorpayOrderId: orderRes.gatewayOrder.gatewayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSig,
      },
    });
    expect(firstVerify.success).toBe(true);
    expect(firstVerify.status).toBe("CONFIRMED");

    // Check inventory after first verify
    const productAfterFirst = await prisma.product.findUnique({
      where: { slug: "seraphina-ice-blue-gown" },
    });
    const invAfterFirst = productAfterFirst?.inventory;

    // 3. Replay attack: calling verifyPaymentFn a second time with same payment details
    const replayVerify = await verifyPaymentFn({
      data: {
        orderNumber: orderRes.orderNumber,
        razorpayOrderId: orderRes.gatewayOrder.gatewayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSig,
      },
    });
    expect(replayVerify.success).toBe(true);

    // Ensure inventory was NOT decremented again during replay
    const productAfterReplay = await prisma.product.findUnique({
      where: { slug: "seraphina-ice-blue-gown" },
    });
    expect(productAfterReplay?.inventory).toBe(invAfterFirst);

    // Clean up test order
    await prisma.orderItem.deleteMany({ where: { orderId: orderRes.orderId } });
    await prisma.order.delete({ where: { id: orderRes.orderId } });
    if (invAfterFirst !== undefined) {
      await prisma.product.update({
        where: { slug: "seraphina-ice-blue-gown" },
        data: { inventory: invAfterFirst + 1 }, // restore test inventory
      });
    }
  });

  it("rejects mismatched gateway order IDs in verifyPaymentFn", async () => {
    const orderRes = await createOrderFn({
      data: {
        customerEmail: "patron@aidah.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: {
          type: "SHIPPING",
          name: "Aanya",
          street: "DLF Phase 5",
          city: "Gurugram",
          state: "Haryana",
          postalCode: "122002",
          country: "India",
          phone: "+91 98765 43210",
          isDefault: false,
        },
        items: [
          {
            productSlug: "seraphina-ice-blue-gown",
            productTitle: "Seraphina Ice Blue Saree Gown",
            unitPrice: 2850000,
            quantity: 1,
          },
        ],
      },
    });

    // Attempting to submit a foreign gateway order ID
    await expect(
      verifyPaymentFn({
        data: {
          orderNumber: orderRes.orderNumber,
          razorpayOrderId: "order_mock_foreign_mismatched_id",
          razorpayPaymentId: "pay_mock_123",
          razorpaySignature: "sig_mock_123",
        },
      }),
    ).rejects.toThrow(/mismatch/i);

    // Clean up
    await prisma.orderItem.deleteMany({ where: { orderId: orderRes.orderId } });
    await prisma.order.delete({ where: { id: orderRes.orderId } });
  });

  it("webhook does not inflate inventory for failed unpaid orders", async () => {
    // Get product inventory before
    const productBefore = await prisma.product.findUnique({
      where: { slug: "seraphina-ice-blue-gown" },
    });
    const invBefore = productBefore?.inventory ?? 8;

    const orderRes = await createOrderFn({
      data: {
        customerEmail: "patron@aidah.com",
        customerPhone: "+91 98765 43210",
        shippingAddress: {
          type: "SHIPPING",
          name: "Aanya",
          street: "DLF Phase 5",
          city: "Gurugram",
          state: "Haryana",
          postalCode: "122002",
          country: "India",
          phone: "+91 98765 43210",
          isDefault: false,
        },
        items: [
          {
            productSlug: "seraphina-ice-blue-gown",
            productTitle: "Seraphina Ice Blue Saree Gown",
            unitPrice: 2850000,
            quantity: 1,
          },
        ],
      },
    });

    // Simulate payment.failed webhook
    const failedPayload = JSON.stringify({
      entity: "event",
      account_id: "acc_test",
      event: "payment.failed",
      contains: ["payment"],
      payload: {
        payment: {
          entity: {
            id: "pay_failed_123",
            order_id: orderRes.gatewayOrder.gatewayOrderId,
            status: "failed",
            amount: 2850000,
            currency: "INR",
          },
        },
      },
    });

    await processRazorpayWebhook(failedPayload, "valid_mock_signature");

    // Inventory must NOT have increased!
    const productAfter = await prisma.product.findUnique({
      where: { slug: "seraphina-ice-blue-gown" },
    });
    expect(productAfter?.inventory).toBe(invBefore);

    // Clean up
    await prisma.orderItem.deleteMany({ where: { orderId: orderRes.orderId } });
    await prisma.order.delete({ where: { id: orderRes.orderId } });
  });
});

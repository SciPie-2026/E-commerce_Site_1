import { describe, expect, it } from "vitest";
import { validatePasswordPolicy, hashPassword, verifyPassword } from "@/lib/auth/password";
import { timingSafeMatch, hashToken } from "@/lib/auth/crypto";
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import { authRateLimiter } from "@/lib/auth/rate-limiter";
import { MockPaymentGateway } from "@/lib/payment/mock-payment.service";
import { RazorpayGateway } from "@/lib/payment/razorpay.service";
import crypto from "node:crypto";

describe("Security Hardening & Password Policy", () => {
  it("rejects passwords failing complexity policy", () => {
    expect(validatePasswordPolicy("weak").valid).toBe(false);
    expect(validatePasswordPolicy("nouppercase1!").valid).toBe(false);
    expect(validatePasswordPolicy("NOLOWERCASE1!").valid).toBe(false);
    expect(validatePasswordPolicy("NoSpecialSymbol12").valid).toBe(false);
    expect(validatePasswordPolicy("NoNumber!@#").valid).toBe(false);
  });

  it("accepts enterprise strong passwords meeting all requirements", () => {
    const res = validatePasswordPolicy("Aidah#Luxury2026!");
    expect(res.valid).toBe(true);
    expect(res.score).toBe(4);
    expect(res.errors.length).toBe(0);
  });

  it("hashes passwords with bcrypt and verifies correctly", async () => {
    const pwd = "Test#Password2026!";
    const hash = await hashPassword(pwd);
    expect(hash).not.toBe(pwd);
    expect(hash.startsWith("$2")).toBe(true);

    const matches = await verifyPassword(pwd, hash);
    expect(matches).toBe(true);

    const invalidMatches = await verifyPassword("WrongPassword#1", hash);
    expect(invalidMatches).toBe(false);
  });

  it("performs timing-safe string comparisons without leaks", () => {
    const tokenA = "4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d";
    const tokenB = "4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d";
    const tokenC = "4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9e";

    expect(timingSafeMatch(tokenA, tokenB)).toBe(true);
    expect(timingSafeMatch(tokenA, tokenC)).toBe(false);
    expect(timingSafeMatch(tokenA, "shorter")).toBe(false);
  });

  it("hashes tokens with SHA-256 for persistent database storage", () => {
    const raw = "sample_raw_reset_token";
    const hashed = hashToken(raw);
    expect(hashed).toHaveLength(64);
    expect(hashToken(raw)).toBe(hashed);
  });
});

describe("JWT & Session Tokens", () => {
  it("signs and verifies short-lived access tokens", () => {
    const payload = {
      userId: "usr_test_123",
      email: "patron@aidah.com",
      role: "CUSTOMER",
      name: "Aanya",
    };

    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyAccessToken(token);
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it("signs and verifies 7-day refresh tokens", () => {
    const payload = {
      userId: "usr_test_123",
      sessionId: "sess_xyz_789",
    };

    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.sessionId).toBe(payload.sessionId);
  });
});

describe("Sliding Window Rate Limiter", () => {
  it("enforces sliding window limits per IP", () => {
    const testIp = `test_ip_${Date.now()}`;

    // 5 attempts allowed
    for (let i = 0; i < 5; i++) {
      const res = authRateLimiter.check(testIp);
      expect(res.allowed).toBe(true);
    }

    // 6th attempt rejected
    const blockedRes = authRateLimiter.check(testIp);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.resetInSeconds).toBeGreaterThan(0);
  });
});

describe("Modular Payment Gateway Abstraction", () => {
  it("MockPaymentGateway creates mock orders and verifies signatures", async () => {
    const mockGateway = new MockPaymentGateway();
    const order = await mockGateway.createPaymentOrder({
      orderId: "AIDAH-TEST-001",
      amountInPaise: 2500000,
      currency: "INR",
      customer: {
        name: "Test Customer",
        email: "test@aidah.com",
        phone: "+91 98765 43210",
      },
    });

    expect(order.gatewayOrderId.startsWith("order_mock_")).toBe(true);
    expect(order.amount).toBe(2500000);
    expect(order.currency).toBe("INR");

    const isValid = mockGateway.verifyPaymentSignature({
      razorpayOrderId: order.gatewayOrderId,
      razorpayPaymentId: "pay_mock_123",
      razorpaySignature: "sig_mock_456",
    });
    expect(isValid).toBe(true);

    const refund = await mockGateway.processRefund("pay_mock_123", 2500000);
    expect(refund.status).toBe("processed");
  });

  it("RazorpayGateway verifies genuine HMAC-SHA256 signatures accurately", () => {
    const gateway = new RazorpayGateway();
    const keySecret = "YOUR_KEY_SECRET_HERE";
    const orderId = "order_rzp_live_123";
    const paymentId = "pay_rzp_live_456";

    // Compute expected genuine HMAC
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const genuineCheck = gateway.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: expectedSignature,
    });
    expect(genuineCheck).toBe(true);

    const forgedCheck = gateway.verifyPaymentSignature({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: "forged_tampered_signature_hex_value_1234567890",
    });
    expect(forgedCheck).toBe(false);
  });
});

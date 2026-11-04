import crypto from "node:crypto";
import type {
  IPaymentGateway,
  CreateOrderParams,
  PaymentVerificationParams,
} from "./payment-gateway.interface";

// ============================================================================
// [RAZORPAY CONFIGURATION BLOCK]
// Replace these with your live / test keys or set via process.env
// ============================================================================
export const RAZORPAY_CONFIG = {
  keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID_HERE",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET_HERE",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "YOUR_WEBHOOK_SECRET_HERE",
  currency: "INR",
};
// ============================================================================

export class RazorpayGateway implements IPaymentGateway {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = RAZORPAY_CONFIG.keyId;
    this.keySecret = RAZORPAY_CONFIG.keySecret;
    this.webhookSecret = RAZORPAY_CONFIG.webhookSecret;
  }

  /**
   * Creates an order with Razorpay Orders API
   */
  async createPaymentOrder(params: CreateOrderParams) {
    // Basic Auth header using key_id and key_secret
    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: params.amountInPaise,
        currency: params.currency || "INR",
        receipt: params.orderId,
        notes: params.notes || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Razorpay Order Creation Failed: ${JSON.stringify(errorData)}`);
    }

    const data = (await response.json()) as { id: string; amount: number; currency: string };
    return {
      gatewayOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: this.keyId,
    };
  }

  /**
   * Verifies Razorpay payment signature using HMAC SHA-256
   */
  verifyPaymentSignature(params: PaymentVerificationParams): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(body)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const signatureBuf = Buffer.from(razorpaySignature, "utf-8");

    if (expectedBuf.length !== signatureBuf.length) {
      crypto.timingSafeEqual(expectedBuf, expectedBuf);
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  }

  /**
   * Verifies incoming Webhook signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const signatureBuf = Buffer.from(signature, "utf-8");

    if (expectedBuf.length !== signatureBuf.length) {
      crypto.timingSafeEqual(expectedBuf, expectedBuf);
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  }

  /**
   * Processes a refund via Razorpay Refund API
   */
  async processRefund(paymentId: string, amountInPaise: number) {
    const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({ amount: amountInPaise }),
    });

    if (!response.ok) {
      throw new Error("Refund processing failed");
    }
    const data = (await response.json()) as { id: string; status: string };
    return { refundId: data.id, status: data.status };
  }
}

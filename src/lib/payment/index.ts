import type { IPaymentGateway } from "./payment-gateway.interface";
import { RazorpayGateway } from "./razorpay.service";
import { MockPaymentGateway } from "./mock-payment.service";

export * from "./payment-gateway.interface";
export * from "./razorpay.service";
export * from "./mock-payment.service";

let gatewayInstance: IPaymentGateway | null = null;

/**
 * Returns the configured payment gateway implementation based on PAYMENT_GATEWAY_PROVIDER.
 * Enforces production safety to prevent accidental zero-cost mock checkouts in live environments.
 */
export function getPaymentGateway(): IPaymentGateway {
  if (gatewayInstance) return gatewayInstance;

  const provider = (process.env.PAYMENT_GATEWAY_PROVIDER || "MOCK").toUpperCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && provider === "MOCK" && process.env.ALLOW_MOCK_PAYMENTS !== "true") {
    throw new Error(
      "SECURITY CRITICAL: MockPaymentGateway cannot be enabled in production environment without explicit ALLOW_MOCK_PAYMENTS=true.",
    );
  }

  if (provider === "RAZORPAY") {
    gatewayInstance = new RazorpayGateway();
  } else {
    gatewayInstance = new MockPaymentGateway();
  }

  return gatewayInstance;
}

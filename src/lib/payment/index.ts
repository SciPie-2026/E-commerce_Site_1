import type { IPaymentGateway } from "./payment-gateway.interface";
import { RazorpayGateway } from "./razorpay.service";
import { MockPaymentGateway } from "./mock-payment.service";

export * from "./payment-gateway.interface";
export * from "./razorpay.service";
export * from "./mock-payment.service";

let gatewayInstance: IPaymentGateway | null = null;

/**
 * Returns the configured payment gateway implementation based on PAYMENT_GATEWAY_PROVIDER.
 */
export function getPaymentGateway(): IPaymentGateway {
  if (gatewayInstance) return gatewayInstance;

  const provider = (process.env.PAYMENT_GATEWAY_PROVIDER || "MOCK").toUpperCase();

  if (provider === "RAZORPAY") {
    gatewayInstance = new RazorpayGateway();
  } else {
    gatewayInstance = new MockPaymentGateway();
  }

  return gatewayInstance;
}

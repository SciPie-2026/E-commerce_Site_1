import type {
  IPaymentGateway,
  CreateOrderParams,
  PaymentVerificationParams,
} from "./payment-gateway.interface";

/**
 * MockPaymentGateway allows seamless local zero-credential testing.
 */
export class MockPaymentGateway implements IPaymentGateway {
  async createPaymentOrder(params: CreateOrderParams) {
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      gatewayOrderId: mockOrderId,
      amount: params.amountInPaise,
      currency: params.currency || "INR",
      keyId: "rzp_test_MOCK_LOCAL_KEY",
    };
  }

  verifyPaymentSignature(params: PaymentVerificationParams): boolean {
    // In mock mode, any non-empty signature is verified or mock-specific signature
    return (
      params.razorpayOrderId.startsWith("order_mock_") &&
      Boolean(params.razorpayPaymentId) &&
      Boolean(params.razorpaySignature)
    );
  }

  verifyWebhookSignature(_rawBody: string, signature: string): boolean {
    return Boolean(signature && signature.length > 0);
  }

  async processRefund(_paymentId: string, _amountInPaise: number) {
    return {
      refundId: `rfnd_mock_${Date.now()}`,
      status: "processed",
    };
  }
}

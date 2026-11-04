export interface CreateOrderParams {
  orderId: string;
  amountInPaise: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
}

export interface PaymentVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface IPaymentGateway {
  createPaymentOrder(params: CreateOrderParams): Promise<{
    gatewayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>;
  verifyPaymentSignature(params: PaymentVerificationParams): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  processRefund(
    paymentId: string,
    amountInPaise: number,
  ): Promise<{ refundId: string; status: string }>;
}

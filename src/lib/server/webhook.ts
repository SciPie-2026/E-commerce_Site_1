import { prisma } from "../db";
import { getPaymentGateway } from "../payment";

interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        currency: string;
      };
    };
    order?: {
      entity: {
        id: string;
        receipt?: string;
        amount: number;
        status: string;
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        status: string;
      };
    };
  };
}

export async function processRazorpayWebhook(rawBody: string, signature: string) {
  const gateway = getPaymentGateway();
  const isValid = gateway.verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }

  const eventData = JSON.parse(rawBody) as RazorpayWebhookPayload;
  const eventType = eventData.event;

  switch (eventType) {
    case "payment.captured": {
      const payment = eventData.payload.payment?.entity;
      if (!payment) break;

      const order = await prisma.order.findFirst({
        where: {
          OR: [{ paymentGatewayOrderId: payment.order_id }, { id: payment.order_id }],
        },
      });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            paymentGatewayPaymentId: payment.id,
          },
        });
      }
      break;
    }

    case "payment.failed": {
      const payment = eventData.payload.payment?.entity;
      if (!payment) break;

      const order = await prisma.order.findFirst({
        where: {
          OR: [{ paymentGatewayOrderId: payment.order_id }, { id: payment.order_id }],
        },
        include: { orderItems: true },
      });

      if (order && order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        });

        // Restore inventory
        for (const item of order.orderItems) {
          if (item.productId) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { inventory: { increment: item.quantity } },
            });
          }
        }
      }
      break;
    }

    case "refund.processed": {
      const refund = eventData.payload.refund?.entity;
      if (!refund) break;

      const order = await prisma.order.findFirst({
        where: { paymentGatewayPaymentId: refund.payment_id },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "REFUNDED",
            paymentStatus: "REFUNDED",
          },
        });
      }
      break;
    }

    default:
      break;
  }

  return { received: true };
}

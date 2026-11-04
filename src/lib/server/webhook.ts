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
        include: { orderItems: true },
      });

      // Idempotent: Only process if order has not already been marked PAID
      if (order && order.paymentStatus !== "PAID") {
        let appliedPromoCode: string | null = null;
        if (order.notes) {
          try {
            const parsed = JSON.parse(order.notes);
            if (parsed?.promoCode) appliedPromoCode = parsed.promoCode;
          } catch {
            // Not JSON
          }
        }

        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              paymentGatewayPaymentId: payment.id,
            },
          }),
          // Decrement inventory safely
          ...order.orderItems
            .filter((item) => item.productId)
            .map((item) =>
              prisma.product.updateMany({
                where: { id: item.productId!, inventory: { gte: item.quantity } },
                data: { inventory: { decrement: item.quantity } },
              }),
            ),
          ...(appliedPromoCode
            ? [
                prisma.coupon.updateMany({
                  where: { code: appliedPromoCode },
                  data: { usedCount: { increment: 1 } },
                }),
              ]
            : []),
        ]);
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

      if (order) {
        const wasPaid = order.paymentStatus === "PAID";
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        });

        // Only restore inventory if stock was previously decremented (i.e. order was marked PAID)
        if (wasPaid) {
          for (const item of order.orderItems) {
            if (item.productId) {
              await prisma.product.update({
                where: { id: item.productId },
                data: { inventory: { increment: item.quantity } },
              });
            }
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
        include: { orderItems: true },
      });

      if (order && order.paymentStatus !== "REFUNDED") {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: "REFUNDED",
              paymentStatus: "REFUNDED",
            },
          }),
          // Restore inventory upon verified refund
          ...order.orderItems
            .filter((item) => item.productId)
            .map((item) =>
              prisma.product.update({
                where: { id: item.productId! },
                data: { inventory: { increment: item.quantity } },
              }),
            ),
        ]);
      }
      break;
    }

    default:
      break;
  }

  return { received: true };
}

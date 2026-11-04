import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../db";
import { getCurrentUserFn } from "./auth";
import { getPaymentGateway } from "../payment";
import { CreateOrderInputSchema } from "../auth/validators";
import { z } from "zod";

/**
 * Validate promo code against database
 */
export const validatePromoCodeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        code: z.string().trim().toUpperCase(),
        cartSubtotalPaise: z.number().int().min(0),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { code, cartSubtotalPaise } = data;

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      throw new Error("Invalid or inactive privilege code.");
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error("This privilege code has expired.");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error("This privilege code has reached its usage limit.");
    }

    if (cartSubtotalPaise < coupon.minOrderValue) {
      const minInRupees = Math.round(coupon.minOrderValue / 100);
      throw new Error(`Minimum bag value of ₹${minInRupees.toLocaleString("en-IN")} required.`);
    }

    let discountPaise = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountPaise = Math.round((cartSubtotalPaise * coupon.value) / 100);
      if (coupon.maxDiscount && discountPaise > coupon.maxDiscount) {
        discountPaise = coupon.maxDiscount;
      }
    } else {
      discountPaise = coupon.value;
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountPaise,
      message: `${coupon.discountType === "PERCENTAGE" ? `${coupon.value}%` : `₹${Math.round(coupon.value / 100)}`} atelier privilege applied.`,
    };
  });

/**
 * Create Order and initiate Payment
 */
export const createOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => CreateOrderInputSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await getCurrentUserFn();
    const userId = auth?.user?.id || null;

    // Calculate subtotal from items
    let subtotalPaise = 0;
    for (const item of data.items) {
      subtotalPaise += item.unitPrice * item.quantity;
    }

    // Process discount if code provided
    let discountPaise = 0;
    if (data.promoCode) {
      try {
        const promoRes = await validatePromoCodeFn({
          data: {
            code: data.promoCode,
            cartSubtotalPaise: subtotalPaise,
          },
        });
        discountPaise = promoRes.discountPaise;
      } catch (err: any) {
        // Continue without discount if invalid
        discountPaise = 0;
      }
    }

    // Shipping fee rule: Free shipping above ₹5,000 (500000 paise), else ₹350 (35000 paise)
    const shippingThresholdPaise = 500000;
    const shippingFeePaise =
      subtotalPaise >= shippingThresholdPaise || subtotalPaise === 0 ? 0 : 35000;
    const totalAmountPaise = Math.max(0, subtotalPaise - discountPaise + shippingFeePaise);

    // Generate unique order number: AIDAH-2026-XXXX
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AIDAH-2026-${uniqueSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: JSON.stringify(data.shippingAddress),
        billingAddress: data.billingAddress ? JSON.stringify(data.billingAddress) : null,
        subtotal: subtotalPaise,
        discountTotal: discountPaise,
        shippingFee: shippingFeePaise,
        totalAmount: totalAmountPaise,
        currency: "INR",
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentGateway: "RAZORPAY",
        notes: data.notes || null,
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            productTitle: item.productTitle,
            variantInfo: [
              item.size ? `Size: ${item.size}` : null,
              item.color ? `Color: ${item.color}` : null,
            ]
              .filter(Boolean)
              .join(", "),
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Initiate payment gateway order
    const gateway = getPaymentGateway();
    const gatewayOrder = await gateway.createPaymentOrder({
      orderId: order.orderNumber,
      amountInPaise: totalAmountPaise,
      currency: "INR",
      customer: {
        name: data.shippingAddress.name,
        email: data.customerEmail,
        phone: data.customerPhone,
      },
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // Save gateway order ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentGatewayOrderId: gatewayOrder.gatewayOrderId,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmountPaise,
      gatewayOrder,
    };
  });

/**
 * Verify Payment Signature and Confirm Order
 */
export const verifyPaymentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        orderNumber: z.string(),
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const order = await prisma.order.findUnique({
      where: { orderNumber: data.orderNumber },
      include: { orderItems: true },
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    const gateway = getPaymentGateway();
    const isValid = gateway.verifyPaymentSignature({
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
    });

    if (!isValid) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      throw new Error("Payment signature verification failed.");
    }

    // Update order status to PAID and CONFIRMED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentGatewayPaymentId: data.razorpayPaymentId,
      },
    });

    // Update inventory for items
    for (const item of order.orderItems) {
      if (item.productId) {
        await prisma.product.updateMany({
          where: { id: item.productId, inventory: { gte: item.quantity } },
          data: { inventory: { decrement: item.quantity } },
        });
      }
    }

    return {
      success: true,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
    };
  });

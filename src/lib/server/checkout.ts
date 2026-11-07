import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { prisma } from "../db";
import { getCurrentUserFn } from "./auth";
import { getPaymentGateway } from "../payment";
import { CreateOrderInputSchema } from "../auth/validators";
import { products } from "@/data/catalog";
import {
  couponRateLimiter,
  checkoutRateLimiter,
  paymentVerifyRateLimiter,
} from "../auth/rate-limiter";
import { z } from "zod";

function getSafeRequestIP(): string {
  try {
    return getRequestIP() || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export interface PromoValidationInput {
  code: string;
  cartSubtotalPaise: number;
}

/**
 * Domain Service: Validate promo code against database with rate limiting
 */
export async function processValidatePromoCode(data: PromoValidationInput, clientIp = "127.0.0.1") {
  const limiter = couponRateLimiter.check(`coupon_${clientIp}`);
  if (!limiter.allowed) {
    throw new Error(
      `Too many coupon verification attempts. Please wait ${limiter.resetInSeconds} seconds.`,
    );
  }

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
}

/**
 * Domain Service: Create Order and initiate Payment
 * Enforces server-authoritative pricing and inventory verification.
 */
export async function processCreateOrder(
  data: z.infer<typeof CreateOrderInputSchema>,
  clientIp = "127.0.0.1",
  userId: string | null = null,
) {
  const limiter = checkoutRateLimiter.check(`checkout_${clientIp}`);
  if (!limiter.allowed) {
    throw new Error(`Too many checkout attempts. Please wait ${limiter.resetInSeconds} seconds.`);
  }

  // Server-authoritative price & inventory verification
  let verifiedSubtotalPaise = 0;
  const verifiedItems: Array<{
    productId: string | null;
    productTitle: string;
    variantInfo: string | null;
    unitPrice: number;
    quantity: number;
  }> = [];

  for (const item of data.items) {
    // Look up product in database first
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [...(item.productId ? [{ id: item.productId }] : []), { slug: item.productSlug }],
      },
    });

    let authoritativeUnitPricePaise: number;
    let authoritativeProductId: string | null = null;
    let authoritativeTitle = item.productTitle;

    if (dbProduct) {
      if (!dbProduct.isPublished) {
        throw new Error(`Product "${dbProduct.title}" is currently unavailable.`);
      }
      if (dbProduct.inventory < item.quantity) {
        throw new Error(
          `Insufficient inventory for "${dbProduct.title}". Only ${dbProduct.inventory} piece(s) available.`,
        );
      }
      authoritativeUnitPricePaise = dbProduct.price;
      authoritativeProductId = dbProduct.id;
      authoritativeTitle = dbProduct.title;
    } else {
      // Fallback catalog lookup
      const catProduct = products.find(
        (p) => p.slug === item.productSlug || (item.productId && p.id === item.productId),
      );
      if (!catProduct) {
        throw new Error(`Invalid catalog item: "${item.productTitle}".`);
      }
      authoritativeUnitPricePaise = catProduct.price * 100; // Catalog prices in INR to paise
      authoritativeTitle = catProduct.name;
    }

    verifiedSubtotalPaise += authoritativeUnitPricePaise * item.quantity;
    verifiedItems.push({
      productId: authoritativeProductId,
      productTitle: authoritativeTitle,
      variantInfo:
        [item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null]
          .filter(Boolean)
          .join(", ") || null,
      unitPrice: authoritativeUnitPricePaise,
      quantity: item.quantity,
    });
  }

  // Process discount if code provided
  let discountPaise = 0;
  let validatedPromoCode: string | null = null;

  if (data.promoCode) {
    try {
      const promoRes = await processValidatePromoCode(
        {
          code: data.promoCode,
          cartSubtotalPaise: verifiedSubtotalPaise,
        },
        clientIp,
      );
      discountPaise = promoRes.discountPaise;
      validatedPromoCode = promoRes.code;
    } catch {
      discountPaise = 0;
      validatedPromoCode = null;
    }
  }

  // Shipping fee rule: Free shipping above ₹5,000 (500000 paise), else ₹350 (35000 paise)
  const shippingThresholdPaise = 500000;
  const shippingFeePaise =
    verifiedSubtotalPaise >= shippingThresholdPaise || verifiedSubtotalPaise === 0 ? 0 : 35000;
  const totalAmountPaise = Math.max(0, verifiedSubtotalPaise - discountPaise + shippingFeePaise);

  // Generate unique order number: AIDAH-2026-XXXX
  const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `AIDAH-2026-${uniqueSuffix}`;

  const orderNotes = JSON.stringify({
    promoCode: validatedPromoCode,
    userNotes: data.notes || null,
  });

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: JSON.stringify(data.shippingAddress),
      billingAddress: data.billingAddress ? JSON.stringify(data.billingAddress) : null,
      subtotal: verifiedSubtotalPaise,
      discountTotal: discountPaise,
      shippingFee: shippingFeePaise,
      totalAmount: totalAmountPaise,
      currency: "INR",
      status: "PENDING",
      paymentStatus: "UNPAID",
      paymentGateway: "RAZORPAY",
      notes: orderNotes,
      orderItems: {
        create: verifiedItems.map((item) => ({
          productId: item.productId,
          productTitle: item.productTitle,
          variantInfo: item.variantInfo,
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
}

export interface VerifyPaymentInput {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Domain Service: Verify Payment Signature and Confirm Order
 * Enforces gateway order binding, idempotent confirmation, and atomic transactions.
 */
export async function processVerifyPayment(data: VerifyPaymentInput, clientIp = "127.0.0.1") {
  const limiter = paymentVerifyRateLimiter.check(`verify_${clientIp}`);
  if (!limiter.allowed) {
    throw new Error(
      `Too many verification attempts. Please wait ${limiter.resetInSeconds} seconds.`,
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: data.orderNumber },
    include: { orderItems: true },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  // Idempotency: If order was already paid, return existing success state without duplicating stock decrement
  if (order.paymentStatus === "PAID") {
    return {
      success: true,
      orderNumber: order.orderNumber,
      status: order.status,
    };
  }

  // Security binding: Ensure the verified gateway order ID matches the order record in database
  if (order.paymentGatewayOrderId && order.paymentGatewayOrderId !== data.razorpayOrderId) {
    throw new Error("Payment order ID mismatch with registered order.");
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

  // Parse promo code if applied
  let appliedPromoCode: string | null = null;
  if (order.notes) {
    try {
      const parsed = JSON.parse(order.notes);
      if (parsed?.promoCode) appliedPromoCode = parsed.promoCode;
    } catch {
      // Not JSON
    }
  }

  // Execute atomic confirmation transaction
  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentGatewayPaymentId: data.razorpayPaymentId,
      },
    }),
    // Decrement inventory for items with stock
    ...order.orderItems
      .filter((item) => item.productId)
      .map((item) =>
        prisma.product.updateMany({
          where: { id: item.productId!, inventory: { gte: item.quantity } },
          data: { inventory: { decrement: item.quantity } },
        }),
      ),
    // Increment coupon usage atomically if applied
    ...(appliedPromoCode
      ? [
          prisma.coupon.updateMany({
            where: { code: appliedPromoCode },
            data: { usedCount: { increment: 1 } },
          }),
        ]
      : []),
  ]);

  return {
    success: true,
    orderNumber: updatedOrder.orderNumber,
    status: updatedOrder.status,
  };
}

/**
 * Server Functions
 */
export const validatePromoCodeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        code: z.string().trim().max(30).toUpperCase(),
        cartSubtotalPaise: z.number().int().min(0).max(1000000000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return processValidatePromoCode(data, getSafeRequestIP());
  });

export const createOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => CreateOrderInputSchema.parse(data))
  .handler(async ({ data }) => {
    const auth = await getCurrentUserFn();
    if (!auth?.user?.id) {
      throw new Error(
        "Authentication required: You must be signed in to an AIDAH account to place an order.",
      );
    }
    return processCreateOrder(data, getSafeRequestIP(), auth.user.id);
  });

export const verifyPaymentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        orderNumber: z.string().max(64),
        razorpayOrderId: z.string().max(64),
        razorpayPaymentId: z.string().max(64),
        razorpaySignature: z.string().max(256),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    return processVerifyPayment(data, getSafeRequestIP());
  });

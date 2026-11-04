import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { prisma } from "../db";
import { getCurrentUserFn } from "./auth";
import { ProductAdminSchema, CouponAdminSchema } from "../auth/validators";
import { z } from "zod";

/**
 * Enterprise Admin Guard Helper
 * Rejects any non-ADMIN user and logs failed access attempts.
 */
async function requireAdmin() {
  const auth = await getCurrentUserFn();
  const ip = getRequestIP() || "127.0.0.1";

  if (!auth.user || auth.user.role !== "ADMIN") {
    // Log security violation if user was logged in but not admin
    if (auth.user) {
      await prisma.auditLog.create({
        data: {
          adminId: auth.user.id,
          action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
          details: JSON.stringify({
            userId: auth.user.id,
            email: auth.user.email,
            role: auth.user.role,
          }),
          ipAddress: ip,
        },
      });
    }
    throw new Error("Access Denied: Administrative privileges required.");
  }

  return auth.user;
}

/**
 * 1. Admin Dashboard Overview KPI Stats & Trends
 */
export const getAdminStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const [orders, products, users] = await Promise.all([
    prisma.order.findMany({
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
    }),
  ]);

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED");
  const totalRevenuePaise = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const aovPaise = paidOrders.length > 0 ? Math.round(totalRevenuePaise / paidOrders.length) : 0;
  const pendingFulfillment = orders.filter(
    (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PROCESSING",
  ).length;

  // Low stock alert (< 5 inventory)
  const lowStockProducts = products
    .filter((p) => p.inventory < 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      inventory: p.inventory,
      price: p.price,
    }));

  // Sales trend by last 7 days or monthly aggregation for Recharts
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const trendsMap = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = days[d.getDay()];
    trendsMap.set(key, 0);
  }

  for (const o of paidOrders) {
    const orderDate = new Date(o.createdAt);
    const key = days[orderDate.getDay()];
    if (trendsMap.has(key)) {
      trendsMap.set(key, (trendsMap.get(key) || 0) + Math.round(o.totalAmount / 100));
    }
  }

  const salesTrends = Array.from(trendsMap.entries()).map(([day, revenue]) => ({
    name: day,
    revenue,
  }));

  const recentOrders = orders.slice(0, 6).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerEmail: o.customerEmail,
    totalAmount: o.totalAmount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    itemsCount: o.orderItems.length,
  }));

  return {
    totalRevenueInRupees: Math.round(totalRevenuePaise / 100),
    totalOrders,
    aovInRupees: Math.round(aovPaise / 100),
    pendingFulfillment,
    customerCount: users.length,
    lowStockProducts,
    salesTrends,
    recentOrders,
  };
});

/**
 * 2. Product Catalog Management
 */
export const getAdminProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return { products };
});

export const createAdminProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ProductAdminSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const ip = getRequestIP() || "127.0.0.1";

    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug) throw new Error("A product with this slug already exists.");

    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw new Error("A product with this SKU already exists.");

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        category: data.category,
        tags: JSON.stringify(data.tags),
        images: JSON.stringify(data.images),
        isPublished: data.isPublished,
        inventory: data.inventory,
        sku: data.sku,
        fabric: data.fabric,
        occasion: data.occasion,
        badge: data.badge,
        variants: {
          create: data.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            priceAdjustment: v.priceAdjustment,
            sku: v.sku,
          })),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "PRODUCT_CREATE",
        details: JSON.stringify({ productId: product.id, title: product.title, sku: product.sku }),
        ipAddress: ip,
      },
    });

    return { product };
  });

export const updateAdminProductFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.string(),
        data: ProductAdminSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const ip = getRequestIP() || "127.0.0.1";

    const { id, data: updateData } = data;

    // Check slug collision
    const existingSlug = await prisma.product.findFirst({
      where: { slug: updateData.slug, NOT: { id } },
    });
    if (existingSlug) throw new Error("Another product already uses this slug.");

    // Update product & recreate variants
    await prisma.productVariant.deleteMany({ where: { productId: id } });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: updateData.title,
        slug: updateData.slug,
        description: updateData.description,
        price: updateData.price,
        compareAtPrice: updateData.compareAtPrice,
        category: updateData.category,
        tags: JSON.stringify(updateData.tags),
        images: JSON.stringify(updateData.images),
        isPublished: updateData.isPublished,
        inventory: updateData.inventory,
        sku: updateData.sku,
        fabric: updateData.fabric,
        occasion: updateData.occasion,
        badge: updateData.badge,
        variants: {
          create: updateData.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            priceAdjustment: v.priceAdjustment,
            sku: v.sku,
          })),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "PRODUCT_UPDATE",
        details: JSON.stringify({ productId: id, title: updated.title }),
        ipAddress: ip,
      },
    });

    return { product: updated };
  });

export const deleteAdminProductFn = createServerFn({ method: "POST" })
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin();
    const ip = getRequestIP() || "127.0.0.1";

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found.");

    await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "PRODUCT_DELETE",
        details: JSON.stringify({ productId: id, title: product.title, sku: product.sku }),
        ipAddress: ip,
      },
    });

    return { success: true };
  });

/**
 * 3. Order Management Suite
 */
export const getAdminOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    include: {
      orderItems: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { orders };
});

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        orderId: z.string(),
        status: z.enum([
          "PENDING",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
          "REFUNDED",
        ]),
        trackingId: z.string().optional(),
        courierPartner: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const ip = getRequestIP() || "127.0.0.1";

    const updated = await prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: data.status,
        trackingId: data.trackingId || undefined,
        courierPartner: data.courierPartner || undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "ORDER_STATUS_UPDATE",
        details: JSON.stringify({
          orderId: data.orderId,
          orderNumber: updated.orderNumber,
          newStatus: data.status,
          trackingId: data.trackingId,
        }),
        ipAddress: ip,
      },
    });

    return { order: updated };
  });

/**
 * 4. Customer Directory
 */
export const getAdminCustomersFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      },
      addresses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCustomers = customers.map((c) => {
    const totalSpendPaise = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      orderCount: c.orders.length,
      totalSpendInRupees: Math.round(totalSpendPaise / 100),
      createdAt: c.createdAt,
      orders: c.orders,
      addresses: c.addresses,
    };
  });

  return { customers: formattedCustomers };
});

/**
 * 5. Coupons & Discount Manager
 */
export const getAdminCouponsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { coupons };
});

export const createAdminCouponFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => CouponAdminSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    const ip = getRequestIP() || "127.0.0.1";

    const code = data.code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new Error("A coupon with this code already exists.");

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "COUPON_CREATE",
        details: JSON.stringify({ code: coupon.code, value: coupon.value }),
        ipAddress: ip,
      },
    });

    return { coupon };
  });

export const toggleAdminCouponFn = createServerFn({ method: "POST" })
  .validator((id: unknown) => z.string().parse(id))
  .handler(async ({ data: id }) => {
    const admin = await requireAdmin();
    const ip = getRequestIP() || "127.0.0.1";

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new Error("Coupon not found.");

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "COUPON_TOGGLE",
        details: JSON.stringify({ code: updated.code, active: updated.isActive }),
        ipAddress: ip,
      },
    });

    return { coupon: updated };
  });

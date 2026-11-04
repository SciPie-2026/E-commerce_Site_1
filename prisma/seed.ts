import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding AIDAH database...");

  // 1. Seed Default Administrator Account
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@aidah.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMeInProduction#2026!";
  const adminSalt = await bcrypt.genSalt(12);
  const adminPasswordHash = await bcrypt.hash(adminPassword, adminSalt);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      name: "Atelier Director",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isVerified: true,
      phone: "+91 98110 00000",
    },
  });
  console.log(`Administrator created/verified: ${admin.email}`);

  // 2. Seed Customer Account
  const custEmail = "customer@aidah.com";
  const custSalt = await bcrypt.genSalt(12);
  const custPasswordHash = await bcrypt.hash("Customer#2026!", custSalt);

  const customer = await prisma.user.upsert({
    where: { email: custEmail },
    update: {
      passwordHash: custPasswordHash,
    },
    create: {
      name: "Aanya Sharma",
      email: custEmail,
      passwordHash: custPasswordHash,
      role: "CUSTOMER",
      isVerified: true,
      phone: "+91 98765 43210",
      addresses: {
        create: [
          {
            type: "SHIPPING",
            name: "Aanya Sharma",
            street: "DLF Phase 5, Golf Course Road",
            city: "Gurugram",
            state: "Haryana",
            postalCode: "122002",
            country: "India",
            phone: "+91 98765 43210",
            isDefault: true,
          },
        ],
      },
    },
  });
  console.log(`Customer created/verified: ${customer.email}`);

  // 3. Seed Promo Codes
  const couponsData = [
    {
      code: "AIDAH10",
      discountType: "PERCENTAGE",
      value: 10,
      minOrderValue: 500000, // ₹5,000
      maxDiscount: 500000, // Max ₹5,000 off
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: "ATELIER500",
      discountType: "FIXED",
      value: 50000, // ₹500 in paise
      minOrderValue: 300000, // ₹3,000
      usageLimit: 500,
      isActive: true,
    },
    {
      code: "COUTUREVIP",
      discountType: "PERCENTAGE",
      value: 15,
      minOrderValue: 1500000, // ₹15,000
      maxDiscount: 1000000,
      usageLimit: 100,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log("Privilege coupon codes seeded.");

  // 4. Seed Authentic Catalog Products
  const sampleProducts = [
    {
      slug: "seraphina-ice-blue-gown",
      title: "Seraphina Ice Blue Saree Gown",
      description:
        "Pre-draped liquid organza and metallic silk saree gown with crystal hand-embroidery along the pallu border. Hand-finished at Baani City Centre.",
      price: 2850000, // ₹28,500
      compareAtPrice: 3200000,
      category: "evening-wear",
      tags: JSON.stringify(["evening", "saree-gown", "organza", "crystal"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      ]),
      inventory: 8,
      sku: "AIDAH-GOW-01",
      fabric: "Liquid Organza & Silk Crepe",
      occasion: "Cocktail / Reception",
      badge: "Limited Edition",
    },
    {
      slug: "aurora-sage-linen-coord",
      title: "Aurora Sage Pure Linen Co-ord Set",
      description:
        "Textured European linen tailored into an asymmetrical high-low tunic paired with wide-leg cropped trousers. Minimalist luxury for daytime occasions.",
      price: 1450000, // ₹14,500
      compareAtPrice: 1650000,
      category: "co-ord-sets",
      tags: JSON.stringify(["linen", "co-ord", "sage", "daywear"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      ]),
      inventory: 15,
      sku: "AIDAH-CRD-02",
      fabric: "100% Certified European Linen",
      occasion: "High Tea / Resort",
      badge: "Bestseller",
    },
    {
      slug: "gulabi-floral-resplendent-lehenga",
      title: "Gulabi Resham Embroidered Lehenga",
      description:
        "Raw silk lehenga featuring hand-embroidered floral vines with fine resham and delicate zardozi borders. Includes blouse and sheer organza dupatta.",
      price: 4850000, // ₹48,500
      compareAtPrice: 5500000,
      category: "ethnic-wear",
      tags: JSON.stringify(["lehenga", "resham", "rawsilk", "wedding"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
      ]),
      inventory: 3, // Low stock triggers warning in admin
      sku: "AIDAH-LHG-03",
      fabric: "Pure Raw Silk & Hand-Woven Organza",
      occasion: "Wedding / Sangeet",
      badge: "Atelier Signature",
    },
    {
      slug: "valeria-ice-cape-set",
      title: "Valeria Organza Cape & Dhoti Set",
      description:
        "Floor-sweeping embroidered cape coat layered over an embellished bustier and tailored silk dhoti trousers. Statement silhouette for festive evenings.",
      price: 2200000, // ₹22,000
      compareAtPrice: 2450000,
      category: "party-wear",
      tags: JSON.stringify(["cape", "dhoti", "party", "contemporary"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
      ]),
      inventory: 12,
      sku: "AIDAH-CPE-04",
      fabric: "Silk Georgette & Sheer Organza",
      occasion: "Festive Soirée",
      badge: "New",
    },
    {
      slug: "camille-blush-maxi",
      title: "Camille Hand-Painted Blush Maxi Dress",
      description:
        "Sunlit resort dress in pure silk mulmul with botanical watercolor motifs hand-pressed by our artisans. Flattering belted waist and flutter sleeves.",
      price: 1250000, // ₹12,500
      compareAtPrice: 1400000,
      category: "floral-dresses",
      tags: JSON.stringify(["floral", "resort", "maxi", "blush"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
      ]),
      inventory: 20,
      sku: "AIDAH-FLR-05",
      fabric: "Silk Mulmul & Cotton Voile Lining",
      occasion: "Resort / Brunch",
    },
  ];

  for (const prod of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...prod,
          variants: {
            create: [
              { size: "S", color: "Atelier Original", stock: Math.floor(prod.inventory / 3) },
              { size: "M", color: "Atelier Original", stock: Math.floor(prod.inventory / 3) },
              { size: "L", color: "Atelier Original", stock: Math.ceil(prod.inventory / 3) },
            ],
          },
        },
      });
    }
  }
  console.log("Atelier catalog ensembles seeded.");

  // 5. Seed Test Orders with Diverse Fulfillment & Payment Statuses
  const existingOrders = await prisma.order.findMany();
  if (existingOrders.length === 0) {
    await prisma.order.create({
      data: {
        orderNumber: "AIDAH-2026-8821",
        userId: customer.id,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+91 98765 43210",
        shippingAddress: JSON.stringify({
          type: "SHIPPING",
          name: customer.name,
          street: "DLF Phase 5, Golf Course Road",
          city: "Gurugram",
          state: "Haryana",
          postalCode: "122002",
          country: "India",
          phone: "+91 98765 43210",
        }),
        subtotal: 2850000,
        discountTotal: 285000, // 10% privilege savings
        shippingFee: 0,
        totalAmount: 2565000,
        currency: "INR",
        status: "DELIVERED",
        paymentStatus: "PAID",
        paymentGateway: "RAZORPAY",
        paymentGatewayOrderId: "order_rzp_mock_8821",
        paymentGatewayPaymentId: "pay_rzp_mock_8821",
        trackingId: "BLU-882194821",
        courierPartner: "Bluedart Air Express",
        orderItems: {
          create: [
            {
              productTitle: "Seraphina Ice Blue Saree Gown",
              variantInfo: "Size: M, Color: Ice Blue",
              unitPrice: 2850000,
              quantity: 1,
              totalPrice: 2850000,
            },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        orderNumber: "AIDAH-2026-4419",
        userId: customer.id,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+91 98765 43210",
        shippingAddress: JSON.stringify({
          type: "SHIPPING",
          name: customer.name,
          street: "DLF Phase 5, Golf Course Road",
          city: "Gurugram",
          state: "Haryana",
          postalCode: "122002",
          country: "India",
          phone: "+91 98765 43210",
        }),
        subtotal: 1450000,
        discountTotal: 0,
        shippingFee: 0,
        totalAmount: 1450000,
        currency: "INR",
        status: "PROCESSING",
        paymentStatus: "PAID",
        paymentGateway: "RAZORPAY",
        paymentGatewayOrderId: "order_rzp_mock_4419",
        paymentGatewayPaymentId: "pay_rzp_mock_4419",
        trackingId: "BLU-441902812",
        courierPartner: "Bluedart Surface",
        orderItems: {
          create: [
            {
              productTitle: "Aurora Sage Pure Linen Co-ord Set",
              variantInfo: "Size: S, Color: Sage Green",
              unitPrice: 1450000,
              quantity: 1,
              totalPrice: 1450000,
            },
          ],
        },
      },
    });
    console.log("Test orders seeded.");
  }

  console.log("Seeding complete! Database is primed for production-grade testing.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

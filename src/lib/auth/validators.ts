import { z } from "zod";

export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

export const RegisterInputSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Please provide a valid email address").max(100).toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol",
      ),
    confirmPassword: z.string().max(72),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms of service"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginInputSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").max(100).toLowerCase(),
    password: z
      .string()
      .min(1, "Password is required")
      .max(72, "Password must not exceed 72 characters"),
    rememberMe: z.boolean().optional().default(false),
  })
  .strict();

export const ForgotPasswordInputSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").max(100).toLowerCase(),
  })
  .strict();

export const ResetPasswordInputSchema = z
  .object({
    token: z.string().min(10, "Invalid reset token").max(128),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol",
      ),
    confirmPassword: z.string().max(72),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ProfileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    phone: z
      .string()
      .trim()
      .min(8, "Valid phone number required")
      .max(15)
      .optional()
      .or(z.literal("")),
  })
  .strict();

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(72),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol",
      ),
    confirmNewPassword: z.string().max(72),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export const AddressInputSchema = z
  .object({
    type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
    name: z.string().trim().min(2, "Full name is required").max(80),
    street: z.string().trim().min(5, "Street address is required").max(200),
    city: z.string().trim().min(2, "City is required").max(80),
    state: z.string().trim().min(2, "State / Province is required").max(80),
    postalCode: z.string().trim().min(3, "Postal code is required").max(12),
    country: z
      .string()
      .trim()
      .default("India")
      .refine((val) => val.length <= 50, "Country too long"),
    phone: z.string().trim().min(8, "Contact phone is required").max(15),
    isDefault: z.boolean().default(false),
  })
  .strict();

export const OrderItemInputSchema = z
  .object({
    productId: z.string().max(64).optional(),
    productSlug: z.string().max(100),
    productTitle: z.string().max(200),
    variantInfo: z.string().max(100).optional(),
    size: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    unitPrice: z.number().int().positive("Price must be positive").max(100000000), // Max ₹10,00,000
    quantity: z
      .number()
      .int()
      .positive("Quantity must be at least 1")
      .max(100, "Maximum 100 units per line item"),
  })
  .strict();

export const CreateOrderInputSchema = z
  .object({
    items: z
      .array(OrderItemInputSchema)
      .min(1, "Order must contain at least one item")
      .max(50, "Maximum 50 line items per order"),
    customerEmail: z.string().trim().email("Valid email required").max(100).toLowerCase(),
    customerPhone: z.string().trim().min(8, "Valid phone number required").max(15),
    shippingAddress: AddressInputSchema,
    billingAddress: AddressInputSchema.optional(),
    promoCode: z.string().trim().toUpperCase().max(30).optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const ProductAdminSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(200),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required")
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
    price: z.number().int().positive("Price in paise must be positive").max(100000000),
    compareAtPrice: z.number().int().positive().max(100000000).optional().nullable(),
    category: z.string().trim().min(1, "Category is required").max(50),
    tags: z.array(z.string().trim().max(50)).max(30).default([]),
    images: z
      .array(
        z
          .string()
          .trim()
          .max(500)
          .refine(
            (val) => /^https?:\/\//i.test(val) || val.startsWith("/"),
            "Image URL must start with http://, https://, or /",
          ),
      )
      .min(1, "At least one image is required")
      .max(20, "Maximum 20 images allowed"),
    isPublished: z.boolean().default(true),
    inventory: z.number().int().min(0, "Inventory cannot be negative").max(100000).default(0),
    sku: z.string().trim().min(2, "SKU is required").max(50),
    fabric: z.string().trim().max(100).optional().nullable(),
    occasion: z.string().trim().max(100).optional().nullable(),
    badge: z.string().trim().max(50).optional().nullable(),
    variants: z
      .array(
        z.object({
          size: z.string().trim().max(30),
          color: z.string().trim().max(30),
          stock: z.number().int().min(0).max(100000),
          priceAdjustment: z.number().int().default(0),
          sku: z.string().trim().max(50).optional().nullable(),
        }),
      )
      .max(50)
      .default([]),
  })
  .strict();

export const CouponAdminSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(30)
      .toUpperCase()
      .regex(
        /^[A-Z0-9_-]+$/,
        "Coupon code must contain only letters, numbers, hyphens, and underscores",
      ),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().int().positive("Value must be positive").max(10000000),
    minOrderValue: z.number().int().min(0).max(100000000).default(0),
    maxDiscount: z.number().int().positive().max(10000000).optional().nullable(),
    usageLimit: z.number().int().positive().max(1000000).optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable().or(z.literal("")),
    isActive: z.boolean().default(true),
  })
  .strict();

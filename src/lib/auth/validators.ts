import { z } from "zod";

export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const RegisterInputSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol",
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms of service"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginInputSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional().default(false),
  })
  .strict();

export const ForgotPasswordInputSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  })
  .strict();

export const ResetPasswordInputSchema = z
  .object({
    token: z.string().min(10, "Invalid reset token"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol",
      ),
    confirmPassword: z.string(),
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
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        strongPasswordRegex,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol",
      ),
    confirmNewPassword: z.string(),
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
    country: z.string().trim().default("India"),
    phone: z.string().trim().min(8, "Contact phone is required").max(15),
    isDefault: z.boolean().default(false),
  })
  .strict();

export const OrderItemInputSchema = z
  .object({
    productId: z.string().optional(),
    productSlug: z.string(),
    productTitle: z.string(),
    variantInfo: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    unitPrice: z.number().int().positive("Price must be positive"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
  })
  .strict();

export const CreateOrderInputSchema = z
  .object({
    items: z.array(OrderItemInputSchema).min(1, "Order must contain at least one item"),
    customerEmail: z.string().trim().email("Valid email required").toLowerCase(),
    customerPhone: z.string().trim().min(8, "Valid phone number required").max(15),
    shippingAddress: AddressInputSchema,
    billingAddress: AddressInputSchema.optional(),
    promoCode: z.string().trim().toUpperCase().optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const ProductAdminSchema = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(200),
    slug: z.string().trim().min(2, "Slug is required").max(200),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    price: z.number().int().positive("Price in paise must be positive"),
    compareAtPrice: z.number().int().positive().optional().nullable(),
    category: z.string().trim().min(1, "Category is required"),
    tags: z.array(z.string().trim()).default([]),
    images: z
      .array(z.string().trim().url("Valid image URL required"))
      .min(1, "At least one image is required"),
    isPublished: z.boolean().default(true),
    inventory: z.number().int().min(0, "Inventory cannot be negative").default(0),
    sku: z.string().trim().min(2, "SKU is required"),
    fabric: z.string().trim().optional().nullable(),
    occasion: z.string().trim().optional().nullable(),
    badge: z.string().trim().optional().nullable(),
    variants: z
      .array(
        z.object({
          size: z.string().trim(),
          color: z.string().trim(),
          stock: z.number().int().min(0),
          priceAdjustment: z.number().int().default(0),
          sku: z.string().trim().optional(),
        }),
      )
      .optional()
      .default([]),
  })
  .strict();

export const CouponAdminSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(3, "Code must be at least 3 characters").max(30),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().int().positive("Discount value must be positive"),
    minOrderValue: z.number().int().min(0).default(0),
    maxDiscount: z.number().int().positive().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .strict();

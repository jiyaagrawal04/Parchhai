import { z } from "zod";
import { paginationQuery } from "./common.js";
import {
  CouponType,
  OrderStatus,
  ProductStatus,
  ReturnStatus,
  ReviewStatus,
  Role,
} from "./enums.js";

// ── Products ────────────────────────────────────────────
export const variantInput = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
});

export const productImageInput = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  position: z.number().int().nonnegative().default(0),
});

export const adminProductInput = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1),
  craftId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  fabric: z.string().optional(),
  careInstructions: z.string().optional(),
  artisanCluster: z.string().optional(),
  basePrice: z.number().int().nonnegative(),
  status: ProductStatus.default("DRAFT"),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(productImageInput).default([]),
  variants: z.array(variantInput).default([]),
});
export type AdminProductInput = z.infer<typeof adminProductInput>;

export const adminProductListQuery = paginationQuery.extend({
  q: z.string().optional(),
  status: ProductStatus.optional(),
  craft: z.string().optional(),
  category: z.string().optional(),
});

// ── Inventory ───────────────────────────────────────────
export const inventoryAdjustInput = z.object({
  variantId: z.string().min(1),
  change: z.number().int(), // + restock / - adjustment
  reason: z.enum(["RESTOCK", "ADJUSTMENT", "RETURN", "SALE"]),
  note: z.string().optional(),
});
export type InventoryAdjustInput = z.infer<typeof inventoryAdjustInput>;

// ── Orders ──────────────────────────────────────────────
export const updateOrderStatusInput = z.object({
  status: OrderStatus,
  note: z.string().optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInput>;

export const adminOrderListQuery = paginationQuery.extend({
  q: z.string().optional(),
  status: OrderStatus.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// ── Returns ─────────────────────────────────────────────
export const returnDecisionInput = z.object({
  status: ReturnStatus,
  restock: z.boolean().optional(),
  note: z.string().optional(),
});

// ── Coupons ─────────────────────────────────────────────
export const adminCouponInput = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, - or _"),
  type: CouponType,
  value: z.number().int().nonnegative(),
  minOrder: z.number().int().nonnegative().default(0),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
  eligibleProductIds: z.array(z.string()).default([]),
  eligibleCrafts: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});
export type AdminCouponInput = z.infer<typeof adminCouponInput>;

// ── CMS ─────────────────────────────────────────────────
export const bannerInput = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.string().url(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  placement: z.enum(["home_hero", "strip", "category"]).default("home_hero"),
  position: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const collectionInput = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  heroImage: z.string().url().optional(),
  active: z.boolean().default(true),
  productIds: z.array(z.string()).default([]),
});

export const journalInput = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  coverImage: z.string().url().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const craftInput = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  region: z.string().min(1),
  story: z.string().min(1),
  dyes: z.array(z.string()).default([]),
  heroImage: z.string().url().optional(),
});

// ── Reviews moderation ──────────────────────────────────
export const moderateReviewInput = z.object({ status: ReviewStatus });

// ── Staff / RBAC ────────────────────────────────────────
export const staffInput = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: Role,
});
export type StaffInput = z.infer<typeof staffInput>;

// ── Reports ─────────────────────────────────────────────
export const reportQuery = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  format: z.enum(["json", "csv"]).default("json"),
});
export type ReportQuery = z.infer<typeof reportQuery>;

export interface SalesReportRow {
  date: string;
  orders: number;
  units: number;
  gross: number;
  discount: number;
  net: number;
}

export interface DashboardSummary {
  revenueToday: number;
  revenue30d: number;
  ordersToday: number;
  orders30d: number;
  pendingOrders: number;
  lowStockCount: number;
  pendingReturns: number;
  pendingReviews: number;
  topProducts: { name: string; units: number; revenue: number }[];
  revenueSeries: { date: string; revenue: number }[];
}

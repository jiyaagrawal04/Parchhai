import { z } from "zod";

// Mirror of Prisma enums — kept in sync manually so the FE never imports Prisma.
export const Role = z.enum([
  "CUSTOMER",
  "OWNER",
  "ADMIN",
  "CATALOG_MANAGER",
  "ORDER_OPS",
  "SUPPORT",
  "READONLY",
]);
export type Role = z.infer<typeof Role>;

export const ProductStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type ProductStatus = z.infer<typeof ProductStatus>;

export const OrderStatus = z.enum([
  "PLACED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const PaymentStatus = z.enum([
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const PaymentMethod = z.enum(["RAZORPAY", "COD"]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const ReturnStatus = z.enum([
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PICKED",
  "REFUNDED",
]);
export type ReturnStatus = z.infer<typeof ReturnStatus>;

export const CouponType = z.enum(["PERCENT", "FLAT", "FREESHIP", "BOGO"]);
export type CouponType = z.infer<typeof CouponType>;

export const ReviewStatus = z.enum(["PENDING", "APPROVED", "HIDDEN"]);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

export const AddressType = z.enum(["HOME", "WORK", "OTHER"]);
export type AddressType = z.infer<typeof AddressType>;

// Staff roles that can access the admin dashboard.
export const STAFF_ROLES: Role[] = [
  "OWNER",
  "ADMIN",
  "CATALOG_MANAGER",
  "ORDER_OPS",
  "SUPPORT",
  "READONLY",
];

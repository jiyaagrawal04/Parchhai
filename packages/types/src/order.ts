import { z } from "zod";
import { AddressType, OrderStatus, PaymentMethod, PaymentStatus } from "./enums.js";

export const addressInput = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
  type: AddressType.default("HOME"),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressInput>;

export interface AddressDTO extends Omit<AddressInput, "isDefault" | "type"> {
  id: string;
  type: z.infer<typeof AddressType>;
  isDefault: boolean;
}

export const applyCouponInput = z.object({ code: z.string().min(2).max(40) });
export type ApplyCouponInput = z.infer<typeof applyCouponInput>;

export interface CouponPreview {
  code: string;
  valid: boolean;
  discount: number; // paise
  freeShipping: boolean;
  message?: string;
}

export const createOrderInput = z.object({
  addressId: z.string().min(1).optional(),
  address: addressInput.optional(),
  paymentMethod: PaymentMethod,
  couponCode: z.string().optional(),
}).refine((v) => v.addressId || v.address, {
  message: "Provide an addressId or a new address",
});
export type CreateOrderInput = z.infer<typeof createOrderInput>;

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  qty: number;
  unitPrice: number;
  image?: string | null;
}

export interface OrderTimelineDTO {
  status: z.infer<typeof OrderStatus>;
  note: string | null;
  at: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: z.infer<typeof OrderStatus>;
  paymentStatus: z.infer<typeof PaymentStatus>;
  paymentMethod: z.infer<typeof PaymentMethod>;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  shippingAddress: Omit<AddressDTO, "id" | "isDefault" | "type">;
  items: OrderItemDTO[];
  timeline: OrderTimelineDTO[];
  placedAt: string;
}

/** Razorpay order-init response handed to the client checkout widget. */
export interface PaymentInitDTO {
  orderId: string;
  provider: "razorpay" | "stub";
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: "INR";
}

export const verifyPaymentInput = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type VerifyPaymentInput = z.infer<typeof verifyPaymentInput>;

export const createReturnInput = z.object({
  items: z.array(z.object({ orderItemId: z.string(), qty: z.number().int().min(1) })).min(1),
  reason: z.string().min(3).max(500),
  pickupSlot: z.string().optional(),
});
export type CreateReturnInput = z.infer<typeof createReturnInput>;

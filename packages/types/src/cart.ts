import { z } from "zod";

export const addToCartInput = z.object({
  variantId: z.string().min(1),
  qty: z.number().int().min(1).max(20).default(1),
});
export type AddToCartInput = z.infer<typeof addToCartInput>;

export const updateCartItemInput = z.object({
  qty: z.number().int().min(0).max(20), // 0 removes
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemInput>;

export interface CartItemDTO {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  slug: string;
  image: string | null;
  size: string;
  color: string;
  unitPrice: number;
  qty: number;
  stock: number;
  lineTotal: number;
}

export interface CartDTO {
  id: string;
  items: CartItemDTO[];
  subtotal: number;
  itemCount: number;
}

export const wishlistToggleInput = z.object({ variantId: z.string().min(1) });
export type WishlistToggleInput = z.infer<typeof wishlistToggleInput>;

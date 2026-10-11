import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "@/data/site";
import { getProduct } from "@/data/catalog";

export interface CartItem {
  /** `${slug}|${color}|${size}` — one line per variant. */
  key: string;
  slug: string;
  name: string;
  image: string | null;
  color: string;
  size: string;
  price: number; // rupees
  qty: number;
}

interface CartState {
  items: CartItem[];
  coupon: string;
  add: (v: { slug: string; color: string; size: string; qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setCoupon: (code: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: "",

      add: ({ slug, color, size, qty = 1 }) => {
        const p = getProduct(slug);
        if (!p) return;
        const key = `${slug}|${color}|${size}`;
        const items = [...get().items];
        const i = items.findIndex((it) => it.key === key);
        if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
        else items.push({ key, slug, name: p.name, image: p.images[0] ?? null, color, size, price: p.price, qty });
        set({ items });
      },

      setQty: (key, qty) =>
        set({ items: qty <= 0 ? get().items.filter((it) => it.key !== key) : get().items.map((it) => (it.key === key ? { ...it, qty } : it)) }),

      remove: (key) => set({ items: get().items.filter((it) => it.key !== key) }),
      setCoupon: (code) => set({ coupon: code.trim().toUpperCase() }),
      clear: () => set({ items: [], coupon: "" }),
    }),
    { name: "parchhai.cart" },
  ),
);

// ── Derived helpers ──
export const cartCount = (items: CartItem[]) => items.reduce((n, it) => n + it.qty, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, it) => n + it.qty * it.price, 0);
export const cartShipping = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE);
export const cartTotal = (items: CartItem[]) => {
  const s = cartSubtotal(items);
  return s + cartShipping(s);
};

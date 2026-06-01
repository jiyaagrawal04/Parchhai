import type { Coupon } from "@parchhai/db";

const FREE_SHIPPING_THRESHOLD = 149900; // ₹1499 in paise
const STANDARD_SHIPPING = 7900; // ₹79

export interface PricingItem {
  productId: string;
  craftSlug: string | null;
  unitPrice: number;
  qty: number;
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  freeShipping: boolean;
  couponValid: boolean;
  message?: string;
}

const couponApplies = (coupon: Coupon, items: PricingItem[]): boolean => {
  const hasProductFilter = coupon.eligibleProductIds.length > 0;
  const hasCraftFilter = coupon.eligibleCrafts.length > 0;
  if (!hasProductFilter && !hasCraftFilter) return true;
  return items.some(
    (i) =>
      (hasProductFilter && coupon.eligibleProductIds.includes(i.productId)) ||
      (hasCraftFilter && i.craftSlug != null && coupon.eligibleCrafts.includes(i.craftSlug)),
  );
};

/**
 * Validate a coupon against the cart context.
 * `userRedemptions` = how many times this user has already used the coupon.
 */
export const validateCoupon = (
  coupon: Coupon | null,
  subtotal: number,
  items: PricingItem[],
  userRedemptions: number,
  now = new Date(),
): { ok: boolean; message?: string } => {
  if (!coupon) return { ok: false, message: "Coupon not found" };
  if (!coupon.active) return { ok: false, message: "This coupon is no longer active" };
  if (coupon.validFrom && now < coupon.validFrom) return { ok: false, message: "This coupon isn't active yet" };
  if (coupon.validTo && now > coupon.validTo) return { ok: false, message: "This coupon has expired" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { ok: false, message: "This coupon has reached its usage limit" };
  if (userRedemptions >= coupon.perUserLimit)
    return { ok: false, message: "You've already used this coupon" };
  if (subtotal < coupon.minOrder)
    return { ok: false, message: `Minimum order of ₹${Math.round(coupon.minOrder / 100)} required` };
  if (!couponApplies(coupon, items))
    return { ok: false, message: "This coupon doesn't apply to the items in your cart" };
  return { ok: true };
};

/** Compute order totals. Coupon must already be validated (or null). */
export const computePricing = (
  items: PricingItem[],
  coupon: Coupon | null,
  couponIsValid: boolean,
): PricingResult => {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  let discount = 0;
  let freeShipping = false;

  if (coupon && couponIsValid) {
    switch (coupon.type) {
      case "PERCENT":
        discount = Math.round((subtotal * coupon.value) / 100);
        break;
      case "FLAT":
        discount = Math.min(coupon.value, subtotal);
        break;
      case "FREESHIP":
        freeShipping = true;
        break;
      case "BOGO": {
        // Cheapest eligible unit is free.
        const units = items
          .flatMap((i) => Array.from({ length: i.qty }, () => i.unitPrice))
          .sort((a, b) => a - b);
        discount = units[0] ?? 0;
        break;
      }
    }
  }

  const afterDiscount = subtotal - discount;
  const shipping = freeShipping || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = 0; // GST is inclusive per store settings.
  const total = afterDiscount + shipping + tax;

  return { subtotal, discount, shipping, tax, total, freeShipping, couponValid: couponIsValid };
};

export const SHIPPING = { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING };

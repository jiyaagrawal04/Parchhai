import { describe, expect, it } from "vitest";
import type { Coupon } from "@parchhai/db";
import { computePricing, validateCoupon, type PricingItem } from "./pricing.js";

const items: PricingItem[] = [
  { productId: "p1", craftSlug: "ajrakh", unitPrice: 100000, qty: 1 }, // ₹1000
  { productId: "p2", craftSlug: "bagru", unitPrice: 50000, qty: 2 }, // ₹500 x2
];
const subtotal = 200000; // ₹2000

const coupon = (over: Partial<Coupon>): Coupon => ({
  code: "TEST",
  type: "PERCENT",
  value: 10,
  minOrder: 0,
  usageLimit: null,
  perUserLimit: 1,
  usedCount: 0,
  validFrom: null,
  validTo: null,
  eligibleProductIds: [],
  eligibleCrafts: [],
  active: true,
  createdAt: new Date(),
  ...over,
});

describe("validateCoupon", () => {
  it("accepts a valid percent coupon", () => {
    expect(validateCoupon(coupon({}), subtotal, items, 0).ok).toBe(true);
  });
  it("rejects when below minimum order", () => {
    const res = validateCoupon(coupon({ minOrder: 300000 }), subtotal, items, 0);
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/Minimum order/);
  });
  it("rejects an inactive coupon", () => {
    expect(validateCoupon(coupon({ active: false }), subtotal, items, 0).ok).toBe(false);
  });
  it("rejects when per-user limit reached", () => {
    expect(validateCoupon(coupon({ perUserLimit: 1 }), subtotal, items, 1).ok).toBe(false);
  });
  it("rejects when total usage limit reached", () => {
    expect(validateCoupon(coupon({ usageLimit: 5, usedCount: 5 }), subtotal, items, 0).ok).toBe(false);
  });
  it("respects craft eligibility", () => {
    expect(validateCoupon(coupon({ eligibleCrafts: ["dabu"] }), subtotal, items, 0).ok).toBe(false);
    expect(validateCoupon(coupon({ eligibleCrafts: ["ajrakh"] }), subtotal, items, 0).ok).toBe(true);
  });
  it("rejects an expired coupon", () => {
    const res = validateCoupon(coupon({ validTo: new Date("2020-01-01") }), subtotal, items, 0, new Date("2026-01-01"));
    expect(res.ok).toBe(false);
  });
});

describe("computePricing", () => {
  it("applies a percent discount", () => {
    const r = computePricing(items, coupon({ type: "PERCENT", value: 10 }), true);
    expect(r.discount).toBe(20000); // 10% of 2000
  });
  it("applies a flat discount capped at subtotal", () => {
    const r = computePricing(items, coupon({ type: "FLAT", value: 5000000 }), true);
    expect(r.discount).toBe(subtotal);
  });
  it("free shipping above threshold without coupon", () => {
    const big: PricingItem[] = [{ productId: "p", craftSlug: null, unitPrice: 200000, qty: 1 }];
    expect(computePricing(big, null, false).shipping).toBe(0);
  });
  it("charges standard shipping below threshold", () => {
    const small: PricingItem[] = [{ productId: "p", craftSlug: null, unitPrice: 50000, qty: 1 }];
    expect(computePricing(small, null, false).shipping).toBe(7900);
  });
  it("FREESHIP coupon waives shipping", () => {
    const small: PricingItem[] = [{ productId: "p", craftSlug: null, unitPrice: 50000, qty: 1 }];
    expect(computePricing(small, coupon({ type: "FREESHIP", value: 0 }), true).shipping).toBe(0);
  });
  it("BOGO discounts the cheapest unit", () => {
    const r = computePricing(items, coupon({ type: "BOGO", value: 0 }), true);
    expect(r.discount).toBe(50000); // cheapest unit ₹500
  });
  it("does not apply discount when coupon invalid", () => {
    expect(computePricing(items, coupon({}), false).discount).toBe(0);
  });
});

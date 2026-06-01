import { Router } from "express";
import { z } from "zod";
import { adminCouponInput, bannerInput, idParam } from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../lib/errors.js";
import { ok } from "../../lib/response.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";
import { recordAudit } from "../../services/audit.js";

const router = Router();
const canWrite = requireRole("OWNER", "ADMIN", "CATALOG_MANAGER");

// ── Coupons ─────────────────────────────────────────────
router.get(
  "/coupons",
  asyncHandler(async (_req, res) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    ok(res, coupons);
  }),
);

router.post(
  "/coupons",
  canWrite,
  validate(adminCouponInput),
  asyncHandler(async (req, res) => {
    const input = req.body as import("@parchhai/types").AdminCouponInput;
    const coupon = await prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        type: input.type,
        value: input.value,
        minOrder: input.minOrder,
        usageLimit: input.usageLimit ?? null,
        perUserLimit: input.perUserLimit,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validTo: input.validTo ? new Date(input.validTo) : null,
        eligibleProductIds: input.eligibleProductIds,
        eligibleCrafts: input.eligibleCrafts,
        active: input.active,
      },
    });
    await recordAudit(req.user?.sub, "coupon.create", `Coupon:${coupon.code}`);
    ok(res, coupon, 201);
  }),
);

router.put(
  "/coupons/:id",
  canWrite,
  validate(idParam, "params"),
  validate(adminCouponInput.partial()),
  asyncHandler(async (req, res) => {
    const input = req.body as Partial<import("@parchhai/types").AdminCouponInput>;
    const coupon = await prisma.coupon.update({
      where: { code: req.params.id },
      data: {
        type: input.type,
        value: input.value,
        minOrder: input.minOrder,
        usageLimit: input.usageLimit ?? undefined,
        perUserLimit: input.perUserLimit,
        validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
        validTo: input.validTo ? new Date(input.validTo) : undefined,
        eligibleProductIds: input.eligibleProductIds,
        eligibleCrafts: input.eligibleCrafts,
        active: input.active,
      },
    });
    ok(res, coupon);
  }),
);

router.delete(
  "/coupons/:id",
  canWrite,
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    await prisma.coupon.update({ where: { code: req.params.id }, data: { active: false } });
    ok(res, { deactivated: true });
  }),
);

// ── Banners ─────────────────────────────────────────────
router.get(
  "/banners",
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { position: "asc" }] }));
  }),
);

router.post(
  "/banners",
  canWrite,
  validate(bannerInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof bannerInput>;
    const banner = await prisma.banner.create({ data: input });
    ok(res, banner, 201);
  }),
);

router.put(
  "/banners/:id",
  canWrite,
  validate(idParam, "params"),
  validate(bannerInput.partial()),
  asyncHandler(async (req, res) => {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body as Partial<z.infer<typeof bannerInput>> });
    ok(res, banner);
  }),
);

router.delete(
  "/banners/:id",
  canWrite,
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    await prisma.banner.delete({ where: { id: req.params.id } });
    ok(res, { deleted: true });
  }),
);

// ── Abandoned carts ─────────────────────────────────────
router.get(
  "/abandoned-carts",
  asyncHandler(async (_req, res) => {
    const cutoff = new Date(Date.now() - 60 * 60_000); // older than 1h, still active, has items
    const carts = await prisma.cart.findMany({
      where: { status: "active", updatedAt: { lt: cutoff }, items: { some: {} }, userId: { not: null } },
      include: { user: { select: { name: true, email: true } }, items: { include: { variant: { include: { product: { select: { name: true } } } } } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    ok(res, carts.map((c) => ({
      id: c.id,
      customer: c.user?.name ?? "Guest",
      email: c.user?.email ?? null,
      itemCount: c.items.reduce((s, i) => s + i.qty, 0),
      value: c.items.reduce((s, i) => s + i.variant.price * i.qty, 0),
      lastActive: c.updatedAt.toISOString(),
    })));
  }),
);

export default router;

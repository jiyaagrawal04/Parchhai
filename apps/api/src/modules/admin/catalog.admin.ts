import { Router } from "express";
import type { z } from "zod";
import { Prisma } from "@parchhai/db";
import {
  adminProductInput,
  adminProductListQuery,
  collectionInput,
  craftInput,
  idParam,
  inventoryAdjustInput,
  type AdminProductInput,
} from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { ApiError, asyncHandler } from "../../lib/errors.js";
import { ok, okList, paginate } from "../../lib/response.js";
import { slugify } from "../../lib/slug.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";
import { productDetailInclude, toProductDetail } from "../../services/mappers.js";
import { recordAudit } from "../../services/audit.js";

const router = Router();
const canWrite = requireRole("OWNER", "ADMIN", "CATALOG_MANAGER");

// ── Products ────────────────────────────────────────────
router.get(
  "/products",
  validate(adminProductListQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as import("@parchhai/types").PaginationQuery & { q?: string; status?: string; craft?: string; category?: string };
    const where: Prisma.ProductWhereInput = {};
    if (q.q) where.name = { contains: q.q, mode: "insensitive" };
    if (q.status) where.status = q.status as Prisma.EnumProductStatusFilter["equals"];
    if (q.craft) where.craft = { slug: q.craft };
    if (q.category) where.category = { slug: q.category };
    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { craft: { select: { name: true } }, category: { select: { name: true } }, variants: { select: { stock: true } }, images: { take: 1, orderBy: { position: "asc" } } },
        orderBy: { updatedAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    okList(
      res,
      rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        status: p.status,
        basePrice: p.basePrice,
        craft: p.craft?.name ?? null,
        category: p.category?.name ?? null,
        image: p.images[0]?.url ?? null,
        totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
        variantCount: p.variants.length,
      })),
      paginate(q.page, q.pageSize, total),
    );
  }),
);

router.get(
  "/products/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: productDetailInclude });
    if (!product) throw ApiError.notFound("Product not found");
    ok(res, toProductDetail(product));
  }),
);

const buildProductData = (input: AdminProductInput) => ({
  name: input.name,
  slug: input.slug ?? slugify(input.name),
  description: input.description,
  craftId: input.craftId ?? null,
  categoryId: input.categoryId ?? null,
  fabric: input.fabric,
  careInstructions: input.careInstructions,
  artisanCluster: input.artisanCluster,
  basePrice: input.basePrice,
  status: input.status,
  seoTitle: input.seoTitle,
  seoDescription: input.seoDescription,
});

router.post(
  "/products",
  canWrite,
  validate(adminProductInput),
  asyncHandler(async (req, res) => {
    const input = req.body as AdminProductInput;
    const product = await prisma.product.create({
      data: {
        ...buildProductData(input),
        images: { create: input.images.map((im, i) => ({ url: im.url, alt: im.alt, position: im.position ?? i })) },
        variants: { create: input.variants.map((v) => ({ sku: v.sku, size: v.size, color: v.color, price: v.price, stock: v.stock, lowStockThreshold: v.lowStockThreshold })) },
      },
      include: productDetailInclude,
    });
    await recordAudit(req.user?.sub, "product.create", `Product:${product.id}`, null, { name: product.name });
    ok(res, toProductDetail(product), 201);
  }),
);

router.put(
  "/products/:id",
  canWrite,
  validate(idParam, "params"),
  validate(adminProductInput),
  asyncHandler(async (req, res) => {
    const input = req.body as AdminProductInput;
    const before = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!before) throw ApiError.notFound("Product not found");

    // Upsert variants/images: replace images, upsert variants by id, keep stock for existing.
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: before.id }, data: buildProductData(input) });
      await tx.productImage.deleteMany({ where: { productId: before.id } });
      await tx.productImage.createMany({ data: input.images.map((im, i) => ({ productId: before.id, url: im.url, alt: im.alt, position: im.position ?? i })) });
      for (const v of input.variants) {
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data: { sku: v.sku, size: v.size, color: v.color, price: v.price, lowStockThreshold: v.lowStockThreshold } });
        } else {
          await tx.productVariant.create({ data: { productId: before.id, sku: v.sku, size: v.size, color: v.color, price: v.price, stock: v.stock, lowStockThreshold: v.lowStockThreshold } });
        }
      }
    });
    const product = await prisma.product.findUniqueOrThrow({ where: { id: before.id }, include: productDetailInclude });
    await recordAudit(req.user?.sub, "product.update", `Product:${before.id}`, { name: before.name }, { name: product.name });
    ok(res, toProductDetail(product));
  }),
);

router.delete(
  "/products/:id",
  canWrite,
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    // Soft-delete by archiving (preserves order history).
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { status: "ARCHIVED" } });
    await recordAudit(req.user?.sub, "product.archive", `Product:${product.id}`);
    ok(res, { archived: true });
  }),
);

// ── Inventory ───────────────────────────────────────────
router.get(
  "/inventory/low-stock",
  asyncHandler(async (_req, res) => {
    const variants = await prisma.productVariant.findMany({
      where: { stock: { lte: prisma.productVariant.fields.lowStockThreshold } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { stock: "asc" },
    });
    ok(res, variants.map((v) => ({ variantId: v.id, sku: v.sku, product: v.product.name, slug: v.product.slug, size: v.size, color: v.color, stock: v.stock, threshold: v.lowStockThreshold })));
  }),
);

router.get(
  "/inventory/movements",
  asyncHandler(async (req, res) => {
    const variantId = (req.query as { variantId?: string }).variantId;
    const movements = await prisma.inventoryMovement.findMany({
      where: variantId ? { variantId } : {},
      include: { variant: { select: { sku: true, product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    ok(res, movements.map((m) => ({ id: m.id, sku: m.variant.sku, product: m.variant.product.name, change: m.change, reason: m.reason, note: m.note, at: m.createdAt.toISOString() })));
  }),
);

router.post(
  "/inventory/adjust",
  canWrite,
  validate(inventoryAdjustInput),
  asyncHandler(async (req, res) => {
    const input = req.body as import("@parchhai/types").InventoryAdjustInput;
    const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId } });
    if (!variant) throw ApiError.notFound("Variant not found");
    if (variant.stock + input.change < 0) throw ApiError.unprocessable("Adjustment would make stock negative");
    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.productVariant.update({ where: { id: variant.id }, data: { stock: { increment: input.change } } });
      await tx.inventoryMovement.create({ data: { variantId: variant.id, change: input.change, reason: input.reason, note: input.note, createdBy: req.user?.sub } });
      return v;
    });
    await recordAudit(req.user?.sub, "inventory.adjust", `Variant:${variant.id}`, { stock: variant.stock }, { stock: updated.stock });
    ok(res, { variantId: updated.id, stock: updated.stock });
  }),
);

// ── Crafts ──────────────────────────────────────────────
router.post(
  "/crafts",
  canWrite,
  validate(craftInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof craftInput>;
    const craft = await prisma.craft.create({ data: { name: input.name, slug: input.slug ?? slugify(input.name), region: input.region, story: input.story, dyes: input.dyes, heroImage: input.heroImage } });
    ok(res, craft, 201);
  }),
);

router.put(
  "/crafts/:id",
  canWrite,
  validate(idParam, "params"),
  validate(craftInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof craftInput>;
    const craft = await prisma.craft.update({ where: { id: req.params.id }, data: { name: input.name, region: input.region, story: input.story, dyes: input.dyes, heroImage: input.heroImage } });
    ok(res, craft);
  }),
);

// ── Categories ──────────────────────────────────────────
router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const cats = await prisma.category.findMany({ orderBy: { position: "asc" } });
    ok(res, cats);
  }),
);

// ── Collections ─────────────────────────────────────────
router.get(
  "/collections",
  asyncHandler(async (_req, res) => {
    const cols = await prisma.collection.findMany({ include: { _count: { select: { products: true } } }, orderBy: { position: "asc" } });
    ok(res, cols.map((c) => ({ id: c.id, name: c.name, slug: c.slug, active: c.active, productCount: c._count.products })));
  }),
);

router.post(
  "/collections",
  canWrite,
  validate(collectionInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof collectionInput>;
    const col = await prisma.collection.create({
      data: {
        name: input.name,
        slug: input.slug ?? slugify(input.name),
        description: input.description,
        heroImage: input.heroImage,
        active: input.active,
        products: { create: input.productIds.map((productId, i) => ({ productId, position: i })) },
      },
    });
    ok(res, col, 201);
  }),
);

router.put(
  "/collections/:id",
  canWrite,
  validate(idParam, "params"),
  validate(collectionInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof collectionInput>;
    await prisma.$transaction(async (tx) => {
      await tx.collection.update({ where: { id: req.params.id }, data: { name: input.name, description: input.description, heroImage: input.heroImage, active: input.active } });
      await tx.collectionProduct.deleteMany({ where: { collectionId: req.params.id } });
      await tx.collectionProduct.createMany({ data: input.productIds.map((productId, i) => ({ collectionId: req.params.id, productId, position: i })) });
    });
    ok(res, { updated: true });
  }),
);

export default router;

import { Router } from "express";
import { Prisma } from "@parchhai/db";
import {
  pincodeCheckQuery,
  productListQuery,
  slugParam,
  type PincodeCheckResult,
  type ProductListQuery,
} from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { ok, okList, paginate } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import {
  productDetailInclude,
  productListInclude,
  toCraftDTO,
  toJournalDTO,
  toProductDetail,
  toProductListItem,
  toReviewDTO,
} from "../services/mappers.js";

const router = Router();

// GET /catalog/products
router.get(
  "/products",
  validate(productListQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as ProductListQuery;

    const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };
    if (q.craft) where.craft = { slug: q.craft };
    if (q.category) where.category = { slug: q.category };
    if (q.collection) where.collections = { some: { collection: { slug: q.collection } } };
    if (q.q) where.OR = [
      { name: { contains: q.q, mode: "insensitive" } },
      { description: { contains: q.q, mode: "insensitive" } },
    ];
    const variantFilter: Prisma.ProductVariantWhereInput = {};
    if (q.size) variantFilter.size = q.size;
    if (q.color) variantFilter.color = { equals: q.color, mode: "insensitive" };
    if (q.minPrice != null || q.maxPrice != null)
      variantFilter.price = { ...(q.minPrice != null ? { gte: q.minPrice } : {}), ...(q.maxPrice != null ? { lte: q.maxPrice } : {}) };
    if (q.inStock) variantFilter.stock = { gt: 0 };
    if (Object.keys(variantFilter).length) where.variants = { some: variantFilter };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      q.sort === "price_asc"
        ? { basePrice: "asc" }
        : q.sort === "price_desc"
          ? { basePrice: "desc" }
          : q.sort === "rating"
            ? { ratingAvg: "desc" }
            : q.sort === "popular"
              ? { ratingCount: "desc" }
              : { createdAt: "desc" };

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);

    okList(res, rows.map(toProductListItem), paginate(q.page, q.pageSize, total));
  }),
);

// GET /catalog/products/:slug
router.get(
  "/products/:slug",
  validate(slugParam, "params"),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: { not: "ARCHIVED" } },
      include: productDetailInclude,
    });
    if (!product) throw ApiError.notFound("Product not found");
    ok(res, toProductDetail(product));
  }),
);

// GET /catalog/products/:slug/reviews
router.get(
  "/products/:slug/reviews",
  validate(slugParam, "params"),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
    if (!product) throw ApiError.notFound("Product not found");
    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    ok(res, reviews.map(toReviewDTO));
  }),
);

// GET /catalog/crafts
router.get(
  "/crafts",
  asyncHandler(async (_req, res) => {
    const crafts = await prisma.craft.findMany({ orderBy: { position: "asc" } });
    ok(res, crafts.map(toCraftDTO));
  }),
);

// GET /catalog/crafts/:slug
router.get(
  "/crafts/:slug",
  validate(slugParam, "params"),
  asyncHandler(async (req, res) => {
    const craft = await prisma.craft.findUnique({ where: { slug: req.params.slug } });
    if (!craft) throw ApiError.notFound("Craft not found");
    ok(res, toCraftDTO(craft));
  }),
);

// GET /catalog/categories
router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
    ok(res, categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId })));
  }),
);

// GET /catalog/collections
router.get(
  "/collections",
  asyncHandler(async (_req, res) => {
    const collections = await prisma.collection.findMany({ where: { active: true }, orderBy: { position: "asc" } });
    ok(res, collections.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, heroImage: c.heroImage })));
  }),
);

// GET /catalog/journal
router.get(
  "/journal",
  asyncHandler(async (_req, res) => {
    const posts = await prisma.journalPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } });
    ok(res, posts.map(toJournalDTO));
  }),
);

// GET /catalog/journal/:slug
router.get(
  "/journal/:slug",
  validate(slugParam, "params"),
  asyncHandler(async (req, res) => {
    const post = await prisma.journalPost.findFirst({ where: { slug: req.params.slug, status: "PUBLISHED" } });
    if (!post) throw ApiError.notFound("Post not found");
    ok(res, toJournalDTO(post));
  }),
);

// GET /catalog/banners
router.get(
  "/banners",
  asyncHandler(async (_req, res) => {
    const banners = await prisma.banner.findMany({ where: { active: true }, orderBy: [{ placement: "asc" }, { position: "asc" }] });
    ok(res, banners.map((b) => ({ id: b.id, title: b.title, subtitle: b.subtitle, image: b.image, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, placement: b.placement, position: b.position })));
  }),
);

// GET /catalog/pincode?pincode=500034
router.get(
  "/pincode",
  validate(pincodeCheckQuery, "query"),
  asyncHandler(async (req, res) => {
    const pincode = (req.query as unknown as { pincode: string }).pincode;
    const row = await prisma.pincodeServiceability.findUnique({ where: { pincode } });
    const result: PincodeCheckResult = row
      ? { pincode, serviceable: row.serviceable, codAvailable: row.codAvailable, etaDays: row.etaDays }
      : { pincode, serviceable: true, codAvailable: true, etaDays: 6 }; // default: serviceable nationwide
    ok(res, result);
  }),
);

export default router;

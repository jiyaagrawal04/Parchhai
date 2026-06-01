import { Router } from "express";
import { z } from "zod";
import { idParam, journalInput, moderateReviewInput } from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { ApiError, asyncHandler } from "../../lib/errors.js";
import { ok } from "../../lib/response.js";
import { slugify } from "../../lib/slug.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";

const router = Router();
const canWriteCms = requireRole("OWNER", "ADMIN", "CATALOG_MANAGER");
const canModerate = requireRole("OWNER", "ADMIN", "SUPPORT");

// ── Journal ─────────────────────────────────────────────
router.get(
  "/journal",
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.journalPost.findMany({ orderBy: { createdAt: "desc" } }));
  }),
);

router.post(
  "/journal",
  canWriteCms,
  validate(journalInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof journalInput>;
    const post = await prisma.journalPost.create({
      data: {
        title: input.title,
        slug: input.slug ?? slugify(input.title),
        excerpt: input.excerpt,
        body: input.body,
        coverImage: input.coverImage,
        author: input.author,
        tags: input.tags,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    });
    ok(res, post, 201);
  }),
);

router.put(
  "/journal/:id",
  canWriteCms,
  validate(idParam, "params"),
  validate(journalInput.partial()),
  asyncHandler(async (req, res) => {
    const input = req.body as Partial<z.infer<typeof journalInput>>;
    const existing = await prisma.journalPost.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound("Post not found");
    const post = await prisma.journalPost.update({
      where: { id: existing.id },
      data: {
        ...input,
        publishedAt: input.status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined,
      },
    });
    ok(res, post);
  }),
);

router.delete(
  "/journal/:id",
  canWriteCms,
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    await prisma.journalPost.delete({ where: { id: req.params.id } });
    ok(res, { deleted: true });
  }),
);

// ── Reviews moderation ──────────────────────────────────
router.get(
  "/reviews",
  asyncHandler(async (req, res) => {
    const status = (req.query as { status?: string }).status;
    const reviews = await prisma.review.findMany({
      where: status ? { status: status as "PENDING" | "APPROVED" | "HIDDEN" } : {},
      include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    ok(res, reviews.map((r) => ({ id: r.id, product: r.product.name, slug: r.product.slug, author: r.user.name, rating: r.rating, title: r.title, body: r.body, status: r.status, createdAt: r.createdAt.toISOString() })));
  }),
);

router.patch(
  "/reviews/:id",
  canModerate,
  validate(idParam, "params"),
  validate(moderateReviewInput),
  asyncHandler(async (req, res) => {
    const { status } = req.body as z.infer<typeof moderateReviewInput>;
    const review = await prisma.review.update({ where: { id: req.params.id }, data: { status } });
    // Recompute the product's rating aggregate from approved reviews.
    const agg = await prisma.review.aggregate({ where: { productId: review.productId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: review.productId }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
    ok(res, { id: review.id, status: review.status });
  }),
);

export default router;

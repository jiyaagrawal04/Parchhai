import { Router } from "express";
import { createReviewInput } from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// POST /reviews — create a (moderated) review. Requires the user to have purchased the product.
router.post(
  "/",
  validate(createReviewInput),
  asyncHandler(async (req, res) => {
    const { productId, rating, title, body } = req.body as import("@parchhai/types").CreateReviewInput;
    const userId = req.user!.sub;

    const purchased = await prisma.orderItem.findFirst({
      where: { order: { userId, paymentStatus: "PAID" }, variant: { productId } },
    });
    if (!purchased) throw ApiError.forbidden("You can only review products you've purchased");

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId, userId } },
      create: { productId, userId, rating, title, body, status: "PENDING" },
      update: { rating, title, body, status: "PENDING" },
    });
    ok(res, { id: review.id, status: review.status }, 201);
  }),
);

export default router;

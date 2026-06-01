import { Router } from "express";
import { wishlistToggleInput } from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const getWishlist = async (userId: string) => {
  return (
    (await prisma.wishlist.findUnique({ where: { userId } })) ??
    (await prisma.wishlist.create({ data: { userId } }))
  );
};

const loadItems = async (userId: string) => {
  const wishlist = await getWishlist(userId);
  const items = await prisma.wishlistItem.findMany({
    where: { wishlistId: wishlist.id },
    include: {
      variant: { include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return items.map((it) => ({
    id: it.id,
    variantId: it.variantId,
    productId: it.variant.productId,
    productName: it.variant.product.name,
    slug: it.variant.product.slug,
    image: it.variant.product.images[0]?.url ?? null,
    price: it.variant.price,
    size: it.variant.size,
    color: it.variant.color,
  }));
};

// GET /wishlist
router.get("/", asyncHandler(async (req, res) => ok(res, await loadItems(req.user!.sub))));

// POST /wishlist/toggle
router.post(
  "/toggle",
  validate(wishlistToggleInput),
  asyncHandler(async (req, res) => {
    const { variantId } = req.body as import("@parchhai/types").WishlistToggleInput;
    const wishlist = await getWishlist(req.user!.sub);
    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
    });
    if (existing) await prisma.wishlistItem.delete({ where: { id: existing.id } });
    else await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, variantId } });
    ok(res, { items: await loadItems(req.user!.sub), added: !existing });
  }),
);

export default router;

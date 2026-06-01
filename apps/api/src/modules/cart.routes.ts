import { Router } from "express";
import type { Request } from "express";
import { addToCartInput, idParam, updateCartItemInput } from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import { optionalAuth } from "../middleware/auth.js";
import { cartItemInclude, toCartDTO } from "../services/mappers.js";

const router = Router();

/** Resolve (or create) the active cart for a user or guest session. */
const resolveCart = async (req: Request) => {
  const userId = req.user?.sub ?? null;
  const sessionId = (req.headers["x-cart-session"] as string | undefined) ?? null;

  if (userId) {
    const existing = await prisma.cart.findFirst({ where: { userId, status: "active" } });
    if (existing) return existing;
    // Adopt a guest cart on login if a session id was carried over.
    if (sessionId) {
      const guest = await prisma.cart.findFirst({ where: { sessionId, status: "active" } });
      if (guest) return prisma.cart.update({ where: { id: guest.id }, data: { userId, sessionId: null } });
    }
    return prisma.cart.create({ data: { userId, status: "active" } });
  }

  if (!sessionId) throw ApiError.badRequest("Missing X-Cart-Session header for guest cart");
  const existing = await prisma.cart.findFirst({ where: { sessionId, status: "active" } });
  return existing ?? prisma.cart.create({ data: { sessionId, status: "active" } });
};

const loadCartDTO = async (cartId: string) => {
  const cart = await prisma.cart.findUniqueOrThrow({ where: { id: cartId }, include: cartItemInclude });
  return toCartDTO(cart);
};

router.use(optionalAuth);

// GET /cart
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const cart = await resolveCart(req);
    ok(res, await loadCartDTO(cart.id));
  }),
);

// POST /cart/items
router.post(
  "/items",
  validate(addToCartInput),
  asyncHandler(async (req, res) => {
    const { variantId, qty } = req.body as import("@parchhai/types").AddToCartInput;
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw ApiError.notFound("Variant not found");
    const cart = await resolveCart(req);

    const existing = await prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId } } });
    const nextQty = (existing?.qty ?? 0) + qty;
    if (nextQty > variant.stock) throw ApiError.unprocessable(`Only ${variant.stock} left in stock`);

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      create: { cartId: cart.id, variantId, qty },
      update: { qty: nextQty },
    });
    ok(res, await loadCartDTO(cart.id));
  }),
);

// PATCH /cart/items/:id
router.patch(
  "/items/:id",
  validate(idParam, "params"),
  validate(updateCartItemInput),
  asyncHandler(async (req, res) => {
    const { qty } = req.body as import("@parchhai/types").UpdateCartItemInput;
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.id }, include: { variant: true } });
    if (!item) throw ApiError.notFound("Cart item not found");
    if (qty === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      if (qty > item.variant.stock) throw ApiError.unprocessable(`Only ${item.variant.stock} left in stock`);
      await prisma.cartItem.update({ where: { id: item.id }, data: { qty } });
    }
    ok(res, await loadCartDTO(item.cartId));
  }),
);

// DELETE /cart/items/:id
router.delete(
  "/items/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const item = await prisma.cartItem.findUnique({ where: { id: req.params.id } });
    if (!item) throw ApiError.notFound("Cart item not found");
    await prisma.cartItem.delete({ where: { id: item.id } });
    ok(res, await loadCartDTO(item.cartId));
  }),
);

export default router;
export { resolveCart };

import { Router } from "express";
import { Prisma } from "@parchhai/db";
import {
  applyCouponInput,
  createOrderInput,
  createReturnInput,
  idParam,
  verifyPaymentInput,
  type CouponPreview,
  type PaymentInitDTO,
} from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { orderInclude, toOrderDTO } from "../services/mappers.js";
import { computePricing, validateCoupon, type PricingItem } from "../services/pricing.js";
import { paymentProvider } from "../services/payment.js";
import { notify } from "../services/notify.js";

const router = Router();
router.use(requireAuth);

const activeCartInclude = {
  items: {
    include: { variant: { include: { product: { include: { craft: { select: { slug: true } } } } } } },
  },
} satisfies Prisma.CartInclude;

const loadCart = async (userId: string) =>
  prisma.cart.findFirst({ where: { userId, status: "active" }, include: activeCartInclude });

const toPricingItems = (
  cart: Prisma.CartGetPayload<{ include: typeof activeCartInclude }>,
): PricingItem[] =>
  cart.items.map((it) => ({
    productId: it.variant.productId,
    craftSlug: it.variant.product.craft?.slug ?? null,
    unitPrice: it.variant.price,
    qty: it.qty,
  }));

const getCoupon = async (code: string | undefined) =>
  code ? prisma.coupon.findUnique({ where: { code: code.toUpperCase() } }) : null;

// POST /orders/coupon/preview
router.post(
  "/coupon/preview",
  validate(applyCouponInput),
  asyncHandler(async (req, res) => {
    const { code } = req.body as import("@parchhai/types").ApplyCouponInput;
    const cart = await loadCart(req.user!.sub);
    if (!cart || cart.items.length === 0) throw ApiError.badRequest("Your cart is empty");

    const items = toPricingItems(cart);
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const coupon = await getCoupon(code);
    const redemptions = coupon
      ? await prisma.couponRedemption.count({ where: { couponCode: coupon.code, userId: req.user!.sub } })
      : 0;
    const check = validateCoupon(coupon, subtotal, items, redemptions);
    const pricing = computePricing(items, coupon, check.ok);
    const preview: CouponPreview = {
      code: code.toUpperCase(),
      valid: check.ok,
      discount: pricing.discount,
      freeShipping: pricing.freeShipping,
      message: check.message,
    };
    ok(res, preview);
  }),
);

/** Decrement stock, log movements, convert cart, record coupon use, notify. Idempotent-ish. */
const confirmOrder = async (orderId: string) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true } } },
  });
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.qty } } });
      await tx.inventoryMovement.create({
        data: { variantId: item.variantId, change: -item.qty, reason: "SALE", note: order.orderNumber, createdBy: "system" },
      });
    }
    await tx.cart.updateMany({ where: { userId: order.userId, status: "active" }, data: { status: "converted" } });
    if (order.couponCode) {
      await tx.coupon.update({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } }).catch(() => undefined);
      await tx.couponRedemption.create({ data: { couponCode: order.couponCode, userId: order.userId, orderId: order.id } }).catch(() => undefined);
    }
  });
  await notify.orderPlaced(order.user.email, order.orderNumber);
};

// POST /orders
router.post(
  "/",
  validate(createOrderInput),
  asyncHandler(async (req, res) => {
    const input = req.body as import("@parchhai/types").CreateOrderInput;
    const userId = req.user!.sub;
    const cart = await loadCart(userId);
    if (!cart || cart.items.length === 0) throw ApiError.badRequest("Your cart is empty");

    // Stock guard
    for (const it of cart.items) {
      if (it.qty > it.variant.stock)
        throw ApiError.unprocessable(`${it.variant.product.name} (${it.variant.size}/${it.variant.color}) — only ${it.variant.stock} left`);
    }

    // Resolve shipping address → snapshot
    let snapshot: Prisma.JsonObject;
    if (input.addressId) {
      const addr = await prisma.address.findFirst({ where: { id: input.addressId, userId } });
      if (!addr) throw ApiError.badRequest("Address not found");
      snapshot = { name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, pincode: addr.pincode };
    } else if (input.address) {
      const a = input.address;
      const created = await prisma.address.create({ data: { ...a, userId } });
      snapshot = { name: created.name, phone: created.phone, line1: created.line1, line2: created.line2, city: created.city, state: created.state, pincode: created.pincode };
    } else {
      throw ApiError.badRequest("A shipping address is required");
    }

    const items = toPricingItems(cart);
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const coupon = await getCoupon(input.couponCode);
    const redemptions = coupon
      ? await prisma.couponRedemption.count({ where: { couponCode: coupon.code, userId } })
      : 0;
    const couponCheck = validateCoupon(coupon, subtotal, items, redemptions);
    if (input.couponCode && !couponCheck.ok) throw ApiError.unprocessable(couponCheck.message ?? "Coupon invalid");
    const pricing = computePricing(items, coupon, couponCheck.ok);

    const year = new Date().getFullYear();
    const orderCount = await prisma.order.count();
    const orderNumber = `PRC-${year}-${String(orderCount + 1).padStart(4, "0")}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: "PLACED",
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total,
        couponCode: couponCheck.ok ? coupon?.code : null,
        paymentMethod: input.paymentMethod,
        paymentStatus: "PENDING",
        shippingAddress: snapshot,
        items: {
          create: cart.items.map((it) => ({
            variantId: it.variantId,
            productName: it.variant.product.name,
            sku: it.variant.sku,
            size: it.variant.size,
            color: it.variant.color,
            qty: it.qty,
            unitPrice: it.variant.price,
          })),
        },
        timeline: { create: { status: "PLACED", note: "Order placed" } },
        payment: { create: { provider: paymentProvider.name, amount: pricing.total, status: "PENDING" } },
      },
      include: orderInclude,
    });

    if (input.paymentMethod === "COD") {
      await confirmOrder(order.id);
      const fresh = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
      return ok(res, { order: toOrderDTO(fresh), payment: null }, 201);
    }

    // Razorpay (or stub): create a provider order and hand init data to the client.
    const { providerOrderId } = await paymentProvider.createOrder(pricing.total, orderNumber);
    await prisma.payment.update({ where: { orderId: order.id }, data: { providerOrderId } });
    const payment: PaymentInitDTO = {
      orderId: order.id,
      provider: paymentProvider.name,
      razorpayOrderId: providerOrderId,
      razorpayKeyId: paymentProvider.keyId,
      amount: pricing.total,
      currency: "INR",
    };
    ok(res, { order: toOrderDTO(order), payment }, 201);
  }),
);

// POST /orders/payment/verify
router.post(
  "/payment/verify",
  validate(verifyPaymentInput),
  asyncHandler(async (req, res) => {
    const input = req.body as import("@parchhai/types").VerifyPaymentInput;
    const order = await prisma.order.findFirst({ where: { id: input.orderId, userId: req.user!.sub }, include: { payment: true } });
    if (!order) throw ApiError.notFound("Order not found");
    if (order.paymentStatus === "PAID") return ok(res, { verified: true });

    const valid = paymentProvider.verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature);
    if (!valid) {
      await prisma.payment.update({ where: { orderId: order.id }, data: { status: "FAILED" } });
      throw ApiError.badRequest("Payment verification failed");
    }
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { status: "PAID", providerPaymentId: input.razorpayPaymentId, raw: { ...input } },
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
    await confirmOrder(order.id);
    ok(res, { verified: true });
  }),
);

// GET /orders
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({ where: { userId: req.user!.sub }, include: orderInclude, orderBy: { placedAt: "desc" } });
    ok(res, orders.map(toOrderDTO));
  }),
);

// GET /orders/:id
router.get(
  "/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.sub }, include: orderInclude });
    if (!order) throw ApiError.notFound("Order not found");
    ok(res, toOrderDTO(order));
  }),
);

// POST /orders/:id/cancel
router.post(
  "/:id/cancel",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.sub }, include: { items: true } });
    if (!order) throw ApiError.notFound("Order not found");
    if (!["PLACED", "PACKED"].includes(order.status)) throw ApiError.unprocessable("This order can no longer be cancelled");

    await prisma.$transaction(async (tx) => {
      // Restock if it had already been confirmed (stock decremented).
      if (order.paymentStatus === "PAID" || order.paymentMethod === "COD") {
        for (const item of order.items) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.qty } } });
          await tx.inventoryMovement.create({ data: { variantId: item.variantId, change: item.qty, reason: "RETURN", note: `Cancel ${order.orderNumber}`, createdBy: "customer" } });
        }
      }
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      await tx.orderTimeline.create({ data: { orderId: order.id, status: "CANCELLED", note: "Cancelled by customer" } });
    });
    const fresh = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    ok(res, toOrderDTO(fresh));
  }),
);

// POST /orders/:id/returns
router.post(
  "/:id/returns",
  validate(idParam, "params"),
  validate(createReturnInput),
  asyncHandler(async (req, res) => {
    const input = req.body as import("@parchhai/types").CreateReturnInput;
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user!.sub } });
    if (!order) throw ApiError.notFound("Order not found");
    if (order.status !== "DELIVERED") throw ApiError.unprocessable("Only delivered orders can be returned");
    const ret = await prisma.returnRequest.create({
      data: { orderId: order.id, items: input.items, reason: input.reason, pickupSlot: input.pickupSlot, status: "REQUESTED" },
    });
    ok(res, { id: ret.id, status: ret.status }, 201);
  }),
);

export default router;
export { confirmOrder };

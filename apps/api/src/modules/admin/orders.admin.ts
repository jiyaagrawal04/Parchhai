import { Router } from "express";
import { Prisma } from "@parchhai/db";
import { adminOrderListQuery, idParam, returnDecisionInput, updateOrderStatusInput } from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { ApiError, asyncHandler } from "../../lib/errors.js";
import { ok, okList, paginate } from "../../lib/response.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";
import { orderInclude, toOrderDTO } from "../../services/mappers.js";
import { recordAudit } from "../../services/audit.js";
import { notify } from "../../services/notify.js";

const router = Router();
const canWrite = requireRole("OWNER", "ADMIN", "ORDER_OPS");

// GET /admin/orders
router.get(
  "/",
  validate(adminOrderListQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as import("@parchhai/types").PaginationQuery & { q?: string; status?: string; from?: string; to?: string };
    const where: Prisma.OrderWhereInput = {};
    if (q.status) where.status = q.status as Prisma.EnumOrderStatusFilter["equals"];
    if (q.q) where.OR = [{ orderNumber: { contains: q.q, mode: "insensitive" } }, { user: { name: { contains: q.q, mode: "insensitive" } } }];
    if (q.from || q.to) where.placedAt = { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) };
    const [total, rows] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } },
        orderBy: { placedAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    okList(
      res,
      rows.map((o) => ({ id: o.id, orderNumber: o.orderNumber, customer: o.user.name, email: o.user.email, status: o.status, paymentStatus: o.paymentStatus, total: o.total, items: o._count.items, placedAt: o.placedAt.toISOString() })),
      paginate(q.page, q.pageSize, total),
    );
  }),
);

// GET /admin/orders/:id
router.get(
  "/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { ...orderInclude, user: { select: { name: true, email: true, phone: true } }, payment: true } });
    if (!order) throw ApiError.notFound("Order not found");
    ok(res, { ...toOrderDTO(order), customer: order.user, payment: order.payment });
  }),
);

// PATCH /admin/orders/:id/status
router.patch(
  "/:id/status",
  canWrite,
  validate(idParam, "params"),
  validate(updateOrderStatusInput),
  asyncHandler(async (req, res) => {
    const { status, note } = req.body as import("@parchhai/types").UpdateOrderStatusInput;
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { user: { select: { email: true } } } });
    if (!order) throw ApiError.notFound("Order not found");
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status } }),
      prisma.orderTimeline.create({ data: { orderId: order.id, status, note } }),
    ]);
    await recordAudit(req.user?.sub, "order.status", `Order:${order.id}`, { status: order.status }, { status });
    await notify.orderStatus(order.user.email, order.orderNumber, status);
    const fresh = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    ok(res, toOrderDTO(fresh));
  }),
);

// POST /admin/orders/:id/refund
router.post(
  "/:id/refund",
  canWrite,
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw ApiError.notFound("Order not found");
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED" } }),
      prisma.payment.updateMany({ where: { orderId: order.id }, data: { status: "REFUNDED" } }),
      prisma.orderTimeline.create({ data: { orderId: order.id, status: order.status, note: "Refund processed" } }),
    ]);
    await recordAudit(req.user?.sub, "order.refund", `Order:${order.id}`);
    ok(res, { refunded: true });
  }),
);

// GET /admin/orders/:id/invoice — minimal invoice payload (PDF generation can be layered on the client/print view)
router.get(
  "/:id/invoice",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { ...orderInclude, user: { select: { name: true, email: true } } } });
    if (!order) throw ApiError.notFound("Order not found");
    ok(res, {
      invoiceNumber: `INV-${order.orderNumber}`,
      order: toOrderDTO(order),
      customer: order.user,
      issuedAt: new Date().toISOString(),
      seller: { name: "Parchhai", gstin: "—" },
    });
  }),
);

// ── Returns queue ───────────────────────────────────────
router.get(
  "/returns/queue",
  asyncHandler(async (req, res) => {
    const status = (req.query as { status?: string }).status as Prisma.EnumReturnStatusFilter["equals"] | undefined;
    const rows = await prisma.returnRequest.findMany({
      where: status ? { status } : {},
      include: { order: { select: { orderNumber: true, user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    ok(res, rows.map((r) => ({ id: r.id, orderNumber: r.order.orderNumber, customer: r.order.user.name, reason: r.reason, status: r.status, refundStatus: r.refundStatus, createdAt: r.createdAt.toISOString() })));
  }),
);

// PATCH /admin/orders/returns/:id
router.patch(
  "/returns/:id",
  canWrite,
  validate(idParam, "params"),
  validate(returnDecisionInput),
  asyncHandler(async (req, res) => {
    const { status, restock, note } = req.body as import("zod").infer<typeof returnDecisionInput>;
    const ret = await prisma.returnRequest.findUnique({ where: { id: req.params.id }, include: { order: { include: { items: true } } } });
    if (!ret) throw ApiError.notFound("Return not found");

    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.update({
        where: { id: ret.id },
        data: { status, restock: restock ?? ret.restock, refundStatus: status === "REFUNDED" ? "COMPLETED" : ret.refundStatus },
      });
      if (status === "REFUNDED") {
        await tx.order.update({ where: { id: ret.orderId }, data: { status: "RETURNED", paymentStatus: "REFUNDED" } });
        await tx.orderTimeline.create({ data: { orderId: ret.orderId, status: "RETURNED", note: note ?? "Return refunded" } });
        if (restock ?? ret.restock) {
          const items = ret.items as Array<{ orderItemId: string; qty: number }>;
          for (const line of items) {
            const oi = ret.order.items.find((i) => i.id === line.orderItemId);
            if (oi) {
              await tx.productVariant.update({ where: { id: oi.variantId }, data: { stock: { increment: line.qty } } });
              await tx.inventoryMovement.create({ data: { variantId: oi.variantId, change: line.qty, reason: "RETURN", note: `Return ${ret.order.orderNumber}`, createdBy: req.user?.sub } });
            }
          }
        }
      }
    });
    await recordAudit(req.user?.sub, "return.decision", `Return:${ret.id}`, { status: ret.status }, { status });
    ok(res, { updated: true });
  }),
);

export default router;

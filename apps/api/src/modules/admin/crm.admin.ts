import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@parchhai/db";
import { idParam, paginationQuery } from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { ApiError, asyncHandler } from "../../lib/errors.js";
import { ok, okList, paginate } from "../../lib/response.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";
import { recordAudit } from "../../services/audit.js";

const router = Router();
const canWrite = requireRole("OWNER", "ADMIN", "SUPPORT");

// GET /admin/customers
router.get(
  "/",
  validate(paginationQuery.extend({ q: z.string().optional() }), "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as { page: number; pageSize: number; q?: string };
    const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
    if (q.q) where.OR = [{ name: { contains: q.q, mode: "insensitive" } }, { email: { contains: q.q, mode: "insensitive" } }, { phone: { contains: q.q } }];
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    okList(
      res,
      rows.map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, status: u.status, orders: u._count.orders, joinedAt: u.createdAt.toISOString() })),
      paginate(q.page, q.pageSize, total),
    );
  }),
);

// GET /admin/customers/:id
router.get(
  "/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true,
        orders: { select: { id: true, orderNumber: true, status: true, total: true, placedAt: true }, orderBy: { placedAt: "desc" } },
      },
    });
    if (!user) throw ApiError.notFound("Customer not found");
    const lifetimeValue = await prisma.order.aggregate({ where: { userId: user.id, paymentStatus: "PAID" }, _sum: { total: true } });
    ok(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      notes: user.notes,
      joinedAt: user.createdAt.toISOString(),
      lifetimeValue: lifetimeValue._sum.total ?? 0,
      addresses: user.addresses,
      orders: user.orders.map((o) => ({ ...o, placedAt: o.placedAt.toISOString() })),
    });
  }),
);

// PATCH /admin/customers/:id — notes / block
router.patch(
  "/:id",
  canWrite,
  validate(idParam, "params"),
  validate(z.object({ notes: z.string().optional(), status: z.enum(["ACTIVE", "BLOCKED"]).optional() })),
  asyncHandler(async (req, res) => {
    const data = req.body as { notes?: string; status?: "ACTIVE" | "BLOCKED" };
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    await recordAudit(req.user?.sub, "customer.update", `User:${user.id}`, null, data);
    ok(res, { id: user.id, status: user.status, notes: user.notes });
  }),
);

export default router;

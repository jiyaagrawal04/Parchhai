import { Router } from "express";
import type { Response } from "express";
import { reportQuery, type DashboardSummary } from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../lib/errors.js";
import { ok } from "../../lib/response.js";
import { validate } from "../../middleware/validate.js";

const router = Router();

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);

const sendCsv = (res: Response, filename: string, rows: Record<string, unknown>[]) => {
  if (rows.length === 0) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send("");
  }
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};

// GET /admin/reports/dashboard
router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const today = startOfToday();
    const d30 = daysAgo(30);
    const paid = { paymentStatus: "PAID" as const };

    const [revToday, rev30, ordersToday, orders30, pendingOrders, lowStock, pendingReturns, pendingReviews, paidOrders30, topItems] =
      await Promise.all([
        prisma.order.aggregate({ where: { ...paid, placedAt: { gte: today } }, _sum: { total: true } }),
        prisma.order.aggregate({ where: { ...paid, placedAt: { gte: d30 } }, _sum: { total: true } }),
        prisma.order.count({ where: { placedAt: { gte: today } } }),
        prisma.order.count({ where: { placedAt: { gte: d30 } } }),
        prisma.order.count({ where: { status: { in: ["PLACED", "PACKED"] } } }),
        prisma.productVariant.count({ where: { stock: { lte: prisma.productVariant.fields.lowStockThreshold } } }),
        prisma.returnRequest.count({ where: { status: { in: ["REQUESTED", "APPROVED", "PICKED"] } } }),
        prisma.review.count({ where: { status: "PENDING" } }),
        prisma.order.findMany({ where: { ...paid, placedAt: { gte: d30 } }, select: { total: true, placedAt: true } }),
        prisma.orderItem.groupBy({ by: ["productName"], _sum: { qty: true, unitPrice: true }, orderBy: { _sum: { qty: "desc" } }, take: 5 }),
      ]);

    // Revenue series (last 14 days), bucketed in JS.
    const series: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) series[daysAgo(i).toISOString().slice(0, 10)] = 0;
    for (const o of paidOrders30) {
      const key = o.placedAt.toISOString().slice(0, 10);
      if (key in series) series[key]! += o.total;
    }

    const summary: DashboardSummary = {
      revenueToday: revToday._sum.total ?? 0,
      revenue30d: rev30._sum.total ?? 0,
      ordersToday,
      orders30d: orders30,
      pendingOrders,
      lowStockCount: lowStock,
      pendingReturns,
      pendingReviews,
      topProducts: topItems.map((t) => ({ name: t.productName, units: t._sum.qty ?? 0, revenue: (t._sum.unitPrice ?? 0) })),
      revenueSeries: Object.entries(series).map(([date, revenue]) => ({ date, revenue })),
    };
    ok(res, summary);
  }),
);

// GET /admin/reports/sales?from&to&format
router.get(
  "/sales",
  validate(reportQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as import("@parchhai/types").ReportQuery;
    const from = q.from ? new Date(q.from) : daysAgo(30);
    const to = q.to ? new Date(q.to) : new Date();
    const orders = await prisma.order.findMany({
      where: { placedAt: { gte: from, lte: to } },
      select: { total: true, discount: true, placedAt: true, paymentStatus: true, items: { select: { qty: true } } },
    });
    const buckets: Record<string, { orders: number; units: number; gross: number; discount: number; net: number }> = {};
    for (const o of orders) {
      const key = o.placedAt.toISOString().slice(0, 10);
      buckets[key] ??= { orders: 0, units: 0, gross: 0, discount: 0, net: 0 };
      const b = buckets[key]!;
      b.orders += 1;
      b.units += o.items.reduce((s, i) => s + i.qty, 0);
      b.gross += o.total + o.discount;
      b.discount += o.discount;
      if (o.paymentStatus === "PAID") b.net += o.total;
    }
    const rows = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b)).map(([date, b]) => ({ date, ...b }));
    if (q.format === "csv") return sendCsv(res, "sales-report.csv", rows);
    ok(res, rows);
  }),
);

// GET /admin/reports/best-sellers
router.get(
  "/best-sellers",
  validate(reportQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as import("@parchhai/types").ReportQuery;
    const grouped = await prisma.orderItem.groupBy({ by: ["productName"], _sum: { qty: true, unitPrice: true }, orderBy: { _sum: { qty: "desc" } }, take: 20 });
    const rows = grouped.map((g) => ({ product: g.productName, units: g._sum.qty ?? 0, revenue: g._sum.unitPrice ?? 0 }));
    if (q.format === "csv") return sendCsv(res, "best-sellers.csv", rows);
    ok(res, rows);
  }),
);

// GET /admin/reports/inventory
router.get(
  "/inventory",
  validate(reportQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as import("@parchhai/types").ReportQuery;
    const variants = await prisma.productVariant.findMany({ include: { product: { select: { name: true } } }, orderBy: { stock: "asc" } });
    const rows = variants.map((v) => ({ sku: v.sku, product: v.product.name, size: v.size, color: v.color, stock: v.stock, threshold: v.lowStockThreshold, low: v.stock <= v.lowStockThreshold }));
    if (q.format === "csv") return sendCsv(res, "inventory-report.csv", rows);
    ok(res, rows);
  }),
);

// GET /admin/reports/gst — simplified GST summary (5% inclusive)
router.get(
  "/gst",
  validate(reportQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as unknown as import("@parchhai/types").ReportQuery;
    const from = q.from ? new Date(q.from) : daysAgo(30);
    const to = q.to ? new Date(q.to) : new Date();
    const agg = await prisma.order.aggregate({ where: { paymentStatus: "PAID", placedAt: { gte: from, lte: to } }, _sum: { total: true } });
    const gross = agg._sum.total ?? 0;
    const taxable = Math.round(gross / 1.05);
    const gst = gross - taxable;
    const rows = [{ period: `${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`, gross, taxable, gst, rate: "5%" }];
    if (q.format === "csv") return sendCsv(res, "gst-report.csv", rows);
    ok(res, rows[0]);
  }),
);

export default router;

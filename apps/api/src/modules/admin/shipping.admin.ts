import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors.js";
import { ok } from "../../lib/response.js";
import { prisma } from "../../lib/prisma.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";

const router = Router();
const canWrite = requireRole("OWNER", "ADMIN", "ORDER_OPS");

router.get(
  "/zones",
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.shippingZone.findMany({ include: { rates: true } }));
  }),
);

const rateInput = z.object({
  zoneId: z.string(),
  label: z.string(),
  minSubtotal: z.number().int().default(0),
  price: z.number().int(),
  freeAbove: z.number().int().optional().nullable(),
  etaDays: z.number().int().default(5),
});

router.post(
  "/rates",
  canWrite,
  validate(rateInput),
  asyncHandler(async (req, res) => {
    const rate = await prisma.shippingRate.create({ data: req.body as z.infer<typeof rateInput> });
    ok(res, rate, 201);
  }),
);

const pincodeInput = z.object({
  pincode: z.string().regex(/^\d{6}$/),
  city: z.string().optional(),
  state: z.string().optional(),
  serviceable: z.boolean().default(true),
  codAvailable: z.boolean().default(true),
  etaDays: z.number().int().default(5),
});

router.get(
  "/pincodes",
  asyncHandler(async (_req, res) => {
    ok(res, await prisma.pincodeServiceability.findMany({ orderBy: { pincode: "asc" } }));
  }),
);

router.post(
  "/pincodes",
  canWrite,
  validate(pincodeInput),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof pincodeInput>;
    const row = await prisma.pincodeServiceability.upsert({ where: { pincode: input.pincode }, create: input, update: input });
    ok(res, row, 201);
  }),
);

export default router;

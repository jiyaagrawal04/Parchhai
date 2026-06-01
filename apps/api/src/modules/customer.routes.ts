import { Router } from "express";
import { z } from "zod";
import { addressInput, idParam } from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { ok } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { toAddressDTO } from "../services/mappers.js";

const router = Router();
router.use(requireAuth);

const profileInput = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(8).optional(),
});

// GET /me/profile
router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    ok(res, { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  }),
);

// PATCH /me/profile
router.patch(
  "/profile",
  validate(profileInput),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof profileInput>;
    const user = await prisma.user.update({ where: { id: req.user!.sub }, data });
    ok(res, { id: user.id, name: user.name, email: user.email, phone: user.phone });
  }),
);

// GET /me/addresses
router.get(
  "/addresses",
  asyncHandler(async (req, res) => {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.sub }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
    ok(res, addresses.map(toAddressDTO));
  }),
);

// POST /me/addresses
router.post(
  "/addresses",
  validate(addressInput),
  asyncHandler(async (req, res) => {
    const data = req.body as import("@parchhai/types").AddressInput;
    const userId = req.user!.sub;
    if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    const created = await prisma.address.create({ data: { ...data, userId } });
    ok(res, toAddressDTO(created), 201);
  }),
);

// PUT /me/addresses/:id
router.put(
  "/addresses/:id",
  validate(idParam, "params"),
  validate(addressInput),
  asyncHandler(async (req, res) => {
    const data = req.body as import("@parchhai/types").AddressInput;
    const userId = req.user!.sub;
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
    if (!existing) throw ApiError.notFound("Address not found");
    if (data.isDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    const updated = await prisma.address.update({ where: { id: existing.id }, data });
    ok(res, toAddressDTO(updated));
  }),
);

// DELETE /me/addresses/:id
router.delete(
  "/addresses/:id",
  validate(idParam, "params"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.sub } });
    if (!existing) throw ApiError.notFound("Address not found");
    await prisma.address.delete({ where: { id: existing.id } });
    ok(res, { deleted: true });
  }),
);

export default router;

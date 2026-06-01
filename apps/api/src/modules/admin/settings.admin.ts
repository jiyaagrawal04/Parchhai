import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { idParam, staffInput, STAFF_ROLES, Role } from "@parchhai/types";
import { prisma } from "../../lib/prisma.js";
import { ApiError, asyncHandler } from "../../lib/errors.js";
import { ok } from "../../lib/response.js";
import { validate } from "../../middleware/validate.js";
import { requireRole } from "../../middleware/auth.js";
import { recordAudit } from "../../services/audit.js";
import { uploader } from "../../services/upload.js";
import { notify } from "../../services/notify.js";

const router = Router();
const ownerOnly = requireRole("OWNER", "ADMIN");

// ── Settings ────────────────────────────────────────────
router.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const settings = await prisma.setting.findMany();
    ok(res, Object.fromEntries(settings.map((s) => [s.key, s.value])));
  }),
);

router.put(
  "/settings/:id",
  ownerOnly,
  validate(idParam, "params"),
  validate(z.object({ value: z.any() })),
  asyncHandler(async (req, res) => {
    const { value } = req.body as { value: unknown };
    const setting = await prisma.setting.upsert({ where: { key: req.params.id }, create: { key: req.params.id, value: value as never }, update: { value: value as never } });
    await recordAudit(req.user?.sub, "setting.update", `Setting:${setting.key}`);
    ok(res, { key: setting.key, value: setting.value });
  }),
);

// ── Staff / RBAC ────────────────────────────────────────
router.get(
  "/staff",
  asyncHandler(async (_req, res) => {
    const staff = await prisma.user.findMany({ where: { role: { in: STAFF_ROLES } }, select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }, orderBy: { createdAt: "asc" } });
    ok(res, staff.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
  }),
);

router.post(
  "/staff",
  ownerOnly,
  validate(staffInput),
  asyncHandler(async (req, res) => {
    const input = req.body as import("@parchhai/types").StaffInput;
    if (input.role === "CUSTOMER") throw ApiError.badRequest("Pick a staff role");
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw ApiError.conflict("A user with that email already exists");
    // Invited staff get a temporary password they reset on first login.
    const tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
    const user = await prisma.user.create({ data: { name: input.name, email: input.email, role: input.role, status: "INVITED", passwordHash: await bcrypt.hash(tempPassword, 10) } });
    await recordAudit(req.user?.sub, "staff.invite", `User:${user.id}`, null, { role: input.role });
    await notify.send("email", input.email, "staff_invite", { tempPassword });
    ok(res, { id: user.id, name: user.name, email: user.email, role: user.role, tempPassword }, 201);
  }),
);

router.patch(
  "/staff/:id",
  ownerOnly,
  validate(idParam, "params"),
  validate(z.object({ role: Role.optional(), status: z.enum(["ACTIVE", "BLOCKED", "INVITED"]).optional() })),
  asyncHandler(async (req, res) => {
    const data = req.body as { role?: z.infer<typeof Role>; status?: "ACTIVE" | "BLOCKED" | "INVITED" };
    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    await recordAudit(req.user?.sub, "staff.update", `User:${user.id}`, null, data);
    ok(res, { id: user.id, role: user.role, status: user.status });
  }),
);

// ── Audit log ───────────────────────────────────────────
router.get(
  "/audit",
  asyncHandler(async (_req, res) => {
    const logs = await prisma.auditLog.findMany({ include: { actor: { select: { name: true } } }, orderBy: { at: "desc" }, take: 200 });
    ok(res, logs.map((l) => ({ id: l.id, actor: l.actor?.name ?? "system", action: l.action, entity: l.entity, before: l.before, after: l.after, at: l.at.toISOString() })));
  }),
);

// ── Uploads ─────────────────────────────────────────────
router.post(
  "/uploads/presign",
  validate(z.object({ filename: z.string().min(1), contentType: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const { filename, contentType } = req.body as { filename: string; contentType: string };
    ok(res, await uploader.presignUpload(filename, contentType));
  }),
);

// Stub PUT target so the stub uploader's signed URL resolves locally (no-op store).
router.put("/uploads/stub-put/:key", (_req, res) => res.status(200).json({ data: { stored: true } }));

export default router;

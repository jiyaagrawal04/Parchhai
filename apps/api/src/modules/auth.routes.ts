import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import {
  loginInput,
  otpSendInput,
  otpVerifyInput,
  refreshInput,
  signupInput,
  type AuthResponse,
  type PublicUser,
} from "@parchhai/types";
import { prisma } from "../lib/prisma.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { hashToken, newRefreshToken, refreshExpiry, signAccessToken } from "../lib/jwt.js";
import { ok } from "../lib/response.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { notify } from "../services/notify.js";

const router = Router();

type UserRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: PublicUser["role"];
  emailVerified: Date | null;
};

const toPublicUser = (u: UserRow): PublicUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  emailVerified: Boolean(u.emailVerified),
});

const issueTokens = async (user: UserRow): Promise<AuthResponse> => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const { token, hash } = newRefreshToken();
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt: refreshExpiry() },
  });
  return { accessToken, refreshToken: token, user: toPublicUser(user) };
};

// POST /auth/signup
router.post(
  "/signup",
  authLimiter,
  validate(signupInput),
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body as import("@parchhai/types").SignupInput;
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] } });
    if (existing) throw ApiError.conflict("An account with that email or phone already exists");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "CUSTOMER", wishlist: { create: {} } },
    });
    await notify.send("email", email, "welcome", { name });
    res.status(201).json({ data: await issueTokens(user) });
  }),
);

// POST /auth/login
router.post(
  "/login",
  authLimiter,
  validate(loginInput),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as import("@parchhai/types").LoginInput;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw ApiError.unauthorized("Invalid email or password");
    if (user.status === "BLOCKED") throw ApiError.forbidden("This account has been blocked");
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized("Invalid email or password");
    ok(res, await issueTokens(user));
  }),
);

// POST /auth/otp/send
router.post(
  "/otp/send",
  authLimiter,
  validate(otpSendInput),
  asyncHandler(async (req, res) => {
    const { phone } = req.body as import("@parchhai/types").OtpSendInput;
    const code = String(crypto.randomInt(100000, 999999));
    const codeHash = await bcrypt.hash(code, 8);
    await prisma.otpCode.create({
      data: {
        channel: "sms",
        target: phone,
        codeHash,
        purpose: "login",
        expiresAt: new Date(Date.now() + 5 * 60_000),
      },
    });
    await notify.sendOtp(phone, code);
    // In dev/stub mode we return the code so the flow is testable end-to-end.
    ok(res, { sent: true, devCode: process.env.NODE_ENV !== "production" ? code : undefined });
  }),
);

// POST /auth/otp/verify
router.post(
  "/otp/verify",
  authLimiter,
  validate(otpVerifyInput),
  asyncHandler(async (req, res) => {
    const { phone, code, name } = req.body as import("@parchhai/types").OtpVerifyInput;
    const otp = await prisma.otpCode.findFirst({
      where: { target: phone, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) throw ApiError.badRequest("No active code — request a new one");
    if (otp.attempts >= 5) throw ApiError.badRequest("Too many attempts — request a new code");
    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
      throw ApiError.badRequest("Incorrect code");
    }
    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: name ?? "Parchhai Customer", phone, role: "CUSTOMER", phoneVerified: new Date(), wishlist: { create: {} } },
      });
    }
    ok(res, await issueTokens(user));
  }),
);

// POST /auth/refresh
router.post(
  "/refresh",
  validate(refreshInput),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as import("@parchhai/types").RefreshInput;
    const hash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) throw ApiError.unauthorized("Session expired");
    // Rotate: revoke the old token, issue a fresh pair.
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    ok(res, await issueTokens(stored.user));
  }),
);

// POST /auth/logout
router.post(
  "/logout",
  validate(refreshInput),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as import("@parchhai/types").RefreshInput;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken) },
      data: { revokedAt: new Date() },
    });
    ok(res, { loggedOut: true });
  }),
);

// GET /auth/me
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) throw ApiError.unauthorized();
    ok(res, toPublicUser(user));
  }),
);

export default router;

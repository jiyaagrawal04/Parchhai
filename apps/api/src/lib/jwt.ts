import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { AccessTokenPayload } from "@parchhai/types";
import { env } from "../env.js";

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL } as jwt.SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

/** Refresh tokens are opaque random strings; only their hash is stored server-side. */
export const newRefreshToken = (): { token: string; hash: string } => {
  const token = crypto.randomBytes(48).toString("base64url");
  return { token, hash: hashToken(token) };
};

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export const refreshExpiry = (): Date => {
  // Parse "30d" / "15m" style TTLs.
  const ttl = env.JWT_REFRESH_TTL;
  const m = /^(\d+)([smhd])$/.exec(ttl);
  const now = Date.now();
  if (!m) return new Date(now + 30 * 864e5);
  const n = Number(m[1]);
  const unit = m[2];
  const mult = unit === "s" ? 1e3 : unit === "m" ? 6e4 : unit === "h" ? 36e5 : 864e5;
  return new Date(now + n * mult);
};

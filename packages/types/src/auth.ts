import { z } from "zod";
import { Role } from "./enums.js";

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number (E.164, e.g. +919812345678)");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);

export const signupInput = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: phoneSchema.optional(),
  password: passwordSchema,
});
export type SignupInput = z.infer<typeof signupInput>;

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginInput>;

export const otpSendInput = z.object({
  phone: phoneSchema,
  purpose: z.enum(["login", "verify"]).default("login"),
});
export type OtpSendInput = z.infer<typeof otpSendInput>;

export const otpVerifyInput = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
  name: z.string().min(2).max(80).optional(), // for first-time signup via OTP
});
export type OtpVerifyInput = z.infer<typeof otpVerifyInput>;

export const refreshInput = z.object({ refreshToken: z.string().min(10) });
export type RefreshInput = z.infer<typeof refreshInput>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const publicUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  role: Role,
  emailVerified: z.boolean(),
});
export type PublicUser = z.infer<typeof publicUser>;

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}

/** JWT access-token payload. */
export interface AccessTokenPayload {
  sub: string; // user id
  role: Role;
  email: string | null;
}

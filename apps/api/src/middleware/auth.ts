import type { NextFunction, Request, Response } from "express";
import type { Role } from "@parchhai/types";
import { ApiError } from "../lib/errors.js";
import { verifyAccessToken } from "../lib/jwt.js";

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
};

/** Populates req.user if a valid token is present; never throws. */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
};

/** Requires a valid access token. */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
};

/** Requires the authenticated user to hold one of the given roles. */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };

/** Any staff role (everything except plain CUSTOMER). */
export const requireStaff = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) throw ApiError.unauthorized();
  if (req.user.role === "CUSTOMER") throw ApiError.forbidden("Staff access only");
  next();
};

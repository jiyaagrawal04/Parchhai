import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(msg: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", msg, details);
  }
  static unauthorized(msg = "Authentication required") {
    return new ApiError(401, "UNAUTHORIZED", msg);
  }
  static forbidden(msg = "You do not have permission to do that") {
    return new ApiError(403, "FORBIDDEN", msg);
  }
  static notFound(msg = "Not found") {
    return new ApiError(404, "NOT_FOUND", msg);
  }
  static conflict(msg: string) {
    return new ApiError(409, "CONFLICT", msg);
  }
  static unprocessable(msg: string, details?: unknown) {
    return new ApiError(422, "UNPROCESSABLE", msg, details);
  }
}

/** Wrap async route handlers so thrown/rejected errors reach the error middleware. */
export const asyncHandler =
  <T extends Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };

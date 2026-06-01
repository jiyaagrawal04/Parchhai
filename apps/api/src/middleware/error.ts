import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: { code: "BAD_REQUEST", message: "Validation failed", details: err.flatten() } });
  }
  // Prisma unique-constraint violation
  const code = (err as { code?: string })?.code;
  if (code === "P2002") {
    return res.status(409).json({ error: { code: "CONFLICT", message: "A record with that value already exists" } });
  }
  if (code === "P2025") {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Record not found" } });
  }

  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
};

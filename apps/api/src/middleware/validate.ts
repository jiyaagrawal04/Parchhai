import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny, type infer as ZInfer } from "zod";
import { ApiError } from "../lib/errors.js";

type Source = "body" | "query" | "params";

/** Validate a request part against a Zod schema and replace it with the parsed value. */
export const validate =
  (schema: ZodTypeAny, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // query/params are read-only getters in Express 5 but writable in 4; assign defensively.
      (req as unknown as Record<Source, unknown>)[source] = parsed;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        throw ApiError.badRequest("Validation failed", e.flatten());
      }
      throw e;
    }
  };

/** Typed accessor for a validated body (avoids `any` at call sites). */
export const body = <S extends ZodTypeAny>(req: Request) => req.body as ZInfer<S>;

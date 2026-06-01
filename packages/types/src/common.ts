import { z } from "zod";

/** Standard API success envelope: { data, meta? }. Errors use { error: { code, message, details? } }. */
export interface ApiSuccess<T> {
  data: T;
  meta?: PaginationMeta;
}
export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});
export type PaginationQuery = z.infer<typeof paginationQuery>;

export const idParam = z.object({ id: z.string().min(1) });
export const slugParam = z.object({ slug: z.string().min(1) });

/** Money is stored and transmitted as integer paise (₹ × 100). */
export const paise = z.number().int().nonnegative();
export const rupeesToPaise = (r: number) => Math.round(r * 100);
export const paiseToRupees = (p: number) => p / 100;
export const formatINR = (p: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p / 100);

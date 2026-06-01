import type { Response } from "express";
import type { PaginationMeta } from "@parchhai/types";

export const ok = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ data });

export const okList = <T>(res: Response, data: T[], meta: PaginationMeta) =>
  res.status(200).json({ data, meta });

export const created = <T>(res: Response, data: T) => res.status(201).json({ data });

export const paginate = (page: number, pageSize: number, total: number): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

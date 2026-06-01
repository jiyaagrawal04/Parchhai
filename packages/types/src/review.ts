import { z } from "zod";
import { ReviewStatus } from "./enums.js";

export const createReviewInput = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewInput>;

export interface ReviewDTO {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  author: string;
  status: z.infer<typeof ReviewStatus>;
  createdAt: string;
}

import { z } from "zod";
import { paginationQuery } from "./common.js";
import { ProductStatus } from "./enums.js";

// ── Public-facing DTOs ──────────────────────────────────
export interface CraftDTO {
  id: string;
  name: string;
  slug: string;
  region: string;
  story: string;
  dyes: string[];
  heroImage: string | null;
  videoUrl: string | null;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface ProductImageDTO {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductVariantDTO {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number; // paise
  stock: number;
  inStock: boolean;
}

export interface ProductListItemDTO {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  craft: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  image: string | null;
  ratingAvg: number;
  ratingCount: number;
  inStock: boolean;
}

export interface ProductDetailDTO extends Omit<ProductListItemDTO, "image"> {
  description: string;
  fabric: string | null;
  careInstructions: string | null;
  artisanCluster: string | null;
  videoUrl: string | null;
  status: ProductStatus;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
  sizes: string[];
  colors: string[];
}

// ── Product list query (filters/sort/paginate) ──────────
export const productSort = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "popular",
  "rating",
]);
export type ProductSort = z.infer<typeof productSort>;

export const productListQuery = paginationQuery.extend({
  craft: z.string().optional(), // craft slug
  category: z.string().optional(), // category slug
  collection: z.string().optional(), // collection slug
  size: z.string().optional(),
  color: z.string().optional(),
  minPrice: z.coerce.number().int().optional(), // paise
  maxPrice: z.coerce.number().int().optional(),
  inStock: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((v) => (typeof v === "string" ? v === "true" : v)),
  q: z.string().optional(), // search
  sort: productSort.default("newest"),
});
export type ProductListQuery = z.infer<typeof productListQuery>;

export const pincodeCheckQuery = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});
export interface PincodeCheckResult {
  pincode: string;
  serviceable: boolean;
  codAvailable: boolean;
  etaDays: number | null;
}

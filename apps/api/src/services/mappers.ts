import { Prisma } from "@parchhai/db";
import type {
  AddressDTO,
  CartDTO,
  CraftDTO,
  JournalPostDTO,
  OrderDTO,
  ProductDetailDTO,
  ProductListItemDTO,
  ReviewDTO,
} from "@parchhai/types";

// ── Shared include shapes (used by both queries and mappers) ──
export const productListInclude = {
  craft: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: "asc" }, take: 1 },
  variants: { select: { stock: true } },
} satisfies Prisma.ProductInclude;

export const productDetailInclude = {
  craft: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
} satisfies Prisma.ProductInclude;

type ProductListRow = Prisma.ProductGetPayload<{ include: typeof productListInclude }>;
type ProductDetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

export const toProductListItem = (p: ProductListRow): ProductListItemDTO => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  basePrice: p.basePrice,
  craft: p.craft,
  category: p.category,
  image: p.images[0]?.url ?? null,
  ratingAvg: p.ratingAvg,
  ratingCount: p.ratingCount,
  inStock: p.variants.some((v) => v.stock > 0),
});

export const toProductDetail = (p: ProductDetailRow): ProductDetailDTO => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  basePrice: p.basePrice,
  description: p.description,
  fabric: p.fabric,
  careInstructions: p.careInstructions,
  artisanCluster: p.artisanCluster,
  videoUrl: p.videoUrl,
  status: p.status,
  craft: p.craft,
  category: p.category,
  ratingAvg: p.ratingAvg,
  ratingCount: p.ratingCount,
  inStock: p.variants.some((v) => v.stock > 0),
  images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, position: i.position })),
  variants: p.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    price: v.price,
    stock: v.stock,
    inStock: v.stock > 0,
  })),
  sizes: [...new Set(p.variants.map((v) => v.size))],
  colors: [...new Set(p.variants.map((v) => v.color))],
});

export const toCraftDTO = (c: {
  id: string;
  name: string;
  slug: string;
  region: string;
  story: string;
  dyes: string[];
  heroImage: string | null;
  videoUrl: string | null;
}): CraftDTO => ({ ...c });

// ── Cart ──
export const cartItemInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.CartInclude;

type CartRow = Prisma.CartGetPayload<{ include: typeof cartItemInclude }>;

export const toCartDTO = (cart: CartRow): CartDTO => {
  const items = cart.items.map((it) => {
    const unitPrice = it.variant.price;
    return {
      id: it.id,
      variantId: it.variantId,
      productId: it.variant.productId,
      productName: it.variant.product.name,
      slug: it.variant.product.slug,
      image: it.variant.product.images[0]?.url ?? null,
      size: it.variant.size,
      color: it.variant.color,
      unitPrice,
      qty: it.qty,
      stock: it.variant.stock,
      lineTotal: unitPrice * it.qty,
    };
  });
  return {
    id: cart.id,
    items,
    subtotal: items.reduce((s, i) => s + i.lineTotal, 0),
    itemCount: items.reduce((s, i) => s + i.qty, 0),
  };
};

// ── Orders ──
export const orderInclude = {
  items: { include: { variant: { select: { productId: true } } } },
  timeline: { orderBy: { at: "asc" } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export const toOrderDTO = (o: OrderRow): OrderDTO => {
  const addr = o.shippingAddress as Record<string, string | null>;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    subtotal: o.subtotal,
    discount: o.discount,
    shipping: o.shipping,
    tax: o.tax,
    total: o.total,
    couponCode: o.couponCode,
    shippingAddress: {
      name: addr.name ?? "",
      phone: addr.phone ?? "",
      line1: addr.line1 ?? "",
      line2: addr.line2 ?? undefined,
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? "",
    },
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.variant.productId,
      productName: i.productName,
      sku: i.sku,
      size: i.size,
      color: i.color,
      qty: i.qty,
      unitPrice: i.unitPrice,
    })),
    timeline: o.timeline.map((t) => ({ status: t.status, note: t.note, at: t.at.toISOString() })),
    placedAt: o.placedAt.toISOString(),
  };
};

export const toAddressDTO = (a: {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
}): AddressDTO => ({
  id: a.id,
  name: a.name,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2 ?? undefined,
  city: a.city,
  state: a.state,
  pincode: a.pincode,
  type: a.type,
  isDefault: a.isDefault,
});

export const toReviewDTO = (r: {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  createdAt: Date;
  user: { name: string };
}): ReviewDTO => ({
  id: r.id,
  rating: r.rating,
  title: r.title,
  body: r.body,
  author: r.user.name,
  status: r.status,
  createdAt: r.createdAt.toISOString(),
});

export const toJournalDTO = (j: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  author: string | null;
  tags: string[];
  publishedAt: Date | null;
}): JournalPostDTO => ({
  id: j.id,
  title: j.title,
  slug: j.slug,
  excerpt: j.excerpt,
  body: j.body,
  coverImage: j.coverImage,
  author: j.author,
  tags: j.tags,
  publishedAt: j.publishedAt?.toISOString() ?? null,
});

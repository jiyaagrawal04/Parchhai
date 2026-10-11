/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PARCHHAI CATALOG — the single source of truth for everything sold on the site.
 *
 *  To add a product: copy one of the entries in PRODUCTS below, change the
 *  fields, and put its photos in `public/products/` (then reference them as
 *  "/products/<file>.jpg"). See CONTENT.md for the full how-to.
 *
 *  Prices are in rupees. Sizes/colours are free text. `tags` control where a
 *  product appears on the home page:
 *    "new"        → New Arrivals
 *    "bestseller" → Best Sellers
 *    "navratri"   → the featured collection block (see FEATURED_COLLECTION)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { CRAFT_IMG, HOME_IMG } from "./images";

export type Tag = "new" | "bestseller" | "navratri";

export interface Craft {
  slug: string;
  name: string;
  region: string;
  story: string;
  dyes: string[];
  image: string;
}

export interface Category {
  slug: string;
  name: string;
}

export interface Product {
  slug: string;
  name: string;
  price: number; // ₹
  craft: string; // Craft.slug
  category: string; // Category.slug
  colors: string[];
  sizes: string[];
  /** Sizes that are sold out (applies to every colour). */
  soldOutSizes?: string[];
  /** Mark the whole product sold out. */
  soldOut?: boolean;
  images: string[];
  description: string;
  fabric?: string;
  care?: string;
  tags?: Tag[];
  /** ISO date; "Newest" sort uses this. */
  addedOn: string;
}

// ── Featured collection (second block on the home page) ──────────────────────
export const FEATURED_COLLECTION = {
  tag: "navratri" as Tag,
  eyebrow: "Festive Edit",
  name: "Navratri Collection",
  blurb: "Nine nights, nine shades of celebration — hand-blocked pieces made to twirl in.",
  image: HOME_IMG.editorialBanner,
};

/** Collections selectable on the Shop page (`/shop?collection=<slug>`). */
export const COLLECTIONS: { slug: Tag; name: string }[] = [
  { slug: "new", name: "New Arrivals" },
  { slug: "navratri", name: FEATURED_COLLECTION.name },
  { slug: "bestseller", name: "Best Sellers" },
];

// ── Crafts ───────────────────────────────────────────────────────────────────
export const CRAFTS: Craft[] = [
  {
    slug: "ajrakh",
    name: "Ajrakh",
    region: "Kutch, Gujarat",
    dyes: ["Indigo", "Madder root", "Pomegranate", "Iron acetate"],
    image: CRAFT_IMG["ajrakh"],
    story:
      "Ajrakh is a resist-printing tradition practised by the Khatri community of Kutch for over four centuries. Each cloth passes through up to sixteen stages of printing and washing, layering natural indigo and madder over geometric and floral blocks carved by hand. The name is said to derive from 'aaj ke din rakh' — 'keep it for today' — a nod to the patience the craft demands. Parchhai works directly with Ajrakhpur artisans who still print by the river, reading the water and the weather as part of the recipe.",
  },
  {
    slug: "bagru",
    name: "Bagru",
    region: "Bagru, Rajasthan",
    dyes: ["Indigo", "Harda (myrobalan)", "Alizarin", "Fermented iron"],
    image: CRAFT_IMG["bagru"],
    story:
      "From the dusty printing village of Bagru near Jaipur, this craft is defined by its earthy palette of rust, black and indigo set against a harda-dyed cream ground. The Chhipa community uses mud-resist (dabu) and carved teak blocks, drying lengths of cloth in the open sun. Bagru's motifs are quiet and repeating — small buti florals, vines and dots — a rhythm meant for everyday wear that ages beautifully with each wash.",
  },
  {
    slug: "dabu",
    name: "Dabu",
    region: "Akola & Bagru, Rajasthan",
    dyes: ["Indigo", "Madder", "Pomegranate rind"],
    image: CRAFT_IMG["dabu"],
    story:
      "Dabu is the art of mud-resist printing: a paste of clay, lime, gum and wheat chaff is hand-pressed through blocks onto cloth, then dusted with sawdust and left to dry before dyeing. Wherever the mud sits, the dye cannot reach, leaving luminous negative-space patterns. It is slow, weather-dependent and gloriously imperfect — every hairline crack in the resist becomes part of the design.",
  },
  {
    slug: "dabu-bagru",
    name: "Dabu-Bagru",
    region: "Rajasthan",
    dyes: ["Indigo", "Harda", "Alizarin", "Fermented iron"],
    image: CRAFT_IMG["dabu-bagru"],
    story:
      "Dabu-Bagru pairs two Rajasthani traditions on a single cloth — the mud-resist of Dabu layered with the carved-block buti of Bagru — for a richly mixed print. Resist paste shields parts of the weave while earthy Bagru blocks build pattern over it; the cloth is then sun-dried and dyed. The result is a textile with depth: luminous negative-space motifs set against fine repeating florals.",
  },
];

// ── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { slug: "kurtis", name: "Kurtis" },
  { slug: "corsets", name: "Corsets" },
  { slug: "shirts", name: "Shirts" },
  { slug: "co-ords", name: "Co-ords" },
  { slug: "dresses", name: "Dresses" },
];

// ── Products ─────────────────────────────────────────────────────────────────
const ALL_SIZES = ["XS", "S", "M", "L", "XL"];
const CARE = "Hand-wash separately in cold water with mild detergent. Dry in shade. Natural dyes may bleed slightly on first wash.";

/** Placeholder photos until real ones are added to public/products/. */
const placeholder = (slug: string) => [1, 2, 3].map((n) => `https://picsum.photos/seed/${slug}-${n}/900/1200`);

export const PRODUCTS: Product[] = [
  // ── Kurtis ──
  { slug: "ajrakh-indigo-kurti", name: "Ajrakh Indigo Kurti", price: 2890, craft: "ajrakh", category: "kurtis", colors: ["Indigo", "Madder"], sizes: ALL_SIZES, images: placeholder("ajrakh-indigo-kurti"), description: "A relaxed straight kurti in hand-blocked Ajrakh, dyed in deep natural indigo.", fabric: "100% Cotton", care: CARE, tags: ["new", "bestseller"], addedOn: "2026-10-10" },
  { slug: "bagru-buti-angrakha-kurti", name: "Bagru Buti Angrakha Kurti", price: 2490, craft: "bagru", category: "kurtis", colors: ["Rust", "Cream"], sizes: ALL_SIZES, images: placeholder("bagru-buti-angrakha-kurti"), description: "An angrakha-style kurti scattered with tiny Bagru buti florals.", fabric: "100% Cotton", care: CARE, tags: ["new", "navratri"], addedOn: "2026-10-09" },
  { slug: "dabu-eclipse-kurti", name: "Dabu Eclipse Kurti", price: 3190, craft: "dabu", category: "kurtis", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("dabu-eclipse-kurti"), description: "Mud-resist Dabu in a luminous moon-and-vine repeat.", fabric: "100% Cotton", care: CARE, tags: ["new"], addedOn: "2026-10-08" },
  { slug: "dabu-bagru-mix-kurti", name: "Dabu-Bagru Mix Kurti", price: 2790, craft: "dabu-bagru", category: "kurtis", colors: ["Indigo", "Rust"], sizes: ALL_SIZES, images: placeholder("dabu-bagru-mix-kurti"), description: "Mud-resist Dabu layered with Bagru buti blocks for a richly mixed print.", fabric: "100% Cotton", care: CARE, tags: ["new", "bestseller"], addedOn: "2026-10-07" },

  // ── Corsets ──
  { slug: "ajrakh-corset-top", name: "Ajrakh Corset Top", price: 3490, craft: "ajrakh", category: "corsets", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("ajrakh-corset-top"), description: "A structured corset cut from hand-printed Ajrakh — heritage meets sharp tailoring.", fabric: "100% Cotton", care: CARE, tags: ["new", "bestseller"], addedOn: "2026-10-06" },
  { slug: "dabu-lace-up-corset", name: "Dabu Lace-up Corset", price: 3690, craft: "dabu", category: "corsets", colors: ["Indigo", "Black"], sizes: ALL_SIZES, images: placeholder("dabu-lace-up-corset"), description: "Lace-up back corset in mud-resist Dabu with boned structure.", fabric: "100% Cotton", care: CARE, tags: ["new"], addedOn: "2026-10-05" },
  { slug: "bagru-bustier", name: "Bagru Bustier", price: 3290, craft: "bagru", category: "corsets", colors: ["Rust"], sizes: ALL_SIZES, images: placeholder("bagru-bustier"), description: "A sweetheart bustier in earthy Bagru block-print.", fabric: "100% Cotton", care: CARE, tags: ["new", "navratri"], addedOn: "2026-10-04" },

  // ── Shirts ──
  { slug: "ajrakh-oversized-shirt", name: "Ajrakh Oversized Shirt", price: 2990, craft: "ajrakh", category: "shirts", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("ajrakh-oversized-shirt"), description: "An easy oversized shirt in flowing Ajrakh — unisex fit.", fabric: "100% Cotton", care: CARE, tags: ["new", "bestseller"], addedOn: "2026-10-03" },
  { slug: "bagru-camp-shirt", name: "Bagru Camp Shirt", price: 2590, craft: "bagru", category: "shirts", colors: ["Cream", "Rust"], sizes: ALL_SIZES, images: placeholder("bagru-camp-shirt"), description: "Camp-collar short-sleeve shirt in soft Bagru print.", fabric: "100% Cotton", care: CARE, addedOn: "2026-09-20" },
  { slug: "dabu-bagru-resort-shirt", name: "Dabu-Bagru Resort Shirt", price: 2890, craft: "dabu-bagru", category: "shirts", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("dabu-bagru-resort-shirt"), description: "Resort-ready shirt in mixed Dabu-Bagru block-print.", fabric: "100% Cotton", care: CARE, addedOn: "2026-09-19" },
  { slug: "dabu-office-shirt", name: "Dabu Office Shirt", price: 2790, craft: "dabu", category: "shirts", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("dabu-office-shirt"), description: "A crisp button-down with a subtle all-over Dabu motif.", fabric: "100% Cotton", care: CARE, tags: ["bestseller"], addedOn: "2026-09-18" },

  // ── Co-ords ──
  { slug: "ajrakh-co-ord-set", name: "Ajrakh Co-ord Set", price: 4890, craft: "ajrakh", category: "co-ords", colors: ["Indigo", "Madder"], sizes: ALL_SIZES, images: placeholder("ajrakh-co-ord-set"), description: "Matching shirt-and-trouser co-ord in coordinated Ajrakh blocks.", fabric: "100% Cotton", care: CARE, tags: ["navratri"], addedOn: "2026-09-17" },
  { slug: "bagru-lounge-co-ord", name: "Bagru Lounge Co-ord", price: 4290, craft: "bagru", category: "co-ords", colors: ["Cream"], sizes: ALL_SIZES, images: placeholder("bagru-lounge-co-ord"), description: "Relaxed top-and-pant set for slow mornings.", fabric: "100% Cotton", care: CARE, addedOn: "2026-09-16" },
  { slug: "dabu-power-co-ord", name: "Dabu Power Co-ord", price: 5190, craft: "dabu", category: "co-ords", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("dabu-power-co-ord"), description: "A tailored blazer-and-trouser co-ord in deep Dabu indigo.", fabric: "100% Cotton", care: CARE, tags: ["bestseller"], addedOn: "2026-09-15" },
  { slug: "dabu-bagru-festive-co-ord", name: "Dabu-Bagru Festive Co-ord", price: 4990, craft: "dabu-bagru", category: "co-ords", colors: ["Red", "Black"], sizes: ALL_SIZES, images: placeholder("dabu-bagru-festive-co-ord"), description: "Statement co-ord in bold red-and-black mixed block-print — made for the festive season.", fabric: "100% Cotton", care: CARE, tags: ["bestseller", "navratri"], addedOn: "2026-09-14" },

  // ── Dresses ──
  { slug: "ajrakh-slip-dress", name: "Ajrakh Slip Dress", price: 3590, craft: "ajrakh", category: "dresses", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("ajrakh-slip-dress"), description: "A bias-cut slip dress in fluid Ajrakh.", fabric: "100% Cotton", care: CARE, addedOn: "2026-09-13" },
  { slug: "dabu-tiered-dress", name: "Dabu Tiered Dress", price: 3990, craft: "dabu", category: "dresses", colors: ["Indigo"], sizes: ALL_SIZES, images: placeholder("dabu-tiered-dress"), description: "A tiered midi dress with mud-resist Dabu patterning.", fabric: "100% Cotton", care: CARE, tags: ["navratri"], addedOn: "2026-09-12" },
  { slug: "bagru-wrap-dress", name: "Bagru Wrap Dress", price: 3690, craft: "bagru", category: "dresses", colors: ["Rust", "Cream"], sizes: ALL_SIZES, images: placeholder("bagru-wrap-dress"), description: "A flattering wrap dress in delicate Bagru florals.", fabric: "100% Cotton", care: CARE, tags: ["bestseller", "navratri"], addedOn: "2026-09-11" },
  { slug: "dabu-bagru-shirt-dress", name: "Dabu-Bagru Shirt Dress", price: 3890, craft: "dabu-bagru", category: "dresses", colors: ["Red"], sizes: ALL_SIZES, images: placeholder("dabu-bagru-shirt-dress"), description: "A belted shirt dress in graphic mixed block-print.", fabric: "100% Cotton", care: CARE, tags: ["navratri"], addedOn: "2026-09-10" },
  { slug: "ajrakh-maxi-dress", name: "Ajrakh Maxi Dress", price: 4290, craft: "ajrakh", category: "dresses", colors: ["Indigo", "Madder"], sizes: ALL_SIZES, images: placeholder("ajrakh-maxi-dress"), description: "A floor-grazing maxi in panelled Ajrakh blocks.", fabric: "100% Cotton", care: CARE, tags: ["bestseller", "navratri"], addedOn: "2026-09-09" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Lookups & queries (no need to edit below this line)
// ─────────────────────────────────────────────────────────────────────────────

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getCraft = (slug: string) => CRAFTS.find((c) => c.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const craftOf = (p: Product) => getCraft(p.craft);
export const categoryOf = (p: Product) => getCategory(p.category);

export const isInStock = (p: Product) => !p.soldOut && p.sizes.some((s) => !(p.soldOutSizes ?? []).includes(s));
export const sizeAvailable = (p: Product, size: string) => !p.soldOut && p.sizes.includes(size) && !(p.soldOutSizes ?? []).includes(size);
export const hasTag = (p: Product, tag: Tag) => (p.tags ?? []).includes(tag);

export type SortKey = "newest" | "price_asc" | "price_desc" | "bestsellers";

export interface ProductFilter {
  craft?: string;
  category?: string;
  size?: string;
  collection?: string;
  q?: string;
  inStock?: boolean;
  sort?: SortKey;
}

const byNewest = (a: Product, b: Product) => b.addedOn.localeCompare(a.addedOn);

export const listProducts = (f: ProductFilter = {}): Product[] => {
  const q = f.q?.trim().toLowerCase();
  let items = PRODUCTS.filter((p) => {
    if (f.craft && p.craft !== f.craft) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.size && !sizeAvailable(p, f.size)) return false;
    if (f.collection && !hasTag(p, f.collection as Tag)) return false;
    if (f.inStock && !isInStock(p)) return false;
    if (q) {
      const hay = [p.name, p.description, craftOf(p)?.name, categoryOf(p)?.name, ...p.colors].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  switch (f.sort) {
    case "price_asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "bestsellers":
      items = [...items].sort((a, b) => Number(hasTag(b, "bestseller")) - Number(hasTag(a, "bestseller")) || byNewest(a, b));
      break;
    default:
      items = [...items].sort(byNewest);
  }
  return items;
};

export const byTag = (tag: Tag, limit?: number) => {
  const items = PRODUCTS.filter((p) => hasTag(p, tag)).sort(byNewest);
  return limit ? items.slice(0, limit) : items;
};
export const newArrivals = (limit?: number) => byTag("new", limit);
export const bestSellers = (limit?: number) => byTag("bestseller", limit);

/** Same craft first, then same category, excluding the product itself. */
export const relatedTo = (p: Product, limit = 4) => {
  const others = PRODUCTS.filter((x) => x.slug !== p.slug);
  const score = (x: Product) => (x.craft === p.craft ? 2 : 0) + (x.category === p.category ? 1 : 0);
  return [...others].sort((a, b) => score(b) - score(a) || byNewest(a, b)).slice(0, limit);
};

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
  /** Short tagline under the name. */
  tagline?: string;
  /** Marketing copy; separate paragraphs with a blank line. */
  description: string;
  fabric?: string;
  /** Spec rows shown under "Product details": [label, value]. */
  details?: [string, string][];
  /** "How to style" paragraph. */
  styling?: string;
  /** Craft / brand note with its own heading. */
  craftNote?: { title: string; body: string };
  /** Care steps, one per entry. */
  care?: string[];
  tags?: Tag[];
  /** ISO date; "Newest" sort uses this. */
  addedOn: string;
}

// ── Featured collection (second block on the home page) ──────────────────────
export const FEATURED_COLLECTION = {
  tag: "navratri" as Tag,
  eyebrow: "Launching today",
  name: "Navratri Collection",
  blurb: "The Navratri festive season launch is live today. A rare collection of hand-block printed pieces, made for the nine nights.",
  image: HOME_IMG.featuredCollection,
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
];

// ── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { slug: "tops", name: "Tops" },
  { slug: "kurtas", name: "Kurtas" },
];

// ── Products ─────────────────────────────────────────────────────────────────
const SIZES = ["XS", "S", "M", "L"];

/** Bust measurement per size, in inches (shown in the size guide). */
export const SIZE_GUIDE: [string, number][] = [
  ["XS", 30],
  ["S", 32],
  ["M", 34],
  ["L", 36],
];


const careSteps = (shade: string) => [
  "Hand wash separately in cold water.",
  "Use a mild detergent.",
  "Avoid bleach and harsh chemicals.",
  shade,
  "Iron inside out on a low to medium setting.",
];
const SHADE_PRINT_COLOUR = "Dry in the shade to help preserve the print and colour.";
const SHADE_PRINT = "Dry in the shade to help preserve the print.";

const photos = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `/products/${slug}-${i + 1}.jpg`);

export const PRODUCTS: Product[] = [
  {
    slug: "gulnaar-wrap-top",
    name: "Gulnaar",
    tagline: "Ajrakh Printed Wrap Top. Where the colours of tradition meet the art of everyday dressing.",
    price: 1199,
    craft: "ajrakh",
    category: "tops",
    colors: ["Red"],
    sizes: SIZES,
    images: photos("gulnaar", 5),
    description:
      "Introducing Gulnaar by Parchhai, a celebration of the rich textile heritage of Gujarat, India. Featuring a vibrant red base adorned with intricate indigo-blue and beige floral motifs, this wrap-style top brings traditional Ajrakh-inspired artistry into a contemporary silhouette.\n\nCrafted from 100% pure cotton with a 100% cotton lining, Gulnaar is designed for breathable comfort and effortless elegance. The flattering V-neckline, full-length sleeves, and adjustable side tie-up create a graceful wrap-style fit that accentuates the waist. Decorative fabric tassels add a playful finishing touch.",
    fabric: "100% pure cotton",
    details: [
      ["Craft", "Ajrakh print"],
      ["Craft origin", "Gujarat, India"],
      ["Colour", "Red with indigo-blue and beige motifs"],
      ["Fabric", "100% pure cotton"],
      ["Lining", "100% cotton"],
      ["Neckline", "V-neck"],
      ["Sleeves", "Full-length sleeves"],
      ["Silhouette", "Wrap-style top"],
      ["Closure", "Adjustable side tie-up"],
      ["Details", "Decorative fabric tassels"],
    ],
    styling:
      "Pair Gulnaar with black trousers for an effortlessly chic look, or style it with ivory palazzos, a long skirt, or denim for a contemporary Indo-western outfit. Add oxidised silver jewellery, statement earrings, and traditional flats to complete your look.",
    craftNote: {
      title: "A Note on the Craft",
      body: "Ajrakh is a traditional textile-printing art associated with Gujarat and Rajasthan, celebrated for its intricate patterns and rich colours. Its heritage and craftsmanship make every print a tribute to India's enduring textile traditions.",
    },
    care: careSteps(SHADE_PRINT_COLOUR),
    tags: ["new", "navratri"],
    addedOn: "2026-10-11",
  },
  {
    slug: "peeli-mitti-kurta",
    name: "Peeli Mitti",
    tagline: "Bagru Printed Cotton Kurta. Earthy hues. Timeless prints. A touch of Rajasthan.",
    price: 799,
    craft: "bagru",
    category: "kurtas",
    colors: ["Mustard yellow"],
    sizes: SIZES,
    images: photos("peeli-mitti", 5),
    description:
      "Introducing Peeli Mitti by Parchhai, a celebration of traditional Indian craftsmanship in a warm mustard-yellow hue. Adorned with delicate ivory buta motifs inspired by nature, this kurta brings together the beauty of Bagru hand block printing and the simplicity of contemporary ethnic wear.\n\nCrafted from 100% pure cotton with a 100% cotton lining, this kurta is designed for breathable comfort and effortless elegance. The graceful square neckline, full-length sleeves, and straight silhouette create a timeless look that feels just as beautiful for everyday wear as it does for festive occasions.",
    fabric: "100% pure cotton",
    details: [
      ["Print", "Traditional Bagru hand block print"],
      ["Craft origin", "Bagru, Jaipur, Rajasthan, India"],
      ["Colour", "Mustard yellow with ivory motifs"],
      ["Fabric", "100% pure cotton"],
      ["Lining", "100% cotton"],
      ["Neckline", "Square neck"],
      ["Sleeves", "Full-length sleeves"],
      ["Silhouette", "Straight fit"],
      ["Length", "Kurta length"],
    ],
    styling:
      "Pair Peeli Mitti with a flowing white skirt, cotton palazzos, or straight-fit trousers for an effortlessly elegant ethnic look. Add silver jhumkas, delicate bangles, and traditional juttis to complete your outfit.",
    craftNote: {
      title: "A Note on the Craft",
      body: "Bagru printing is a traditional textile-printing craft associated with Rajasthan. Its distinctive motifs and handcrafted character celebrate the artistry of Indian textiles. Slight variations in print placement and colour may occur with handcrafted pieces.",
    },
    care: careSteps(SHADE_PRINT_COLOUR),
    tags: ["new", "navratri"],
    addedOn: "2026-10-10",
  },
  {
    slug: "rust-bloom-blouse",
    name: "Rust Bloom",
    tagline: "Bagru Printed Cotton Blouse. Timeless Rajasthani craftsmanship, made to be cherished.",
    price: 799,
    craft: "bagru",
    category: "tops",
    colors: ["Rust red"],
    sizes: SIZES,
    images: photos("rust-bloom", 6),
    description:
      "Discover the beauty of traditional Indian textiles with the Rust Bloom Blouse by Parchhai. Featuring an earthy rust-red base adorned with intricate ivory botanical motifs, this piece celebrates the rich heritage of Bagru hand block printing from Jaipur, Rajasthan.\n\nCrafted from 100% pure cotton with a 100% cotton lining, this blouse combines breathable comfort with a flattering, structured silhouette. Its elegant square neckline, sleeveless cut, and delicate real cowrie shell embellishments along the hem create a distinctive look that blends traditional artistry with contemporary style.",
    fabric: "100% pure cotton",
    details: [
      ["Craft", "Traditional Bagru hand block printing"],
      ["Craft origin", "Jaipur, Rajasthan, India"],
      ["Colour", "Rust red, ivory and black"],
      ["Fabric", "100% pure cotton"],
      ["Lining", "100% cotton"],
      ["Neckline", "Square neck"],
      ["Sleeves", "Sleeveless"],
      ["Silhouette", "Fitted"],
      ["Embellishment", "Real cowrie shells"],
    ],
    styling:
      "Pair your Rust Bloom Blouse with an ivory skirt, a flowing lehenga, a saree, or high-waisted trousers. Complete the look with silver jhumkas, bangles, and traditional footwear. Perfect for festive occasions, intimate celebrations, cultural gatherings, and statement everyday styling.",
    craftNote: {
      title: "The Parchhai Promise",
      body: "Rooted in the beauty of Indian heritage, this piece celebrates the artistry of traditional Bagru hand block printing and the charm of natural materials. Subtle variations in print placement and handcrafted details are part of the beauty of artisanal textiles.",
    },
    care: [
      "Hand wash separately in cold water using a mild detergent.",
      "Avoid bleach and harsh chemicals.",
      "Dry in the shade to help preserve the colours.",
      "Iron inside out on a low to medium setting.",
      "Avoid direct ironing over the cowrie shells.",
    ],
    tags: ["new", "navratri"],
    addedOn: "2026-10-09",
  },
  {
    slug: "neel-dabu-top",
    name: "Neel Dabu",
    tagline: "Indigo Printed Cotton Top. The art of tradition, in shades of indigo.",
    price: 799,
    craft: "dabu",
    category: "tops",
    colors: ["Indigo blue"],
    sizes: SIZES,
    images: photos("neel-dabu", 5),
    description:
      "Introducing the Neel Dabu Top by Parchhai, a timeless blend of traditional Rajasthani textile artistry and contemporary everyday style.\n\nFeaturing a rich indigo-blue base with striking ivory motifs, this top celebrates the distinctive beauty of traditional Dabu printing. The organic patterns bring character to the design, while the elegant V-neckline, sleeveless silhouette, and adjustable side tie-ups create a flattering, feminine fit.\n\nCrafted from 100% pure cotton with a 100% cotton lining, it is designed for breathable comfort and effortless styling. Its curved side detailing and straight hem give it a modern silhouette.",
    fabric: "100% pure cotton",
    details: [
      ["Print", "Traditional Dabu hand block print"],
      ["Craft origin", "Rajasthan, India"],
      ["Colour", "Indigo blue and ivory"],
      ["Fabric", "100% pure cotton"],
      ["Lining", "100% cotton"],
      ["Neckline", "V-neck"],
      ["Sleeves", "Sleeveless"],
      ["Fit", "Fitted through the bodice with adjustable side ties"],
      ["Hemline", "Straight hem"],
    ],
    styling:
      "Pair the Neel Dabu Top with black trousers for a chic everyday look, white wide-leg pants for a fresh summer outfit, or an ethnic skirt for a fusion-inspired ensemble. Finish with silver jewellery, kolhapuris, or simple flats.",
    craftNote: {
      title: "A Note on the Craft",
      body: "Dabu is a traditional mud-resist printing technique associated with Rajasthan. Artisans apply a resist paste to selected areas of fabric before dyeing it, creating distinctive patterns and beautiful variations in the finished print.",
    },
    care: careSteps(SHADE_PRINT),
    tags: ["new"],
    addedOn: "2026-10-08",
  },
  {
    slug: "vanika-top",
    name: "The Vanika Top",
    tagline: "Bagru Printed Cotton Tunic. Tradition in every print. Elegance in every detail.",
    price: 899,
    craft: "bagru",
    category: "tops",
    colors: ["Beige"],
    sizes: SIZES,
    images: photos("vanika", 5),
    description:
      "Inspired by the rich textile heritage of Bagru, Jaipur, Rajasthan, the Vanika Top by Parchhai brings together timeless Indian artistry and contemporary everyday style.\n\nFeaturing a warm beige base adorned with intricate rust-brown botanical tree motifs, this piece celebrates the beauty of traditional Bagru hand block printing. Its flattering V-neckline, broad shoulder straps, and structured fitted silhouette create a graceful, feminine look, while the straight hem adds a clean, modern finish.\n\nCrafted from 100% pure cotton with a 100% cotton lining, it is versatile enough for everyday wear, casual outings, festive gatherings, and effortless Indo-western styling.",
    fabric: "100% pure cotton",
    details: [
      ["Print", "Traditional Bagru hand block print"],
      ["Craft origin", "Jaipur, Rajasthan, India"],
      ["Colour", "Beige with rust-brown motifs"],
      ["Fabric", "100% pure cotton"],
      ["Lining", "100% cotton"],
      ["Neckline", "V-neck"],
      ["Straps", "Broad shoulder straps"],
      ["Sleeves", "Sleeveless"],
      ["Silhouette", "Fitted, structured tunic"],
      ["Hemline", "Straight hem"],
    ],
    styling:
      "Pair the Vanika Top with black wide-leg trousers for a chic contemporary look, or style it with white palazzos, denim, or an ethnic skirt. Add oxidised silver jewellery, juttis, or kolhapuris to complete the look.",
    craftNote: {
      title: "The Parchhai Story",
      body: "Rooted in the heritage of Indian textiles, the Vanika Top celebrates the beauty of traditional craftsmanship through earthy colours, botanical motifs, and timeless silhouettes.",
    },
    care: careSteps(SHADE_PRINT),
    tags: ["new"],
    addedOn: "2026-10-07",
  },
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

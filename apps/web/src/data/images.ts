/**
 * Site imagery. Every image is one of Parchhai's own product photos in
 * public/products/. To change one, point it at another file in public/.
 */

export const HOME_IMG = {
  hero: "/products/rust-bloom-2.jpg",
  editorialBanner: "/products/peeli-mitti-3.jpg",
  craftStory: "/products/vanika-3.jpg",
  featuredCollection: "/products/peeli-mitti-1.jpg",
};

/** Hero image per craft slug. */
export const CRAFT_IMG: Record<string, string> = {
  ajrakh: "/products/gulnaar-4.jpg",
  bagru: "/products/rust-bloom-1.jpg",
  dabu: "/products/neel-dabu-5.jpg",
};

/** Our Story page. */
export const STORY_IMG = {
  meaning: "/products/neel-dabu-1.jpg",
  hero: "/products/rust-bloom-5.jpg",
  ourStory: "/products/vanika-1.jpg",
  craft: "/products/neel-dabu-5.jpg",
};

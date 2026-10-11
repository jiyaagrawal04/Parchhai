# Updating the Parchhai website

The site has no admin panel and no database. Everything you see is in a few plain
files inside `apps/web/src/data/`. Edit, push to GitHub, and the host (Vercel or
Render) rebuilds the site in about a minute.

| What to change | File |
|---|---|
| Products, prices, sizes, photos, tags | `src/data/catalog.ts` |
| The featured collection block (Navratri today) | `src/data/catalog.ts` → `FEATURED_COLLECTION` |
| Crafts (Ajrakh, Bagru, Dabu, Dabu-Bagru) | `src/data/catalog.ts` → `CRAFTS` |
| Instagram handle, email, phones, studio, offers, ticker lines | `src/data/site.ts` |
| Home page editorial photos | `src/data/images.ts` |
| Our Story text and photos | `src/pages/Story.tsx` |

## Add a product

1. Put the photos in `apps/web/public/products/`, e.g.
   `public/products/ajrakh-indigo-kurti-1.jpg`, `-2.jpg`, `-3.jpg`.
   Portrait photos (3:4) look best. Keep each under ~500 KB.
2. Open `src/data/catalog.ts`, copy any entry in `PRODUCTS` and edit it:

```ts
{
  slug: "ajrakh-indigo-kurti",          // unique, lowercase, used in the URL
  name: "Ajrakh Indigo Kurti",
  price: 2890,                           // rupees
  craft: "ajrakh",                       // one of the CRAFTS slugs
  category: "kurtis",                    // one of the CATEGORIES slugs
  colors: ["Indigo", "Madder"],
  sizes: ["XS", "S", "M", "L", "XL"],
  soldOutSizes: ["XL"],                  // optional
  images: [
    "/products/ajrakh-indigo-kurti-1.jpg",
    "/products/ajrakh-indigo-kurti-2.jpg",
  ],
  description: "A relaxed straight kurti in hand-blocked Ajrakh.",
  fabric: "100% Cotton",
  care: CARE,
  tags: ["new", "navratri"],             // see below
  addedOn: "2026-10-11",                 // today's date; newest shows first
},
```

3. Push. Done.

### Tags: where a product shows up on the home page

- `"new"` → **New Arrivals** (also `/shop?collection=new`)
- `"bestseller"` → **Best Sellers** carousel
- `"navratri"` → the **featured collection** block near the top

A product can have several tags, or none (then it is only in the Shop).

### Sold out

- One size: `soldOutSizes: ["M", "L"]`
- Whole product: `soldOut: true` (it stays visible, marked "Sold out")
- Remove it from the site: delete its entry.

## Change the featured collection (e.g. Navratri → Diwali)

In `src/data/catalog.ts`:

1. Add the new tag name to `Tag`: `export type Tag = "new" | "bestseller" | "navratri" | "diwali";`
2. Update `FEATURED_COLLECTION` (`tag`, `name`, `eyebrow`, `blurb`, `image`).
3. Update the matching row in `COLLECTIONS` so the Shop filter shows the new name.
4. Tag the products with `"diwali"`.

## Offers and the announcement bar

`src/data/site.ts`: edit `OFFERS` (codes shown in the bag) and `ANNOUNCEMENTS`
(lines in the scrolling bar). Coupons are not calculated by the site; the customer
types the code at checkout and it appears in the order message so you can apply it.

## How ordering works

1. Customer adds pieces to the bag (saved in their browser, no login).
2. "Place order on Instagram" opens a DM with `@parchhai.co` (`ig.me/m/parchhai.co`)
   and copies an order summary to their clipboard: items, sizes, quantities, total,
   coupon, and their name/address if they filled them in, plus a reference like
   `PRC-261011-K7Q2`.
3. They paste it in the chat. You reply with payment details and confirm.

To change the Instagram account, edit `instagramHandle` in `src/data/site.ts`.

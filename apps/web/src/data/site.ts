/**
 * Site-wide settings. Edit this file to change contact details, offers and the
 * Instagram account that receives orders. No backend — everything is static.
 */

export const SITE = {
  name: "Parchhai",
  tagline: "Hand-block printed fashion",
  instagramHandle: "parchhai.co",
  email: "admin@myparchhai.com",
  phones: ["+91 62013 02013", "+91 98180 97573"],
  studio: "Mathikere, Bengaluru – 560054, Karnataka",
  hours: "Mon–Sat · 10am – 7pm IST",
};

/** Instagram's official deep link that opens a DM thread with the account. */
export const INSTAGRAM_URL = `https://instagram.com/${SITE.instagramHandle}`;
export const INSTAGRAM_DM_URL = `https://ig.me/m/${SITE.instagramHandle}`;

/** Shipping (₹). Orders at or above FREE_SHIPPING_OVER ship free. */
export const FREE_SHIPPING_OVER = 999;
export const SHIPPING_FEE = 79;

/** Offers shown on the site. Coupons are applied by Parchhai when confirming the order on Instagram. */
export const OFFERS = [
  { code: "WELCOME10", desc: "10% off your first order · min ₹999" },
  { code: "WELCOME5", desc: "5% off · min ₹599" },
];

/** Lines in the scrolling announcement bar on the home page. */
export const ANNOUNCEMENTS = [
  `Free delivery over ₹${FREE_SHIPPING_OVER}`,
  "Welcome offer · WELCOME10 — 10% off your first order",
  "Hand-block printed in India",
  "Naturally dyed · slow fashion",
  "Order in a DM on Instagram",
];

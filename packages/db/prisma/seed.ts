import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/client.js";
import { Prisma } from "@prisma/client";

// ₹ → paise helper
const inr = (rupees: number) => Math.round(rupees * 100);
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const img = (seed: string) => `https://picsum.photos/seed/${seed}/900/1200`;

async function main() {
  console.log("🌱 Seeding Parchhai…");

  // Clean slate (dev only) — order matters for FKs.
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notificationLog.deleteMany(),
    prisma.couponRedemption.deleteMany(),
    prisma.orderTimeline.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.returnRequest.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.wishlistItem.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.review.deleteMany(),
    prisma.inventoryMovement.deleteMany(),
    prisma.collectionProduct.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.collection.deleteMany(),
    prisma.category.deleteMany(),
    prisma.craft.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.journalPost.deleteMany(),
    prisma.shippingRate.deleteMany(),
    prisma.shippingZone.deleteMany(),
    prisma.pincodeServiceability.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.otpCode.deleteMany(),
    prisma.address.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ── Crafts ──────────────────────────────────────────────
  const crafts = await Promise.all(
    [
      {
        name: "Ajrakh",
        region: "Kutch, Gujarat",
        dyes: ["Indigo", "Madder root", "Pomegranate", "Iron acetate"],
        story:
          "Ajrakh is a resist-printing tradition practised by the Khatri community of Kutch for over four centuries. Each cloth passes through up to sixteen stages of printing and washing, layering natural indigo and madder over geometric and floral blocks carved by hand. The name is said to derive from 'aaj ke din rakh' — 'keep it for today' — a nod to the patience the craft demands. Parchhai works directly with Ajrakhpur artisans who still print by the river, reading the water and the weather as part of the recipe.",
      },
      {
        name: "Bagru",
        region: "Bagru, Rajasthan",
        dyes: ["Indigo", "Harda (myrobalan)", "Alizarin", "Fermented iron"],
        story:
          "From the dusty printing village of Bagru near Jaipur, this craft is defined by its earthy palette of rust, black and indigo set against a harda-dyed cream ground. The Chhipa community uses mud-resist (dabu) and carved teak blocks, drying lengths of cloth in the open sun. Bagru's motifs are quiet and repeating — small buti florals, vines and dots — a rhythm meant for everyday wear that ages beautifully with each wash.",
      },
      {
        name: "Dabu",
        region: "Akola & Bagru, Rajasthan",
        dyes: ["Indigo", "Madder", "Pomegranate rind"],
        story:
          "Dabu is the art of mud-resist printing: a paste of clay, lime, gum and wheat chaff is hand-pressed through blocks onto cloth, then dusted with sawdust and left to dry before dyeing. Wherever the mud sits, the dye cannot reach, leaving luminous negative-space patterns. It is slow, weather-dependent and gloriously imperfect — every hairline crack in the resist becomes part of the design.",
      },
      {
        name: "Bagh",
        region: "Bagh, Madhya Pradesh",
        dyes: ["Alizarin (red)", "Iron (black)", "Harda"],
        story:
          "Named after the Bagh river whose mineral-rich waters fix its colours, Bagh print is recognised by its striking red-and-black geometry on a natural ground. The Khatri artisans of Bagh village carve intricate blocks — some over 300 years old — and wash the cloth in the flowing river to achieve its signature clarity. A UNESCO-recognised craft, Bagh balances bold scale with fine detail.",
      },
    ].map((c, i) =>
      prisma.craft.create({
        data: {
          name: c.name,
          slug: slugify(c.name),
          region: c.region,
          story: c.story,
          dyes: c.dyes,
          heroImage: img(`craft-${slugify(c.name)}`),
          position: i,
        },
      }),
    ),
  );
  const craftBy = Object.fromEntries(crafts.map((c) => [c.name, c]));

  // ── Categories ──────────────────────────────────────────
  const categoryNames = ["Kurtis", "Corsets", "Shirts", "Co-ords", "Dresses"];
  const categories = await Promise.all(
    categoryNames.map((name, i) =>
      prisma.category.create({
        data: { name, slug: slugify(name), position: i },
      }),
    ),
  );
  const catBy = Object.fromEntries(categories.map((c) => [c.name, c]));

  // ── Products (~20) ──────────────────────────────────────
  const SIZES = ["XS", "S", "M", "L", "XL"];
  const productDefs: Array<{
    name: string;
    category: string;
    craft: string;
    fabric: string;
    price: number; // rupees
    colors: string[];
    desc: string;
  }> = [
    { name: "Ajrakh Indigo Kurti", category: "Kurtis", craft: "Ajrakh", fabric: "Mul cotton", price: 2890, colors: ["Indigo", "Madder"], desc: "A relaxed straight kurti in hand-blocked Ajrakh, dyed in deep natural indigo." },
    { name: "Bagru Buti Angrakha Kurti", category: "Kurtis", craft: "Bagru", fabric: "Cotton voile", price: 2490, colors: ["Rust", "Cream"], desc: "An angrakha-style kurti scattered with tiny Bagru buti florals." },
    { name: "Dabu Eclipse Kurti", category: "Kurtis", craft: "Dabu", fabric: "Handloom cotton", price: 3190, colors: ["Indigo"], desc: "Mud-resist Dabu in a luminous moon-and-vine repeat." },
    { name: "Bagh Geometry Kurti", category: "Kurtis", craft: "Bagh", fabric: "Cotton", price: 2790, colors: ["Red", "Black"], desc: "Bold Bagh geometry in signature red-and-black on a natural ground." },
    { name: "Ajrakh Corset Top", category: "Corsets", craft: "Ajrakh", fabric: "Cotton canvas", price: 3490, colors: ["Indigo"], desc: "A structured corset cut from hand-printed Ajrakh — heritage meets sharp tailoring." },
    { name: "Dabu Lace-up Corset", category: "Corsets", craft: "Dabu", fabric: "Cotton twill", price: 3690, colors: ["Indigo", "Black"], desc: "Lace-up back corset in mud-resist Dabu with boned structure." },
    { name: "Bagru Bustier", category: "Corsets", craft: "Bagru", fabric: "Cotton", price: 3290, colors: ["Rust"], desc: "A sweetheart bustier in earthy Bagru block-print." },
    { name: "Ajrakh Oversized Shirt", category: "Shirts", craft: "Ajrakh", fabric: "Mul cotton", price: 2990, colors: ["Indigo"], desc: "An easy oversized shirt in flowing Ajrakh — unisex fit." },
    { name: "Bagru Camp Shirt", category: "Shirts", craft: "Bagru", fabric: "Cotton voile", price: 2590, colors: ["Cream", "Rust"], desc: "Camp-collar short-sleeve shirt in soft Bagru print." },
    { name: "Bagh Resort Shirt", category: "Shirts", craft: "Bagh", fabric: "Cotton", price: 2890, colors: ["Red"], desc: "Resort-ready shirt in graphic Bagh blocks." },
    { name: "Dabu Office Shirt", category: "Shirts", craft: "Dabu", fabric: "Handloom cotton", price: 2790, colors: ["Indigo"], desc: "A crisp button-down with a subtle all-over Dabu motif." },
    { name: "Ajrakh Co-ord Set", category: "Co-ords", craft: "Ajrakh", fabric: "Mul cotton", price: 4890, colors: ["Indigo", "Madder"], desc: "Matching shirt-and-trouser co-ord in coordinated Ajrakh blocks." },
    { name: "Bagru Lounge Co-ord", category: "Co-ords", craft: "Bagru", fabric: "Cotton voile", price: 4290, colors: ["Cream"], desc: "Relaxed top-and-pant set for slow mornings." },
    { name: "Dabu Power Co-ord", category: "Co-ords", craft: "Dabu", fabric: "Cotton twill", price: 5190, colors: ["Indigo"], desc: "A tailored blazer-and-trouser co-ord in deep Dabu indigo." },
    { name: "Bagh Festive Co-ord", category: "Co-ords", craft: "Bagh", fabric: "Cotton", price: 4990, colors: ["Red", "Black"], desc: "Statement co-ord in bold Bagh red-and-black." },
    { name: "Ajrakh Slip Dress", category: "Dresses", craft: "Ajrakh", fabric: "Mul cotton", price: 3590, colors: ["Indigo"], desc: "A bias-cut slip dress in fluid Ajrakh." },
    { name: "Dabu Tiered Dress", category: "Dresses", craft: "Dabu", fabric: "Handloom cotton", price: 3990, colors: ["Indigo"], desc: "A tiered midi dress with mud-resist Dabu patterning." },
    { name: "Bagru Wrap Dress", category: "Dresses", craft: "Bagru", fabric: "Cotton voile", price: 3690, colors: ["Rust", "Cream"], desc: "A flattering wrap dress in delicate Bagru florals." },
    { name: "Bagh Shirt Dress", category: "Dresses", craft: "Bagh", fabric: "Cotton", price: 3890, colors: ["Red"], desc: "A belted shirt dress in graphic Bagh print." },
    { name: "Ajrakh Maxi Dress", category: "Dresses", craft: "Ajrakh", fabric: "Mul cotton", price: 4290, colors: ["Indigo", "Madder"], desc: "A floor-grazing maxi in panelled Ajrakh blocks." },
  ];

  const products = [];
  for (const def of productDefs) {
    const slug = slugify(def.name);
    const product = await prisma.product.create({
      data: {
        name: def.name,
        slug,
        description: `${def.desc} Hand-blocked by ${def.craft} artisans on ${def.fabric}. Each piece is unique; slight irregularities in print are the signature of true block-printing.`,
        craftId: craftBy[def.craft]!.id,
        categoryId: catBy[def.category]!.id,
        fabric: def.fabric,
        careInstructions: "Hand-wash separately in cold water with mild detergent. Dry in shade. Natural dyes may bleed slightly on first wash.",
        artisanCluster: craftBy[def.craft]!.region,
        basePrice: inr(def.price),
        status: "PUBLISHED",
        seoTitle: `${def.name} — Hand-block printed ${def.craft} | Parchhai`,
        seoDescription: def.desc,
        images: {
          create: [
            { url: img(`${slug}-1`), alt: `${def.name} front`, position: 0 },
            { url: img(`${slug}-2`), alt: `${def.name} detail`, position: 1 },
            { url: img(`${slug}-3`), alt: `${def.name} back`, position: 2 },
          ],
        },
        variants: {
          create: def.colors.flatMap((color) =>
            SIZES.map((size) => ({
              sku: `${slug}-${color}-${size}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
              size,
              color,
              price: inr(def.price),
              stock: 4 + ((def.name.length + size.length) % 18), // 4..21, deterministic
              lowStockThreshold: 5,
            })),
          ),
        },
      },
      include: { variants: true },
    });
    products.push(product);
  }
  console.log(`  • ${products.length} products created`);

  // Record initial RESTOCK movements for traceability
  for (const p of products) {
    await prisma.inventoryMovement.createMany({
      data: p.variants.map((v) => ({
        variantId: v.id,
        change: v.stock,
        reason: "RESTOCK" as const,
        note: "Initial seed stock",
        createdBy: "seed",
      })),
    });
  }

  // ── Collections ─────────────────────────────────────────
  const newArrivals = await prisma.collection.create({
    data: {
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "The latest from our artisan clusters.",
      heroImage: img("collection-new"),
      position: 0,
      products: { create: products.slice(0, 8).map((p, i) => ({ productId: p.id, position: i })) },
    },
  });
  await prisma.collection.create({
    data: {
      name: "Indigo Edit",
      slug: "indigo-edit",
      description: "Everything in deep natural indigo.",
      heroImage: img("collection-indigo"),
      position: 1,
      products: {
        create: products
          .filter((p) => p.name.includes("Ajrakh") || p.name.includes("Dabu"))
          .slice(0, 6)
          .map((p, i) => ({ productId: p.id, position: i })),
      },
    },
  });

  // ── Users ───────────────────────────────────────────────
  const pwHash = await bcrypt.hash("Password123!", 10);
  await prisma.user.create({
    data: {
      role: "OWNER",
      name: "Parchhai Admin",
      email: "admin@parchhai.example",
      phone: "+919000000001",
      passwordHash: pwHash,
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });
  await prisma.user.createMany({
    data: [
      { role: "CATALOG_MANAGER", name: "Catalog Manager", email: "catalog@parchhai.example", passwordHash: pwHash, emailVerified: new Date() },
      { role: "ORDER_OPS", name: "Order Ops", email: "ops@parchhai.example", passwordHash: pwHash, emailVerified: new Date() },
      { role: "SUPPORT", name: "Support Agent", email: "support@parchhai.example", passwordHash: pwHash, emailVerified: new Date() },
    ],
  });

  const customer = await prisma.user.create({
    data: {
      role: "CUSTOMER",
      name: "Aanya Sharma",
      email: "aanya@example.com",
      phone: "+919812345678",
      passwordHash: pwHash,
      emailVerified: new Date(),
      status: "ACTIVE",
      wishlist: { create: {} },
      addresses: {
        create: [
          {
            name: "Aanya Sharma",
            phone: "+919812345678",
            line1: "12 Banjara Hills, Road No. 4",
            line2: "Near Cafe Niloufer",
            city: "Hyderabad",
            state: "Telangana",
            pincode: "500034",
            isDefault: true,
            type: "HOME",
          },
        ],
      },
    },
    include: { addresses: true },
  });

  // ── Coupons ─────────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10, minOrder: inr(1999), perUserLimit: 1, active: true },
      { code: "FLAT500", type: "FLAT", value: inr(500), minOrder: inr(2999), perUserLimit: 2, active: true },
      { code: "FREESHIP", type: "FREESHIP", value: 0, minOrder: inr(1499), perUserLimit: 5, active: true },
    ],
  });

  // ── A few orders for the demo customer ──────────────────
  const addr = customer.addresses[0]!;
  const addrSnapshot = {
    name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2,
    city: addr.city, state: addr.state, pincode: addr.pincode,
  } satisfies Prisma.JsonObject;

  const v1 = products[0]!.variants[1]!; // Ajrakh kurti, S
  const v2 = products[4]!.variants[0]!; // Ajrakh corset
  const order1Subtotal = v1.price * 1 + v2.price * 1;
  const shipping = order1Subtotal >= inr(1499) ? 0 : inr(79);
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "PRC-2026-0001",
      userId: customer.id,
      status: "DELIVERED",
      subtotal: order1Subtotal,
      discount: 0,
      shipping,
      tax: 0,
      total: order1Subtotal + shipping,
      paymentStatus: "PAID",
      paymentMethod: "RAZORPAY",
      shippingAddress: addrSnapshot,
      items: {
        create: [
          { variantId: v1.id, productName: products[0]!.name, sku: v1.sku, size: v1.size, color: v1.color, qty: 1, unitPrice: v1.price },
          { variantId: v2.id, productName: products[4]!.name, sku: v2.sku, size: v2.size, color: v2.color, qty: 1, unitPrice: v2.price },
        ],
      },
      timeline: {
        create: [
          { status: "PLACED", note: "Order placed" },
          { status: "PACKED", note: "Packed at warehouse" },
          { status: "SHIPPED", note: "Handed to courier" },
          { status: "DELIVERED", note: "Delivered" },
        ],
      },
      payment: {
        create: { provider: "razorpay", providerOrderId: "order_seed0001", providerPaymentId: "pay_seed0001", amount: order1Subtotal + shipping, status: "PAID" },
      },
    },
  });

  const v3 = products[10]!.variants[2]!; // Dabu office shirt, M
  const order2Subtotal = v3.price * 2;
  await prisma.order.create({
    data: {
      orderNumber: "PRC-2026-0002",
      userId: customer.id,
      status: "SHIPPED",
      subtotal: order2Subtotal,
      shipping: 0,
      total: order2Subtotal,
      paymentStatus: "PAID",
      paymentMethod: "RAZORPAY",
      shippingAddress: addrSnapshot,
      items: { create: [{ variantId: v3.id, productName: products[10]!.name, sku: v3.sku, size: v3.size, color: v3.color, qty: 2, unitPrice: v3.price }] },
      timeline: { create: [{ status: "PLACED", note: "Order placed" }, { status: "PACKED" }, { status: "SHIPPED", note: "In transit" }] },
      payment: { create: { provider: "razorpay", providerOrderId: "order_seed0002", providerPaymentId: "pay_seed0002", amount: order2Subtotal, status: "PAID" } },
    },
  });
  void order1;

  // ── Reviews ─────────────────────────────────────────────
  await prisma.review.create({
    data: { productId: products[0]!.id, userId: customer.id, rating: 5, title: "Stunning indigo", body: "The colour is even deeper in person. Worth every rupee.", status: "APPROVED" },
  });
  await prisma.product.update({ where: { id: products[0]!.id }, data: { ratingAvg: 5, ratingCount: 1 } });

  // ── Banners ─────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      { title: "The Indigo Chapter", subtitle: "Hand-blocked Ajrakh, dyed by the river in Kutch.", image: img("banner-hero"), ctaLabel: "Shop the edit", ctaHref: "/collections/indigo-edit", placement: "home_hero", position: 0, active: true },
      { title: "Free shipping over ₹1499", image: img("banner-strip"), placement: "strip", position: 0, active: true },
    ],
  });

  // ── Journal ─────────────────────────────────────────────
  await prisma.journalPost.createMany({
    data: [
      { title: "Sixteen Hands: The Making of Ajrakh", slug: "making-of-ajrakh", excerpt: "Inside the sixteen-step process behind every Ajrakh cloth.", body: "Long-form story about the Khatri artisans of Ajrakhpur…", coverImage: img("journal-ajrakh"), author: "Parchhai Studio", tags: ["craft", "ajrakh"], status: "PUBLISHED", publishedAt: new Date() },
      { title: "Why Mud Makes the Most Beautiful Patterns", slug: "dabu-mud-resist", excerpt: "The unlikely beauty of mud-resist Dabu printing.", body: "Long-form story about Dabu…", coverImage: img("journal-dabu"), author: "Parchhai Studio", tags: ["craft", "dabu"], status: "PUBLISHED", publishedAt: new Date() },
    ],
  });

  // ── Shipping ────────────────────────────────────────────
  const zone = await prisma.shippingZone.create({ data: { name: "India — All India" } });
  await prisma.shippingRate.createMany({
    data: [
      { zoneId: zone.id, label: "Standard", minSubtotal: 0, price: inr(79), freeAbove: inr(1499), etaDays: 5 },
      { zoneId: zone.id, label: "Express", minSubtotal: 0, price: inr(199), etaDays: 2 },
    ],
  });
  await prisma.pincodeServiceability.createMany({
    data: [
      { pincode: "500034", city: "Hyderabad", state: "Telangana", serviceable: true, codAvailable: true, etaDays: 4 },
      { pincode: "110001", city: "New Delhi", state: "Delhi", serviceable: true, codAvailable: true, etaDays: 3 },
      { pincode: "400001", city: "Mumbai", state: "Maharashtra", serviceable: true, codAvailable: true, etaDays: 3 },
      { pincode: "682001", city: "Kochi", state: "Kerala", serviceable: true, codAvailable: false, etaDays: 6 },
    ],
  });

  // ── Settings ────────────────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { key: "store", value: { name: "Parchhai", currency: "INR", supportEmail: "hello@parchhai.example", supportPhone: "+919000000000" } },
      { key: "tax", value: { gstPercent: 5, inclusive: true } },
      { key: "checkout", value: { codEnabled: true, minOrder: 0 } },
    ],
  });

  console.log("✅ Seed complete.");
  console.log("   Admin login:    admin@parchhai.example / Password123!");
  console.log("   Customer login: aanya@example.com / Password123!");
  void newArrivals;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

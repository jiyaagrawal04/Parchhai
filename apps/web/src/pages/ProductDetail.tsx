import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAddToCart, useProduct, useProductReviews, useProducts, useToggleWishlist } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";
import { api, apiError } from "@/lib/api";
import { formatINR, cx } from "@/lib/format";
import { PageLoader } from "@/components/ui";
import { MIcon } from "@/components/Reveal";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

const WASH_CARE = [
  { icon: "wash", label: "Gentle hand wash" },
  { icon: "wb_cloudy", label: "Dry in shade" },
  { icon: "iron", label: "Iron on low" },
  { icon: "block", label: "Do not bleach" },
];

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { data: p, isLoading } = useProduct(slug);
  const { data: reviews } = useProductReviews(slug);
  const { data: relatedData } = useProducts({ pageSize: 8, sort: "popular" });
  const { data: recentData } = useProducts({ pageSize: 8, sort: "newest" });
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { user } = useAuth();
  const { showToast, openCart, openLogin } = useUI();

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [msg, setMsg] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState("");
  const [wished, setWished] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [findSize, setFindSize] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const selectedColor = color || p?.colors[0] || "";
  const variant = useMemo(
    () => p?.variants.find((v) => v.color === selectedColor && v.size === size),
    [p, selectedColor, size],
  );
  const orderedSizes = useMemo(() => (p ? sortSizes(p.sizes) : []), [p]);
  const maxQty = Math.max(1, variant?.stock ?? 1);

  if (isLoading) return <PageLoader />;
  if (!p) return <div className="container-px py-20">Product not found.</div>;

  const price = variant?.price ?? p.basePrice;

  const add = async () => {
    if (!variant) {
      setMsg("Please select a size.");
      return;
    }
    setMsg("");
    try {
      await addToCart.mutateAsync({ variantId: variant.id, qty });
      showToast("Added to bag ✓");
      openCart();
    } catch (e) {
      setMsg(apiError(e));
    }
  };

  const toggleWish = () => {
    if (!user) {
      openLogin();
      return;
    }
    if (variant) {
      toggleWishlist.mutate(variant.id);
      setWished((w) => !w);
    }
  };

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) return setPincodeResult("Enter a 6-digit pincode");
    try {
      const { data } = await api.get("/catalog/pincode", { params: { pincode } });
      const r = data.data;
      setPincodeResult(
        r.serviceable
          ? `Delivers in ~${r.etaDays} days${r.codAvailable ? " · COD available · 7-day exchange" : " · 7-day exchange"}`
          : "Sorry, not serviceable at this pincode",
      );
    } catch (e) {
      setPincodeResult(apiError(e));
    }
  };

  const related = (relatedData?.items ?? []).filter((x) => x.slug !== p.slug).slice(0, 4);
  const recent = (recentData?.items ?? []).filter((x) => x.slug !== p.slug).slice(0, 4);

  const media = [
    ...p.images.map((im) => ({ type: "image" as const, url: im.url, id: im.id })),
    ...(p.videoUrl ? [{ type: "video" as const, url: p.videoUrl, id: "video" }] : []),
  ];
  const activeMedia = media[activeImg] ?? media[0];

  return (
    <div className="pb-24 md:pb-0">
      {/* Breadcrumb */}
      <div className="container-px py-4 label-caps text-[11px] text-on-surface-variant">
        <Link to="/" className="hover:text-secondary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-secondary">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-on-surface">{p.name}</span>
      </div>

      {/* MAIN */}
      <div className="container-px grid grid-cols-1 gap-8 pb-16 md:grid-cols-12 md:gap-16">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            {media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
                {media.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveImg(i)}
                    className={cx("relative h-24 w-20 shrink-0 overflow-hidden border-2 transition-opacity", i === activeImg ? "border-primary opacity-100" : "border-transparent opacity-60")}
                  >
                    {m.type === "image" ? (
                      <img src={m.url} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary">
                        <MIcon name="play_circle" className="text-2xl text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 bg-surface-container-high">
              {activeMedia?.type === "video" ? (
                <video src={activeMedia.url} controls playsInline className="aspect-[3/4] h-auto w-full bg-black object-contain" />
              ) : activeMedia ? (
                <div className="slow-zoom cursor-zoom-in" onClick={() => setLightbox(activeMedia.url)}>
                  <img src={activeMedia.url} alt={p.name} className="aspect-[3/4] h-auto w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-on-surface-variant">No image</div>
              )}
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div className="md:col-span-5">
          {p.craft && <p className="label-caps text-secondary">{p.craft.name} · Hand-Blocked</p>}
          <h1 className="mt-3 font-headline-lg text-3xl text-primary md:text-4xl">{p.name}</h1>

          {p.ratingCount > 0 && (
            <p className="mt-3 text-sm text-on-surface-variant"><span className="text-secondary">★</span> {p.ratingAvg.toFixed(1)} ({p.ratingCount} reviews)</p>
          )}

          <p className="mt-4 font-headline-md text-2xl text-primary">{formatINR(price)}</p>
          <p className="mt-1 label-caps text-[11px] text-on-surface-variant">MRP incl. of all taxes</p>

          {p.description && <p className="mt-6 leading-relaxed text-on-surface-variant">{p.description}</p>}

          {/* Colours */}
          {p.colors.length > 1 && (
            <div className="mt-8">
              <p className="label-caps mb-3">Colour — <span className="font-normal normal-case tracking-normal text-on-surface-variant">{selectedColor}</span></p>
              <div className="flex gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => { setColor(c); setSize(""); }} className={cx("border px-4 py-2 text-sm transition-colors", c === selectedColor ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-caps">Size</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setSizeGuide(true)} className="label-caps text-[11px] text-on-surface-variant underline underline-offset-4 hover:text-secondary">Size guide</button>
                <button onClick={() => setFindSize(true)} className="label-caps text-[11px] text-secondary underline underline-offset-4">Find my size</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {orderedSizes.map((s) => {
                const v = p.variants.find((x) => x.color === selectedColor && x.size === s);
                const disabled = !v || v.stock === 0;
                return (
                  <button
                    key={s}
                    disabled={disabled}
                    onClick={() => { setSize(s); setQty(1); }}
                    className={cx("flex h-12 w-14 items-center justify-center border text-sm transition-colors", size === s ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary", disabled && "cursor-not-allowed border-outline-variant text-outline-variant line-through")}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {variant && variant.stock <= 5 && variant.stock > 0 && (
              <p className="mt-3 flex items-center gap-1 text-[12px] text-secondary"><MIcon name="local_fire_department" className="text-[16px]" /> Only {variant.stock} left</p>
            )}
          </div>

          {/* Quantity + Add to bag */}
          <div className="mt-8 flex items-end gap-4">
            <div>
              <p className="label-caps mb-3">Quantity</p>
              <div className="flex h-12 w-32 items-center border border-outline">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full flex-1 items-center justify-center hover:bg-surface-container"><MIcon name="remove" className="text-[18px]" /></button>
                <span className="w-10 text-center">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="flex h-full flex-1 items-center justify-center hover:bg-surface-container"><MIcon name="add" className="text-[18px]" /></button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={add} disabled={addToCart.isPending} className="flex-1 bg-primary py-4 label-caps text-white transition-opacity hover:opacity-90 disabled:opacity-50">Add to Bag</button>
            <button onClick={toggleWish} aria-label="Wishlist" className={cx("flex w-14 items-center justify-center border border-outline transition-colors hover:border-secondary hover:text-secondary", wished && "border-secondary text-secondary")}>
              <MIcon name="favorite" fill={wished} />
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-secondary">{msg}</p>}

          {/* Delivery */}
          <div className="mt-8 border border-outline-variant p-5">
            <p className="label-caps mb-3 flex items-center gap-2"><MIcon name="local_shipping" className="text-[18px]" /> Delivery &amp; Returns</p>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} inputMode="numeric" placeholder="Enter 6-digit pincode" className="flex-1 border-b border-outline bg-transparent py-3 text-sm outline-none focus:border-primary" />
              <button onClick={checkPincode} className="bg-primary px-6 label-caps text-[11px] text-on-primary hover:opacity-90">Check</button>
            </div>
            {pincodeResult && <p className="mt-4 flex items-center gap-2 text-sm"><MIcon name="event_available" className="text-[18px] text-secondary" /> {pincodeResult}</p>}
          </div>

          {/* Fabric & details */}
          {(p.fabric || p.artisanCluster) && (
            <div className="mt-8">
              <p className="label-caps mb-4">Fabric &amp; Details</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {p.fabric && <div><p className="label-caps text-[10px] text-on-surface-variant">Fabric</p><p className="text-sm">{p.fabric}</p></div>}
                {p.artisanCluster && <div><p className="label-caps text-[10px] text-on-surface-variant">Artisan cluster</p><p className="text-sm">{p.artisanCluster}</p></div>}
              </div>
            </div>
          )}

          {/* Wash care */}
          <div className="mt-8 border-t border-outline-variant/40 pt-8">
            <p className="label-caps mb-4">Wash Care</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {WASH_CARE.map((w) => (
                <div key={w.label} className="flex flex-col items-center gap-2">
                  <MIcon name={w.icon} className="text-primary" />
                  <span className="label-caps text-[10px] tracking-tight text-on-surface-variant">{w.label}</span>
                </div>
              ))}
            </div>
            {p.careInstructions && <p className="mt-4 text-sm text-on-surface-variant">{p.careInstructions}</p>}
          </div>

          {/* Accordion */}
          <div className="mt-8 border-t border-outline-variant/40">
            <Accordion title="Description & styling" open>{p.description || "A hand-block printed piece, designed to be mixed, matched, and layered."}</Accordion>
            <Accordion title="Fabric & care">{[p.fabric, p.careInstructions].filter(Boolean).join(" · ") || "Naturally dyed cotton. Gentle hand wash, dry in shade."}</Accordion>
            <Accordion title="Shipping & exchange">Dispatched in 24–48 hours. Free shipping on orders over ₹999. No returns — easy 7-day exchange on unworn items with tags intact.</Accordion>
          </div>
        </div>
      </div>

      {/* Craft authenticity strip */}
      {p.craft && (
        <section className="bg-tertiary px-5 py-16 text-white md:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3">
            <div>
              <p className="label-caps text-[11px] opacity-70">The Craft</p>
              <h3 className="mt-2 font-headline-md text-2xl">Genuine {p.craft.name}</h3>
              <p className="mt-2 text-sm opacity-80">Resist-printed and naturally dyed by hand — a craft passed down through generations.</p>
            </div>
            <div>
              <p className="label-caps text-[11px] opacity-70">Each piece is unique</p>
              <p className="mt-2 text-sm opacity-80">Printed block by block. Slight variations in the print are the artisan's signature, never a flaw.</p>
            </div>
            <div className="md:text-right">
              <Link to={`/crafts/${p.craft.slug}`} className="inline-flex items-center gap-2 label-caps border-b border-white pb-1 hover:opacity-70">
                Meet the artisans <MIcon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" className="container-px py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Ratings &amp; Reviews</h2>
        </div>
        {reviews && reviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="border border-outline/10 bg-surface-container-low p-5">
                <p className="text-secondary">{"★".repeat(r.rating)}<span className="text-outline-variant">{"★".repeat(5 - r.rating)}</span></p>
                {r.title && <p className="mt-2 font-serif text-lg text-primary">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm text-on-surface-variant">{r.body}</p>}
                <p className="mt-3 label-caps text-[10px] text-on-surface-variant">— {r.author}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low p-8 text-center md:p-12">
            <MIcon name="reviews" className="mb-3 text-4xl text-secondary" />
            <h3 className="font-headline-md text-xl text-primary">Be the first to review this piece</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">No reviews yet. Bought this? Share your thoughts from your orders.</p>
          </div>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && <ProductRail title="Complete the Look" items={related} />}
      {recent.length > 0 && <ProductRail title="Recently Viewed" items={recent} />}

      {/* Sticky mobile add-to-cart */}
      <div className="fixed bottom-0 left-0 z-40 flex w-full items-center gap-3 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:hidden">
        <div className="leading-tight">
          <p className="font-headline-md text-lg text-primary">{formatINR(price)}</p>
          <p className="label-caps text-[10px] text-on-surface-variant">Size: {size || "—"}</p>
        </div>
        <button onClick={add} disabled={addToCart.isPending} className="flex-1 bg-primary py-3.5 label-caps text-white disabled:opacity-50">Add to Bag</button>
      </div>

      {/* Size guide modal */}
      {sizeGuide && (
        <Modal onClose={() => setSizeGuide(false)}>
          <h3 className="font-headline-md text-2xl text-primary">Size Guide</h3>
          <p className="label-caps mt-1 text-[11px] text-on-surface-variant">All measurements in inches</p>
          <table className="mt-6 w-full border-collapse text-sm">
            <thead><tr className="border-b border-outline">{["Size", "Bust", "Waist", "Length"].map((h) => <th key={h} className="py-2 text-left label-caps text-[11px]">{h}</th>)}</tr></thead>
            <tbody>
              {[["XS", 30, 24, 37], ["S", 32, 26, 37.5], ["M", 34, 28, 38], ["L", 36, 30, 38.5], ["XL", 38, 32, 39]].map((row) => (
                <tr key={row[0]} className="border-b border-outline-variant/40">{row.map((c, i) => <td key={i} className="py-2">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-sm text-on-surface-variant">Bust — around the fullest part. Waist — narrowest part. When between sizes, size down for a closer fit.</p>
        </Modal>
      )}

      {/* Find my size modal */}
      {findSize && (
        <Modal onClose={() => setFindSize(false)}>
          <h3 className="font-headline-md text-2xl text-primary">Find My Size</h3>
          <p className="mt-2 text-sm text-on-surface-variant">Answer three quick questions and we'll suggest your best fit.</p>
          <div className="mt-6 space-y-4">
            <label className="block"><span className="label-caps text-[11px] text-on-surface-variant">Height</span><input className="mt-1 w-full border-b border-outline bg-transparent py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. 5'5&quot;" /></label>
            <label className="block"><span className="label-caps text-[11px] text-on-surface-variant">Weight (kg)</span><input type="number" className="mt-1 w-full border-b border-outline bg-transparent py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. 58" /></label>
            <label className="block"><span className="label-caps text-[11px] text-on-surface-variant">Fit preference</span><select className="mt-1 w-full border-b border-outline bg-transparent py-2.5 text-sm outline-none focus:border-primary"><option>Fitted</option><option>Regular</option><option>Relaxed</option></select></label>
          </div>
          <button onClick={() => setFindSize(false)} className="mt-6 w-full bg-primary py-3.5 label-caps text-on-primary">Suggest my size</button>
          <p className="mt-3 text-center label-caps text-[10px] text-on-surface-variant">Recommendation engine coming soon.</p>
        </Modal>
      )}

      {/* Lightbox */}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function Accordion({ title, children, open }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-outline-variant/40 py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between label-caps">
        <span>{title}</span>
        <MIcon name="add" className="transition-transform group-open:rotate-45" />
      </summary>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{children}</p>
    </details>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  return (
    <div className={cx("animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm", closing && "closing")} onClick={close}>
      <div className="animate-float relative max-h-[85vh] w-full max-w-lg overflow-y-auto bg-surface p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute right-4 top-4"><MIcon name="close" /></button>
        {children}
      </div>
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  return (
    <div className={cx("animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4", closing && "closing")} onClick={close}>
      <MIcon name="close" className="absolute right-6 top-6 cursor-pointer text-3xl text-white" />
      <img src={src} alt="" className="animate-float max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function ProductRail({ title, items }: { title: string; items: { id: string; slug: string; name: string; image: string | null; basePrice: number }[] }) {
  return (
    <section className="overflow-hidden py-12">
      <h2 className="container-px mb-10 font-headline-lg text-3xl text-primary md:text-headline-lg">{title}</h2>
      <div className="no-scrollbar container-px flex gap-gutter overflow-x-auto pb-4">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.slug}`} className="group w-[240px] shrink-0 md:w-[280px]">
            <div className="slow-zoom mb-4 aspect-[3/4] bg-surface-container">
              {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
            </div>
            <h4 className="mb-1 text-sm text-primary group-hover:underline">{p.name}</h4>
            <p className="label-caps text-on-surface-variant">{formatINR(p.basePrice)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { craftOf, getProduct, isInStock, relatedTo, sizeAvailable, type Product } from "@/data/catalog";
import { FREE_SHIPPING_OVER } from "@/data/site";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatINR, cx } from "@/lib/format";
import { MIcon } from "@/components/Reveal";

const WASH_CARE = [
  { icon: "wash", label: "Gentle hand wash" },
  { icon: "wb_cloudy", label: "Dry in shade" },
  { icon: "iron", label: "Iron on low" },
  { icon: "block", label: "Do not bleach" },
];

const SIZE_GUIDE: [string, number, number, number][] = [
  ["XS", 30, 24, 37],
  ["S", 32, 26, 37.5],
  ["M", 34, 28, 38],
  ["L", 36, 30, 38.5],
  ["XL", 38, 32, 39],
];

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const p = getProduct(slug);
  const add = useCart((s) => s.add);
  const { showToast, openCart } = useUI();

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [msg, setMsg] = useState("");
  const [sizeGuide, setSizeGuide] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Reset selections when navigating between products.
  useEffect(() => {
    setColor("");
    setSize("");
    setQty(1);
    setActiveImg(0);
    setMsg("");
  }, [slug]);

  if (!p) {
    return (
      <div className="container-px py-20 text-center">
        <h1 className="font-headline-md text-2xl text-primary">Product not found</h1>
        <Link to="/shop" className="btn-primary mt-6">Back to shop</Link>
      </div>
    );
  }

  const craft = craftOf(p);
  const selectedColor = color || p.colors[0] || "";
  const inStock = isInStock(p);
  const related = relatedTo(p, 4);
  const activeImage = p.images[activeImg] ?? p.images[0];

  const addToBag = () => {
    if (!inStock) return setMsg("This piece is sold out.");
    if (!size) return setMsg("Please select a size.");
    if (!sizeAvailable(p, size)) return setMsg("That size is sold out.");
    setMsg("");
    add({ slug: p.slug, color: selectedColor, size, qty });
    showToast("Added to bag");
    openCart();
  };

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

      <div className="container-px grid grid-cols-1 gap-8 pb-16 md:grid-cols-12 md:gap-16">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            {p.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
                {p.images.map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => setActiveImg(i)}
                    className={cx("relative h-24 w-20 shrink-0 overflow-hidden border-2 transition-opacity", i === activeImg ? "border-primary opacity-100" : "border-transparent opacity-60")}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 bg-surface-container-high">
              {activeImage ? (
                <div className="slow-zoom cursor-zoom-in" onClick={() => setLightbox(activeImage)}>
                  <img src={activeImage} alt={p.name} className="aspect-[3/4] h-auto w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-on-surface-variant">No image</div>
              )}
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div className="md:col-span-5">
          {craft && <p className="label-caps text-secondary">{craft.name} · Hand-Blocked</p>}
          <h1 className="mt-3 font-headline-lg text-3xl text-primary md:text-4xl">{p.name}</h1>
          <p className="mt-4 font-headline-md text-2xl text-primary">{formatINR(p.price)}</p>
          <p className="mt-1 label-caps text-[11px] text-on-surface-variant">MRP incl. of all taxes</p>
          <p className="mt-6 leading-relaxed text-on-surface-variant">{p.description}</p>

          {/* Colours */}
          {p.colors.length > 1 && (
            <div className="mt-8">
              <p className="label-caps mb-3">Colour <span className="font-normal normal-case tracking-normal text-on-surface-variant">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={cx("border px-4 py-2 text-sm transition-colors", c === selectedColor ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary")}>
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
              <button onClick={() => setSizeGuide(true)} className="label-caps text-[11px] text-on-surface-variant underline underline-offset-4 hover:text-secondary">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {p.sizes.map((s) => {
                const disabled = !sizeAvailable(p, s);
                return (
                  <button
                    key={s}
                    disabled={disabled}
                    onClick={() => { setSize(s); setMsg(""); }}
                    className={cx("flex h-12 w-14 items-center justify-center border text-sm transition-colors", size === s ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary", disabled && "cursor-not-allowed border-outline-variant text-outline-variant line-through")}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {!inStock && <p className="mt-3 text-sm text-secondary">Sold out. DM us on Instagram to ask about a restock.</p>}
          </div>

          {/* Quantity */}
          <div className="mt-8">
            <p className="label-caps mb-3">Quantity</p>
            <div className="flex h-12 w-32 items-center border border-outline">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full flex-1 items-center justify-center hover:bg-surface-container"><MIcon name="remove" className="text-[18px]" /></button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="flex h-full flex-1 items-center justify-center hover:bg-surface-container"><MIcon name="add" className="text-[18px]" /></button>
            </div>
          </div>

          <button onClick={addToBag} disabled={!inStock} className="mt-6 w-full bg-secondary py-4 label-caps text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {inStock ? "Add to Bag" : "Sold out"}
          </button>
          {msg && <p className="mt-3 text-sm text-secondary">{msg}</p>}
          <p className="mt-3 text-center text-[12px] text-on-surface-variant">Orders are placed in a DM on Instagram. No account needed.</p>

          {/* Delivery */}
          <div className="mt-8 border border-outline-variant p-5">
            <p className="label-caps mb-3 flex items-center gap-2"><MIcon name="local_shipping" className="text-[18px]" /> Delivery &amp; Exchange</p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2"><MIcon name="event_available" className="text-[18px] text-secondary" /> Dispatched in 24 to 48 hours, delivered across India in 3 to 7 days.</li>
              <li className="flex items-center gap-2"><MIcon name="redeem" className="text-[18px] text-secondary" /> Free shipping on orders over {formatINR(FREE_SHIPPING_OVER)}.</li>
              <li className="flex items-center gap-2"><MIcon name="swap_horiz" className="text-[18px] text-secondary" /> Easy 7-day exchange on unworn pieces with tags intact.</li>
            </ul>
          </div>

          {/* Fabric & details */}
          <div className="mt-8">
            <p className="label-caps mb-4">Fabric &amp; Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {p.fabric && <div><p className="label-caps text-[10px] text-on-surface-variant">Fabric</p><p className="text-sm">{p.fabric}</p></div>}
              {craft && <div><p className="label-caps text-[10px] text-on-surface-variant">Artisan cluster</p><p className="text-sm">{craft.region}</p></div>}
            </div>
          </div>

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
            {p.care && <p className="mt-4 text-sm text-on-surface-variant">{p.care}</p>}
          </div>
        </div>
      </div>

      {/* Craft authenticity strip */}
      {craft && (
        <section className="bg-tertiary px-5 py-16 text-white md:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3">
            <div>
              <p className="label-caps text-[11px] opacity-70">The Craft</p>
              <h3 className="mt-2 font-headline-md text-2xl">Genuine {craft.name}</h3>
              <p className="mt-2 text-sm opacity-80">Resist-printed and naturally dyed by hand, a craft passed down through generations.</p>
            </div>
            <div>
              <p className="label-caps text-[11px] opacity-70">Each piece is unique</p>
              <p className="mt-2 text-sm opacity-80">Printed block by block. Slight variations in the print are the artisan's signature, never a flaw.</p>
            </div>
            <div className="md:text-right">
              <Link to={`/crafts/${craft.slug}`} className="inline-flex items-center gap-2 label-caps border-b border-white pb-1 hover:opacity-70">
                Meet the artisans <MIcon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && <ProductRail title="Complete the Look" items={related} />}

      {/* Sticky mobile add-to-cart */}
      <div className="fixed bottom-0 left-0 z-40 flex w-full items-center gap-3 border-t border-outline-variant bg-surface-container-lowest px-5 py-3 md:hidden">
        <div className="leading-tight">
          <p className="font-headline-md text-lg text-primary">{formatINR(p.price)}</p>
          <p className="label-caps text-[10px] text-on-surface-variant">Size: {size || "Select"}</p>
        </div>
        <button onClick={addToBag} disabled={!inStock} className="flex-1 bg-secondary py-3.5 label-caps text-white disabled:opacity-50">{inStock ? "Add to Bag" : "Sold out"}</button>
      </div>

      {sizeGuide && (
        <Modal onClose={() => setSizeGuide(false)}>
          <h3 className="font-headline-md text-2xl text-primary">Size Guide</h3>
          <p className="label-caps mt-1 text-[11px] text-on-surface-variant">All measurements in inches</p>
          <table className="mt-6 w-full border-collapse text-sm">
            <thead><tr className="border-b border-outline">{["Size", "Bust", "Waist", "Length"].map((h) => <th key={h} className="py-2 text-left label-caps text-[11px]">{h}</th>)}</tr></thead>
            <tbody>
              {SIZE_GUIDE.map((row) => (
                <tr key={row[0]} className="border-b border-outline-variant/40">{row.map((c, i) => <td key={i} className="py-2">{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-sm text-on-surface-variant">Bust: around the fullest part. Waist: narrowest part. When between sizes, size down for a closer fit. Unsure? Ask us in the Instagram DM when you order.</p>
        </Modal>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 220); };
  return (
    <div className={cx("animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm", closing && "closing")} onClick={close}>
      <div className="animate-float relative max-h-[85vh] w-full max-w-lg overflow-y-auto bg-surface p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} className="absolute right-4 top-4" aria-label="Close"><MIcon name="close" /></button>
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

function ProductRail({ title, items }: { title: string; items: Product[] }) {
  return (
    <section className="overflow-hidden py-12">
      <h2 className="container-px mb-10 font-headline-lg text-3xl text-primary md:text-headline-lg">{title}</h2>
      <div className="no-scrollbar container-px flex gap-gutter overflow-x-auto pb-4">
        {items.map((p) => (
          <Link key={p.slug} to={`/product/${p.slug}`} className="group w-[240px] shrink-0 md:w-[280px]">
            <div className="slow-zoom mb-4 aspect-[3/4] bg-surface-container">
              {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
            </div>
            <h4 className="mb-1 text-sm text-primary group-hover:underline">{p.name}</h4>
            <p className="label-caps text-on-surface-variant">{formatINR(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

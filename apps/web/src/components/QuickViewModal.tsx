import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAddToCart, useProduct } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { formatINR, cx } from "@/lib/format";
import { Modal } from "@/components/Overlay";

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

export function QuickViewModal({ slug }: { slug: string }) {
  const { closeQuickView, showToast, openCart } = useUI();
  const { data: p, isLoading } = useProduct(slug);
  const addToCart = useAddToCart();
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedColor = color || p?.colors[0] || "";
  const variant = useMemo(() => p?.variants.find((v) => v.color === selectedColor && v.size === size), [p, selectedColor, size]);
  const sizes = useMemo(() => (p ? sortSizes(p.sizes) : []), [p]);

  const add = async () => {
    if (!variant) return;
    setBusy(true);
    try {
      await addToCart.mutateAsync({ variantId: variant.id, qty: 1 });
      closeQuickView();
      showToast("Added to bag ✓");
      openCart();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={closeQuickView} className="w-full max-w-3xl p-0">
      {isLoading || !p ? (
        <div className="p-16 text-center text-on-surface-variant">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-[3/4] bg-surface-container">
            {p.images[0] && <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />}
          </div>
          <div className="p-6 md:p-8">
            {p.craft && <p className="label-caps text-secondary">{p.craft.name} · Hand-Blocked</p>}
            <h2 className="mt-2 font-headline-md text-2xl text-primary">{p.name}</h2>
            <p className="mt-3 font-headline-md text-xl text-primary">{formatINR(variant?.price ?? p.basePrice)}</p>
            {p.description && <p className="mt-4 line-clamp-3 text-sm text-on-surface-variant">{p.description}</p>}

            {p.colors.length > 1 && (
              <div className="mt-5">
                <p className="label-caps mb-2">Colour — <span className="font-normal normal-case tracking-normal text-on-surface-variant">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {p.colors.map((c) => (
                    <button key={c} onClick={() => { setColor(c); setSize(""); }} className={cx("border px-3 py-1.5 text-sm", c === selectedColor ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary")}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <p className="label-caps mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const v = p.variants.find((x) => x.color === selectedColor && x.size === s);
                  const disabled = !v || v.stock === 0;
                  return (
                    <button key={s} disabled={disabled} onClick={() => setSize(s)} className={cx("flex h-11 w-12 items-center justify-center border text-sm", size === s ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary", disabled && "cursor-not-allowed border-outline-variant text-outline-variant line-through")}>{s}</button>
                  );
                })}
              </div>
            </div>

            <button onClick={add} disabled={busy || !variant} className="mt-6 w-full bg-primary py-3.5 label-caps text-white transition-opacity hover:opacity-90 disabled:opacity-50">
              {variant ? "Add to Bag" : "Select a size"}
            </button>
            <Link to={`/product/${p.slug}`} onClick={closeQuickView} className="mt-3 block text-center label-caps text-[11px] text-on-surface-variant hover:text-secondary">View full details</Link>
          </div>
        </div>
      )}
    </Modal>
  );
}

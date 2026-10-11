import { useState } from "react";
import { Link } from "react-router-dom";
import { craftOf, getProduct, sizeAvailable } from "@/data/catalog";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatINR, cx } from "@/lib/format";
import { Modal } from "@/components/Overlay";

export function QuickViewModal({ slug }: { slug: string }) {
  const { closeQuickView, showToast, openCart } = useUI();
  const add = useCart((s) => s.add);
  const p = getProduct(slug);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  if (!p) return null;
  const craft = craftOf(p);
  const selectedColor = color || p.colors[0] || "";
  const canAdd = Boolean(size) && sizeAvailable(p, size);

  const addToBag = () => {
    if (!canAdd) return;
    add({ slug: p.slug, color: selectedColor, size, qty: 1 });
    closeQuickView();
    showToast("Added to bag");
    openCart();
  };

  return (
    <Modal onClose={closeQuickView} className="w-full max-w-3xl p-0">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-[3/4] bg-surface-container">
          {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />}
        </div>
        <div className="p-6 md:p-8">
          {craft && <p className="label-caps text-secondary">{craft.name} · Hand-Blocked</p>}
          <h2 className="mt-2 font-headline-md text-2xl text-primary">{p.name}</h2>
          <p className="mt-3 font-headline-md text-xl text-primary">{formatINR(p.price)}</p>
          <p className="mt-4 line-clamp-3 text-sm text-on-surface-variant">{p.description}</p>

          {p.colors.length > 1 && (
            <div className="mt-5">
              <p className="label-caps mb-2">Colour <span className="font-normal normal-case tracking-normal text-on-surface-variant">{selectedColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={cx("border px-3 py-1.5 text-sm", c === selectedColor ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary")}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="label-caps mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => {
                const disabled = !sizeAvailable(p, s);
                return (
                  <button key={s} disabled={disabled} onClick={() => setSize(s)} className={cx("flex h-11 w-12 items-center justify-center border text-sm", size === s ? "border-primary bg-primary text-on-primary" : "border-outline hover:border-primary", disabled && "cursor-not-allowed border-outline-variant text-outline-variant line-through")}>{s}</button>
                );
              })}
            </div>
          </div>

          <button onClick={addToBag} disabled={!canAdd} className="mt-6 w-full bg-secondary py-3.5 label-caps text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {canAdd ? "Add to Bag" : "Select a size"}
          </button>
          <Link to={`/product/${p.slug}`} onClick={closeQuickView} className="mt-3 block text-center label-caps text-[11px] text-on-surface-variant hover:text-secondary">View full details</Link>
        </div>
      </div>
    </Modal>
  );
}

import { useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { cartShipping, cartSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { Drawer } from "@/components/Overlay";
import { CouponList } from "@/components/Offers";

export function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const { items, setQty, remove } = useCart();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);

  const go = (path: string) => {
    closeCart();
    navigate(path);
  };

  return (
    <Drawer title="Your Bag" onClose={closeCart}>
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-on-surface-variant">Your bag is empty.</p>
          <button onClick={() => go("/shop")} className="btn-primary">Shop now</button>
        </div>
      ) : (
        <>
          <div className="flex-1 divide-y divide-outline-variant/40 overflow-y-auto px-6">
            {items.map((it) => (
              <div key={it.key} className="flex gap-4 py-5">
                <div className="h-28 w-24 shrink-0 bg-surface-container">
                  {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-serif text-base text-primary">{it.name}</p>
                      <p className="text-sm text-on-surface-variant">{it.color} · {it.size}</p>
                    </div>
                    <button onClick={() => remove(it.key)} aria-label="Remove" className="text-on-surface-variant hover:text-secondary"><X size={18} /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-outline">
                      <button onClick={() => setQty(it.key, it.qty - 1)} className="px-3 py-1.5 hover:text-secondary"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm">{it.qty}</span>
                      <button onClick={() => setQty(it.key, it.qty + 1)} className="px-3 py-1.5 hover:text-secondary"><Plus size={14} /></button>
                    </div>
                    <p className="font-semibold">{formatINR(it.price * it.qty)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant px-6 py-5">
            <CouponList className="mb-5" />
            <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span className="text-on-surface-variant">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
            <div className="mt-3 flex justify-between border-t border-outline-variant pt-3 text-lg font-semibold"><span>Total</span><span>{formatINR(subtotal + shipping)}</span></div>
            <button onClick={() => go("/checkout")} className="btn-primary mt-5 w-full">Place order on Instagram</button>
            <button onClick={() => go("/cart")} className="mt-3 block w-full text-center text-sm text-on-surface-variant hover:text-secondary">View bag</button>
          </div>
        </>
      )}
    </Drawer>
  );
}

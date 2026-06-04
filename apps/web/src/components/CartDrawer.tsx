import { useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { Drawer } from "@/components/Overlay";
import { CouponList } from "@/components/Offers";

const FREE_SHIP = 99900;
const SHIP_FEE = 7900;

export function CartDrawer() {
  const { cartOpen, closeCart, openLogin } = useUI();
  const { data: cart } = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const total = subtotal >= FREE_SHIP ? subtotal : subtotal + SHIP_FEE;

  const go = (path: string) => {
    closeCart();
    navigate(path, { state: { from: "/checkout" } });
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
              <div key={it.id} className="flex gap-4 py-5">
                <div className="h-28 w-24 shrink-0 bg-surface-container">
                  {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="font-serif text-base text-primary">{it.productName}</p>
                      <p className="text-sm text-on-surface-variant">{it.color} · {it.size}</p>
                    </div>
                    <button onClick={() => remove.mutate(it.id)} aria-label="Remove" className="text-on-surface-variant hover:text-secondary"><X size={18} /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-outline">
                      <button onClick={() => update.mutate({ id: it.id, qty: it.qty - 1 })} className="px-3 py-1.5 hover:text-secondary"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm">{it.qty}</span>
                      <button onClick={() => update.mutate({ id: it.id, qty: it.qty + 1 })} className="px-3 py-1.5 hover:text-secondary"><Plus size={14} /></button>
                    </div>
                    <p className="font-semibold">{formatINR(it.lineTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant px-6 py-5">
            <CouponList className="mb-5" />
            <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span className="text-on-surface-variant">Shipping</span><span>{subtotal >= FREE_SHIP ? "Free" : formatINR(SHIP_FEE)}</span></div>
            <div className="mt-3 flex justify-between border-t border-outline-variant pt-3 text-lg font-semibold"><span>Total</span><span>{formatINR(total)}</span></div>
            <button onClick={() => (user ? go("/checkout") : (closeCart(), openLogin("/checkout")))} className="btn-primary mt-5 w-full">{user ? "Checkout" : "Sign in to checkout"}</button>
            <button onClick={closeCart} className="mt-3 block w-full text-center text-sm text-on-surface-variant hover:text-secondary">Continue shopping</button>
          </div>
        </>
      )}
    </Drawer>
  );
}

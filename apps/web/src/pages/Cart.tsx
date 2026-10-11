import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { cartShipping, cartSubtotal, useCart } from "@/store/cart";
import { formatINR } from "@/lib/format";
import { Empty } from "@/components/ui";
import { CouponList } from "@/components/Offers";

export default function Cart() {
  const { items, setQty, remove } = useCart();
  const navigate = useNavigate();

  if (items.length === 0)
    return (
      <div className="container-px py-12">
        <h1 className="text-4xl text-indigo">Your bag</h1>
        <Empty title="Your bag is empty" hint="Discover hand-blocked pieces in the shop." />
        <div className="text-center"><Link to="/shop" className="btn-primary">Shop now</Link></div>
      </div>
    );

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);

  return (
    <div className="container-px py-12">
      <h1 className="text-4xl text-indigo">Your bag</h1>
      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_360px]">
        <div className="divide-y divide-line border-y border-line">
          {items.map((it) => (
            <div key={it.key} className="flex gap-4 py-5">
              <Link to={`/product/${it.slug}`} className="h-28 w-24 shrink-0 bg-line/40">
                {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <div>
                    <Link to={`/product/${it.slug}`} className="font-serif text-lg text-indigo hover:text-rust">{it.name}</Link>
                    <p className="text-sm text-muted">{it.color} · {it.size}</p>
                  </div>
                  <button onClick={() => remove(it.key)} aria-label="Remove" className="text-muted hover:text-rust"><X size={18} /></button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button onClick={() => setQty(it.key, it.qty - 1)} className="px-3 py-1.5 hover:text-rust"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm">{it.qty}</span>
                    <button onClick={() => setQty(it.key, it.qty + 1)} className="px-3 py-1.5 hover:text-rust"><Plus size={14} /></button>
                  </div>
                  <p className="font-semibold">{formatINR(it.price * it.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit card p-6">
          <h2 className="font-serif text-xl text-indigo">Summary</h2>
          <div className="mt-4 flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-semibold">
            <span>Total</span><span>{formatINR(subtotal + shipping)}</span>
          </div>
          <button onClick={() => navigate("/checkout")} className="btn-primary mt-6 w-full">Place order on Instagram</button>
          <p className="mt-3 text-center text-[12px] text-muted">No account needed. We confirm payment and delivery in the DM.</p>
          <Link to="/shop" className="mt-3 block text-center text-sm text-muted hover:text-rust">Continue shopping</Link>
          <CouponList className="mt-6 border-t border-line pt-6" />
        </aside>
      </div>
    </div>
  );
}

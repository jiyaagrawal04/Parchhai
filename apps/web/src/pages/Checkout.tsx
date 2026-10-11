import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cartShipping, cartSubtotal, useCart } from "@/store/cart";
import { FREE_SHIPPING_OVER, INSTAGRAM_DM_URL, OFFERS, SITE } from "@/data/site";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { MIcon } from "@/components/Reveal";

/** Short reference so Parchhai can match the DM to the order: PRC-YYMMDD-XXXX */
const makeRef = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRC-${ymd}-${rand}`;
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

export default function Checkout() {
  const { items, coupon, setCoupon, clear } = useCart();
  const { showToast } = useUI();
  const [form, setForm] = useState({ name: "", phone: "", address: "", pincode: "", note: "" });
  const [ref] = useState(makeRef);
  const [sent, setSent] = useState(false);

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const total = subtotal + shipping;
  const knownCoupon = OFFERS.find((o) => o.code === coupon);

  const message = useMemo(() => {
    const lines = [
      `Hi ${SITE.name}! I'd like to place an order.`,
      "",
      `Order ref: ${ref}`,
      ...items.map((it, i) => `${i + 1}. ${it.name} (${it.color} / ${it.size}) x ${it.qty} = ${formatINR(it.price * it.qty)}`),
      "",
      `Subtotal: ${formatINR(subtotal)}`,
      `Shipping: ${shipping === 0 ? `Free (over ${formatINR(FREE_SHIPPING_OVER)})` : formatINR(shipping)}`,
      ...(coupon ? [`Coupon: ${coupon}`] : []),
      `Total: ${formatINR(total)}${coupon ? " (before coupon)" : ""}`,
      "",
      `Name: ${form.name || "-"}`,
      `Phone: ${form.phone || "-"}`,
      `Address: ${form.address || "-"}`,
      `Pincode: ${form.pincode || "-"}`,
      ...(form.note ? [`Note: ${form.note}`] : []),
    ];
    return lines.join("\n");
  }, [items, subtotal, shipping, total, coupon, form, ref]);

  const placeOrder = async () => {
    // Open the DM first (must happen synchronously inside the click to avoid popup blockers).
    const win = window.open(INSTAGRAM_DM_URL, "_blank", "noopener");
    const ok = await copyText(message);
    setSent(true);
    showToast(ok ? "Order copied. Paste it in the Instagram chat." : "Opened Instagram. Copy the order below and paste it in the chat.");
    if (!win) window.location.href = INSTAGRAM_DM_URL;
  };

  if (items.length === 0 && !sent)
    return (
      <div className="container-px py-20 text-center">
        <h1 className="font-headline-md text-2xl text-primary">Your bag is empty</h1>
        <Link to="/shop" className="btn-primary mt-6">Shop now</Link>
      </div>
    );

  return (
    <div className="container-px py-12">
      <p className="label-caps text-secondary">Checkout</p>
      <h1 className="mt-2 text-4xl text-indigo">Place your order on Instagram</h1>
      <p className="mt-3 max-w-2xl text-on-surface-variant">
        We take orders in a DM, so a real person confirms your size, payment and delivery. Fill in your details, press the button, and paste the order summary into the chat that opens.
      </p>

      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_400px]">
        {/* Details */}
        <div>
          <h2 className="font-serif text-xl text-indigo">Your details <span className="text-sm font-sans text-muted">(optional, saves a few messages)</span></h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="label-caps text-on-surface-variant">Name</label>
              <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </div>
            <div>
              <label className="label-caps text-on-surface-variant">Phone</label>
              <input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-caps text-on-surface-variant">Delivery address</label>
              <textarea rows={3} className="input mt-1 resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" />
            </div>
            <div>
              <label className="label-caps text-on-surface-variant">Pincode</label>
              <input className="input mt-1" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
            </div>
            <div>
              <label className="label-caps text-on-surface-variant">Coupon code</label>
              <input className="input mt-1 uppercase" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={OFFERS[0]?.code} />
              {coupon && (
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  {knownCoupon ? `${knownCoupon.desc}. Applied when we confirm your order.` : "We'll check this code when confirming your order."}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="label-caps text-on-surface-variant">Note for us</label>
              <input className="input mt-1" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Size doubts, gift wrap, delivery date" />
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-xl text-indigo">Order summary we'll send</h2>
            <pre className="mt-4 whitespace-pre-wrap border border-line bg-surface-container-low p-5 font-sans text-sm leading-relaxed text-on-surface">{message}</pre>
            <button onClick={() => copyText(message).then((ok) => showToast(ok ? "Copied" : "Could not copy. Select the text above."))} className="btn-secondary mt-4">
              <MIcon name="content_copy" className="text-[18px]" /> Copy summary
            </button>
          </div>
        </div>

        {/* Summary + CTA */}
        <aside className="h-fit card p-6">
          <h2 className="font-serif text-xl text-indigo">{items.length} {items.length === 1 ? "piece" : "pieces"}</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((it) => (
              <li key={it.key} className="flex items-center gap-3 py-3">
                <div className="h-16 w-14 shrink-0 bg-line/40">{it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}</div>
                <div className="flex-1 text-sm">
                  <p className="text-primary">{it.name}</p>
                  <p className="text-muted">{it.color} · {it.size} · x{it.qty}</p>
                </div>
                <span className="text-sm font-semibold">{formatINR(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-semibold"><span>Total</span><span>{formatINR(total)}</span></div>

          {!sent ? (
            <>
              <button onClick={placeOrder} className="btn-primary mt-6 w-full py-4">
                <MIcon name="send" className="text-[18px]" /> Place order on Instagram
              </button>
              <p className="mt-3 text-center text-[12px] text-muted">Opens a DM with @{SITE.instagramHandle} and copies your order summary.</p>
            </>
          ) : (
            <div className="mt-6 border border-secondary/30 bg-secondary/5 p-4 text-sm">
              <p className="font-semibold text-primary">Almost done</p>
              <p className="mt-1 text-on-surface-variant">Paste the summary in the Instagram chat and we'll reply with payment details. Your reference is <span className="font-semibold text-primary">{ref}</span>.</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href={INSTAGRAM_DM_URL} target="_blank" rel="noreferrer" className="btn-primary w-full">Open Instagram DM again</a>
                <button onClick={() => copyText(message).then((ok) => showToast(ok ? "Copied" : "Could not copy"))} className="btn-secondary w-full">Copy summary again</button>
                <button onClick={() => { clear(); showToast("Bag cleared"); }} className="btn-ghost w-full text-sm">Order sent, clear my bag</button>
              </div>
            </div>
          )}
          <Link to="/cart" className="mt-4 block text-center text-sm text-muted hover:text-rust">Edit bag</Link>
        </aside>
      </div>
    </div>
  );
}

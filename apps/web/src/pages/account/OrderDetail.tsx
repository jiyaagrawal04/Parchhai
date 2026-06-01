import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useOrder } from "@/lib/hooks";
import { api, apiError } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { Badge, ErrorNote, PageLoader } from "@/components/ui";

const STEPS = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderDetail() {
  const { id = "" } = useParams();
  const { data: o, isLoading } = useOrder(id);
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const [reviewFor, setReviewFor] = useState<string>("");
  const [review, setReview] = useState({ rating: 5, title: "", body: "" });

  if (isLoading) return <PageLoader />;
  if (!o) return <div>Order not found.</div>;

  const stepIndex = STEPS.indexOf(o.status);

  const cancel = async () => {
    try {
      await api.post(`/orders/${o.id}/cancel`);
      await qc.invalidateQueries({ queryKey: ["order", id] });
      setMsg("Order cancelled.");
    } catch (e) { setMsg(apiError(e)); }
  };

  const submitReview = async (productId: string) => {
    try {
      await api.post("/reviews", { productId, ...review });
      setReviewFor("");
      setMsg("Review submitted for moderation. Thank you!");
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div>
      <Link to="/account/orders" className="label-caps text-rust">← Orders</Link>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-indigo">{o.orderNumber}</h2>
          <p className="text-sm text-muted">Placed {formatDate(o.placedAt)}</p>
        </div>
        <Badge tone={o.status === "DELIVERED" ? "success" : o.status === "CANCELLED" ? "danger" : "default"}>{o.status.replace(/_/g, " ")}</Badge>
      </div>

      {msg && <div className="mt-4"><ErrorNote message={msg} /></div>}

      {/* Tracking */}
      {o.status !== "CANCELLED" && o.status !== "RETURNED" && (
        <div className="mt-8 flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${i <= stepIndex ? "bg-rust" : "bg-line"}`} />
              <p className={`mt-2 text-center text-[10px] uppercase ${i <= stepIndex ? "text-rust" : "text-muted"}`}>{s.replace(/_/g, " ")}</p>
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="mt-8 divide-y divide-line border-y border-line">
        {o.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-serif text-lg text-indigo">{it.productName}</p>
              <p className="text-sm text-muted">{it.color} · {it.size} · Qty {it.qty}</p>
              {o.status === "DELIVERED" && (
                <button onClick={() => setReviewFor(reviewFor === it.id ? "" : it.id)} className="mt-1 text-xs text-rust hover:underline">Write a review</button>
              )}
            </div>
            <p className="font-semibold">{formatINR(it.unitPrice * it.qty)}</p>
          </div>
        ))}
      </div>

      {reviewFor && (
        <div className="mt-4 card p-5">
          <p className="label-caps text-muted">Your rating</p>
          <div className="mt-1 flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setReview({ ...review, rating: n })} className={n <= review.rating ? "text-gold" : "text-line"}>★</button>
            ))}
          </div>
          <input className="input mt-3" placeholder="Title" value={review.title} onChange={(e) => setReview({ ...review, title: e.target.value })} />
          <textarea className="input mt-3" placeholder="Your thoughts" value={review.body} onChange={(e) => setReview({ ...review, body: e.target.value })} />
          <button onClick={() => { const item = o.items.find((x) => x.id === reviewFor); if (item) void submitReview(item.productId); }} className="btn-primary mt-3">Submit review</button>
          <p className="mt-2 text-xs text-muted">Reviews are moderated before publishing.</p>
        </div>
      )}

      {/* Totals + address */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="text-sm">
          <p className="label-caps mb-2 text-gold">Delivery address</p>
          <p>{o.shippingAddress.name} · {o.shippingAddress.phone}</p>
          <p className="text-muted">{o.shippingAddress.line1}{o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}</p>
        </div>
        <div className="card p-5 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatINR(o.subtotal)}</span></div>
          {o.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatINR(o.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{o.shipping === 0 ? "Free" : formatINR(o.shipping)}</span></div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-semibold"><span>Total</span><span>{formatINR(o.total)}</span></div>
          <p className="mt-3 text-xs text-muted">Payment: {o.paymentMethod} · {o.paymentStatus}</p>
        </div>
      </div>

      {["PLACED", "PACKED"].includes(o.status) && (
        <button onClick={cancel} className="btn-secondary mt-8">Cancel order</button>
      )}
    </div>
  );
}

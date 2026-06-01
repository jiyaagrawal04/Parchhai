import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import type { OrderDTO, OrderStatus } from "@parchhai/types";
import { api, apiError, unwrap } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { AdminHeader } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

const STATUSES: OrderStatus[] = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function OrderDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const { data: o, isLoading } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async () => unwrap<OrderDTO & { customer: { name: string; email: string | null; phone: string | null } }>(await api.get(`/admin/orders/${id}`)),
  });

  if (isLoading || !o) return <PageLoader />;

  const setStatus = async (status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      await qc.invalidateQueries({ queryKey: ["admin", "order", id] });
      setMsg(`Marked ${status}`);
    } catch (e) { setMsg(apiError(e)); }
  };
  const refund = async () => {
    try { await api.post(`/admin/orders/${id}/refund`); await qc.invalidateQueries({ queryKey: ["admin", "order", id] }); setMsg("Refunded"); }
    catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div>
      <Link to="/admin/orders" className="label-caps text-rust">← Orders</Link>
      <AdminHeader title={o.orderNumber} subtitle={`Placed ${formatDate(o.placedAt)}`} />
      {msg && <p className="mb-4 text-sm text-rust">{msg}</p>}

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <p className="label-caps mb-2 text-gold">Items</p>
          <div className="divide-y divide-line border border-line bg-paper">
            {o.items.map((it) => (
              <div key={it.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{it.productName}</span>
                <span className="text-muted">{it.color}·{it.size}</span>
                <span>×{it.qty}</span>
                <span>{formatINR(it.unitPrice * it.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="label-caps mb-2 text-gold">Timeline</p>
            <ol className="space-y-2 text-sm">
              {o.timeline.map((t, i) => (
                <li key={i} className="flex gap-3"><span className="text-muted">{formatDate(t.at)}</span><span>{t.status.replace(/_/g, " ")}{t.note ? ` — ${t.note}` : ""}</span></li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-5 text-sm">
            <p className="label-caps mb-2 text-gold">Customer</p>
            <p className="font-semibold">{o.customer.name}</p>
            <p className="text-muted">{o.customer.email}</p>
            <p className="text-muted">{o.customer.phone}</p>
            <p className="label-caps mb-2 mt-4 text-gold">Ship to</p>
            <p>{o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}</p>
          </div>

          <div className="card p-5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Total</span><span className="font-semibold">{formatINR(o.total)}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-muted">Payment</span><Badge tone={o.paymentStatus === "PAID" ? "success" : "warn"}>{o.paymentStatus}</Badge></div>
          </div>

          <div className="card p-5">
            <p className="label-caps mb-3 text-gold">Update status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => <button key={s} onClick={() => setStatus(s)} className="border border-line px-2 py-2 text-xs hover:border-indigo">{s.replace(/_/g, " ")}</button>)}
            </div>
            <a href={`${import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1"}/admin/orders/${id}/invoice`} target="_blank" className="mt-3 block text-xs text-rust hover:underline">View invoice JSON</a>
            {o.paymentStatus === "PAID" && <button onClick={refund} className="btn-secondary mt-3 w-full py-2 text-xs">Refund</button>}
          </div>
        </aside>
      </div>
    </div>
  );
}

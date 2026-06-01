import { useState } from "react";
import { useOrders } from "@/lib/hooks";
import { api, apiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Empty, ErrorNote, PageLoader } from "@/components/ui";

export default function Returns() {
  const { data: orders, isLoading } = useOrders();
  const [openId, setOpenId] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  if (isLoading) return <PageLoader />;
  const delivered = orders?.filter((o) => o.status === "DELIVERED") ?? [];

  const requestReturn = async (orderId: string, items: { orderItemId: string; qty: number }[]) => {
    try {
      await api.post(`/orders/${orderId}/returns`, { items, reason });
      setMsg("Return requested. Our team will review it shortly.");
      setOpenId("");
      setReason("");
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div>
      <h2 className="text-2xl text-indigo">Returns</h2>
      {msg && <div className="mt-4"><ErrorNote message={msg} /></div>}
      {delivered.length === 0 ? (
        <Empty title="No eligible orders" hint="Only delivered orders can be returned." />
      ) : (
        <div className="mt-6 space-y-4">
          {delivered.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-muted">Delivered · {formatDate(o.placedAt)}</p>
                </div>
                <button onClick={() => setOpenId(openId === o.id ? "" : o.id)} className="btn-secondary">Request return</button>
              </div>
              {openId === o.id && (
                <div className="mt-4 border-t border-line pt-4">
                  <textarea className="input" placeholder="Reason for return" value={reason} onChange={(e) => setReason(e.target.value)} />
                  <button
                    onClick={() => requestReturn(o.id, o.items.map((i) => ({ orderItemId: i.id, qty: i.qty })))}
                    disabled={reason.length < 3}
                    className="btn-rust mt-3"
                  >
                    Submit return for all items
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

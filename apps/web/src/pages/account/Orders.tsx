import { Link } from "react-router-dom";
import { useOrders } from "@/lib/hooks";
import { formatDate, formatINR } from "@/lib/format";
import { Badge, Empty, PageLoader } from "@/components/ui";

export default function Orders() {
  const { data: orders, isLoading } = useOrders();
  if (isLoading) return <PageLoader />;
  if (!orders || orders.length === 0) return <Empty title="No orders yet" hint="When you place an order it'll appear here." />;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-indigo">Your orders</h2>
      {orders.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="block card p-5 hover:border-indigo">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{o.orderNumber}</p>
              <p className="text-sm text-muted">{formatDate(o.placedAt)} · {o.items.length} item(s)</p>
            </div>
            <div className="text-right">
              <Badge tone={o.status === "DELIVERED" ? "success" : o.status === "CANCELLED" ? "danger" : "default"}>{o.status.replace(/_/g, " ")}</Badge>
              <p className="mt-1 font-semibold">{formatINR(o.total)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

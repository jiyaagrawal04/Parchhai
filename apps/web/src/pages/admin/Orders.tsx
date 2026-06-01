import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { OrderStatus } from "@parchhai/types";
import { api } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface Row { id: string; orderNumber: string; customer: string; status: string; paymentStatus: string; total: number; items: number; placedAt: string; }
const STATUSES: OrderStatus[] = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"];

export default function Orders() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", status],
    queryFn: async () => (await api.get("/admin/orders", { params: { status: status || undefined, pageSize: 50 } })).data.data as Row[],
  });

  return (
    <div>
      <AdminHeader title="Orders" subtitle="Fulfilment and payment status" />
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setStatus("")} className={`chip ${!status ? "border-indigo text-indigo" : ""}`}>All</button>
        {STATUSES.map((s) => <button key={s} onClick={() => setStatus(s)} className={`chip ${status === s ? "border-indigo text-indigo" : ""}`}>{s.replace(/_/g, " ")}</button>)}
      </div>
      {isLoading ? <PageLoader /> : (
        <Table head={["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", ""]}>
          {data?.map((o) => (
            <tr key={o.id}>
              <Td className="font-medium">{o.orderNumber}</Td>
              <Td>{o.customer}</Td>
              <Td className="text-muted">{o.items}</Td>
              <Td>{formatINR(o.total)}</Td>
              <Td><Badge tone={o.paymentStatus === "PAID" ? "success" : o.paymentStatus === "REFUNDED" ? "muted" : "warn"}>{o.paymentStatus}</Badge></Td>
              <Td><Badge tone={o.status === "DELIVERED" ? "success" : o.status === "CANCELLED" ? "danger" : "default"}>{o.status.replace(/_/g, " ")}</Badge></Td>
              <Td className="text-muted">{formatDate(o.placedAt)}</Td>
              <Td><Link to={`/admin/orders/${o.id}`} className="text-rust hover:underline">View</Link></Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface Row { id: string; name: string; email: string | null; phone: string | null; status: string; orders: number; joinedAt: string; }
interface Detail { id: string; name: string; email: string | null; phone: string | null; status: string; notes: string | null; lifetimeValue: number; orders: { orderNumber: string; status: string; total: number; placedAt: string }[]; }

export default function Customers() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", q],
    queryFn: async () => (await api.get("/admin/customers", { params: { q: q || undefined, pageSize: 50 } })).data.data as Row[],
  });
  const { data: detail } = useQuery({
    queryKey: ["admin", "customer", selected],
    queryFn: async () => (await api.get(`/admin/customers/${selected}`)).data.data as Detail,
    enabled: Boolean(selected),
  });

  return (
    <div>
      <AdminHeader title="Customers" subtitle="CRM — profiles, value and order history" />
      <input className="input mb-6 max-w-sm" placeholder="Search by name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        {isLoading ? <PageLoader /> : (
          <Table head={["Name", "Contact", "Orders", "Status", "Joined"]}>
            {data?.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-ivory" onClick={() => setSelected(c.id)}>
                <Td className="font-medium">{c.name}</Td>
                <Td className="text-muted">{c.email ?? c.phone}</Td>
                <Td>{c.orders}</Td>
                <Td><Badge tone={c.status === "ACTIVE" ? "success" : "danger"}>{c.status}</Badge></Td>
                <Td className="text-muted">{formatDate(c.joinedAt)}</Td>
              </tr>
            ))}
          </Table>
        )}
        {detail && (
          <aside className="card h-fit p-5">
            <p className="font-serif text-xl text-indigo">{detail.name}</p>
            <p className="text-sm text-muted">{detail.email}</p>
            <p className="mt-3 text-sm">Lifetime value: <span className="font-semibold">{formatINR(detail.lifetimeValue)}</span></p>
            <p className="label-caps mt-4 text-gold">Recent orders</p>
            <ul className="mt-2 space-y-1 text-sm">
              {detail.orders.slice(0, 6).map((o) => (
                <li key={o.orderNumber} className="flex justify-between"><span>{o.orderNumber}</span><span className="text-muted">{formatINR(o.total)}</span></li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}

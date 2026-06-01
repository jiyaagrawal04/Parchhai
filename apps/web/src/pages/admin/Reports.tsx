import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { PageLoader } from "@/components/ui";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export default function Reports() {
  const sales = useQuery({ queryKey: ["admin", "rep", "sales"], queryFn: async () => (await api.get("/admin/reports/sales")).data.data as { date: string; orders: number; units: number; net: number }[] });
  const best = useQuery({ queryKey: ["admin", "rep", "best"], queryFn: async () => (await api.get("/admin/reports/best-sellers")).data.data as { product: string; units: number; revenue: number }[] });

  const csv = (path: string) => `${API}/admin/reports/${path}?format=csv`;

  return (
    <div>
      <AdminHeader title="Reports" subtitle="Sales, best-sellers, inventory & GST" />
      <div className="mb-6 flex flex-wrap gap-2">
        {[["sales", "Sales CSV"], ["best-sellers", "Best-sellers CSV"], ["inventory", "Inventory CSV"], ["gst", "GST CSV"]].map(([p, l]) => (
          <a key={p} href={csv(p)} target="_blank" className="chip border-indigo text-indigo hover:bg-indigo hover:text-ivory">{l}</a>
        ))}
        <span className="self-center text-xs text-muted">(CSV export requires staff auth header — open from an authenticated session)</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="label-caps mb-3 text-gold">Sales by day (30d)</p>
          {sales.isLoading ? <PageLoader /> : (
            <Table head={["Date", "Orders", "Units", "Net"]}>
              {sales.data?.map((r) => (
                <tr key={r.date}><Td>{r.date}</Td><Td>{r.orders}</Td><Td>{r.units}</Td><Td>{formatINR(r.net)}</Td></tr>
              ))}
              {sales.data?.length === 0 && <tr><Td className="text-muted">No sales in range.</Td></tr>}
            </Table>
          )}
        </div>
        <div>
          <p className="label-caps mb-3 text-gold">Best-sellers</p>
          {best.isLoading ? <PageLoader /> : (
            <Table head={["Product", "Units", "Revenue"]}>
              {best.data?.map((r) => (
                <tr key={r.product}><Td>{r.product}</Td><Td>{r.units}</Td><Td>{formatINR(r.revenue)}</Td></tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface Row { id: string; name: string; status: string; basePrice: number; craft: string | null; category: string | null; image: string | null; totalStock: number; variantCount: number; }

export default function Products() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", q],
    queryFn: async () => {
      const res = await api.get("/admin/products", { params: { q: q || undefined, pageSize: 50 } });
      return res.data.data as Row[];
    },
  });

  return (
    <div>
      <AdminHeader
        title="Catalog"
        subtitle="Products, variants and pricing"
        action={<Link to="/admin/products/new" className="btn-primary">New product</Link>}
      />
      <input className="input mb-6 max-w-sm" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
      {isLoading ? <PageLoader /> : (
        <Table head={["Product", "Craft", "Category", "Price", "Stock", "Status", ""]}>
          {data?.map((p) => (
            <tr key={p.id}>
              <Td>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-8 shrink-0 bg-line">{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</div>
                  <span className="font-medium">{p.name}</span>
                </div>
              </Td>
              <Td className="text-muted">{p.craft ?? "—"}</Td>
              <Td className="text-muted">{p.category ?? "—"}</Td>
              <Td>{formatINR(p.basePrice)}</Td>
              <Td><span className={p.totalStock <= 5 ? "text-rust" : ""}>{p.totalStock}</span> <span className="text-muted">({p.variantCount})</span></Td>
              <Td><Badge tone={p.status === "PUBLISHED" ? "success" : p.status === "ARCHIVED" ? "muted" : "warn"}>{p.status}</Badge></Td>
              <Td><Link to={`/admin/products/${p.id}`} className="text-rust hover:underline">Edit</Link></Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

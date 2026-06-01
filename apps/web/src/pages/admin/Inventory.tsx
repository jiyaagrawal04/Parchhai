import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/api";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface LowStock { variantId: string; sku: string; product: string; size: string; color: string; stock: number; threshold: number; }

export default function Inventory() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "low-stock"],
    queryFn: async () => (await api.get("/admin/inventory/low-stock")).data.data as LowStock[],
  });

  const adjust = async (variantId: string, change: number) => {
    try {
      await api.post("/admin/inventory/adjust", { variantId, change, reason: change > 0 ? "RESTOCK" : "ADJUSTMENT" });
      await qc.invalidateQueries({ queryKey: ["admin", "low-stock"] });
      setMsg("Stock updated ✓");
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div>
      <AdminHeader title="Inventory" subtitle="Low-stock variants and quick restock" />
      {msg && <p className="mb-4 text-sm text-rust">{msg}</p>}
      {isLoading ? <PageLoader /> : (
        <Table head={["SKU", "Product", "Variant", "Stock", "Threshold", "Restock"]}>
          {data?.map((v) => (
            <tr key={v.variantId}>
              <Td className="font-mono text-xs">{v.sku}</Td>
              <Td>{v.product}</Td>
              <Td className="text-muted">{v.color} · {v.size}</Td>
              <Td><Badge tone={v.stock === 0 ? "danger" : "warn"}>{v.stock}</Badge></Td>
              <Td className="text-muted">{v.threshold}</Td>
              <Td>
                <div className="flex gap-1">
                  {[5, 10, 25].map((n) => (
                    <button key={n} onClick={() => adjust(v.variantId, n)} className="border border-line px-2 py-1 text-xs hover:border-indigo">+{n}</button>
                  ))}
                </div>
              </Td>
            </tr>
          ))}
          {data?.length === 0 && <tr><Td className="text-muted">All variants are well stocked. 🎉</Td></tr>}
        </Table>
      )}
    </div>
  );
}

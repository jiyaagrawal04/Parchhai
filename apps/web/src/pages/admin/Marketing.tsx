import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";

interface Coupon { code: string; type: string; value: number; minOrder: number; perUserLimit: number; usedCount: number; active: boolean; }

export default function Marketing() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ code: "", type: "PERCENT", value: 10, minOrder: 0 });
  const [msg, setMsg] = useState("");
  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () => (await api.get("/admin/marketing/coupons")).data.data as Coupon[],
  });

  const create = async () => {
    try {
      await api.post("/admin/marketing/coupons", { ...form, code: form.code.toUpperCase(), value: Number(form.value), minOrder: Number(form.minOrder) });
      await qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      setForm({ code: "", type: "PERCENT", value: 10, minOrder: 0 }); setMsg("Coupon created ✓");
    } catch (e) { setMsg(apiError(e)); }
  };
  const toggle = async (code: string) => { await api.delete(`/admin/marketing/coupons/${code}`); await qc.invalidateQueries({ queryKey: ["admin", "coupons"] }); };

  return (
    <div>
      <AdminHeader title="Marketing" subtitle="Coupons and promotions" />
      {msg && <p className="mb-4 text-sm text-rust">{msg}</p>}

      <div className="mb-8 card p-5">
        <p className="label-caps mb-3 text-gold">New coupon</p>
        <div className="grid gap-3 md:grid-cols-5">
          <input className="input" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {["PERCENT", "FLAT", "FREESHIP", "BOGO"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input className="input" type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Min order (paise)" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          <button onClick={create} className="btn-primary">Create</button>
        </div>
        <p className="mt-2 text-xs text-muted">PERCENT value = % (0–100). FLAT value = paise. Min order in paise (₹1 = 100).</p>
      </div>

      {isLoading ? <PageLoader /> : (
        <Table head={["Code", "Type", "Value", "Min order", "Per user", "Used", "Active", ""]}>
          {coupons?.map((c) => (
            <tr key={c.code}>
              <Td className="font-mono font-medium">{c.code}</Td>
              <Td>{c.type}</Td>
              <Td>{c.type === "PERCENT" ? `${c.value}%` : c.type === "FLAT" ? formatINR(c.value) : "—"}</Td>
              <Td>{formatINR(c.minOrder)}</Td>
              <Td>{c.perUserLimit}</Td>
              <Td>{c.usedCount}</Td>
              <Td><Badge tone={c.active ? "success" : "muted"}>{c.active ? "Active" : "Off"}</Badge></Td>
              <Td><button onClick={() => toggle(c.code)} className="text-xs text-rust hover:underline">{c.active ? "Deactivate" : "—"}</button></Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

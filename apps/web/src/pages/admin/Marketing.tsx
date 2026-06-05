import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";
import { MediaUpload } from "@/components/admin/MediaUpload";

interface Coupon { code: string; type: string; value: number; minOrder: number; perUserLimit: number; usedCount: number; active: boolean; }
interface Banner { id: string; title: string; image: string; placement: string; }

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

  const { data: banners } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => (await api.get("/admin/marketing/banners")).data.data as Banner[],
  });
  const film = banners?.find((b) => b.placement === "home_film");
  const saveFilm = async (url: string) => {
    try {
      if (film) await api.put(`/admin/marketing/banners/${film.id}`, { image: url });
      else await api.post("/admin/marketing/banners", { title: "Parchhai Film", image: url, placement: "home_film", active: true });
      await qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      setMsg("Homepage film saved ✓");
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div>
      <AdminHeader title="Marketing" subtitle="Coupons, promotions, and homepage film" />
      {msg && <p className="mb-4 text-sm text-rust">{msg}</p>}

      <div className="mb-8 card p-5">
        <p className="label-caps mb-3 text-gold">Homepage brand film (optional · ≤50MB)</p>
        <div className="max-w-xs"><MediaUpload value={film?.image ?? ""} accept="video/*" onChange={saveFilm} /></div>
        <p className="mt-2 text-xs text-muted">Upload a video to show a "brand film" section on the homepage. Leave empty to hide it.</p>
      </div>

      <div className="mb-8 card p-5">
        <p className="label-caps mb-3 text-gold">New coupon</p>
        <div className="grid gap-3 md:grid-cols-5">
          <input className="input" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {["PERCENT", "FLAT", "FREESHIP", "BOGO"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input className="input" type="number" placeholder={form.type === "FLAT" ? "Value (₹)" : "Value"} value={form.type === "FLAT" ? form.value / 100 : form.value} onChange={(e) => { const n = Number(e.target.value); setForm({ ...form, value: form.type === "FLAT" ? Math.round(n * 100) : n }); }} />
          <input className="input" type="number" placeholder="Min order (₹)" value={form.minOrder / 100} onChange={(e) => setForm({ ...form, minOrder: Math.round(Number(e.target.value) * 100) })} />
          <button onClick={create} className="btn-primary">Create</button>
        </div>
        <p className="mt-2 text-xs text-muted">PERCENT value = % (0–100). FLAT value &amp; Min order are in ₹ (rupees).</p>
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

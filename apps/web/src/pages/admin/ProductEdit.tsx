import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ProductDetailDTO } from "@parchhai/types";
import { api, apiError, unwrap } from "@/lib/api";
import { useCrafts, useCategories } from "@/lib/hooks";
import { AdminHeader } from "@/components/admin";
import { ErrorNote, PageLoader } from "@/components/ui";

interface VariantForm { id?: string; sku: string; size: string; color: string; price: number; stock: number; lowStockThreshold: number; }
interface Form {
  name: string; description: string; basePrice: number; craftId: string; categoryId: string;
  fabric: string; careInstructions: string; artisanCluster: string; status: string;
  images: { url: string; alt: string }[]; variants: VariantForm[];
}
const empty: Form = { name: "", description: "", basePrice: 0, craftId: "", categoryId: "", fabric: "", careInstructions: "", artisanCluster: "", status: "DRAFT", images: [], variants: [] };

export default function ProductEdit() {
  const { id = "" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { data: crafts } = useCrafts();
  const { data: categories } = useCategories();
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async () => unwrap<ProductDetailDTO>(await api.get(`/admin/products/${id}`)),
    enabled: !isNew,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name, description: existing.description, basePrice: existing.basePrice,
        craftId: "", categoryId: "", fabric: existing.fabric ?? "", careInstructions: existing.careInstructions ?? "",
        artisanCluster: existing.artisanCluster ?? "", status: existing.status,
        images: existing.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })),
        variants: existing.variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size, color: v.color, price: v.price, stock: v.stock, lowStockThreshold: 5 })),
      });
    }
  }, [existing]);

  if (!isNew && isLoading) return <PageLoader />;

  const save = async () => {
    setError(""); setBusy(true);
    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      craftId: form.craftId || null,
      categoryId: form.categoryId || null,
      images: form.images.map((im, i) => ({ url: im.url, alt: im.alt, position: i })),
      variants: form.variants.map((v) => ({ ...v, price: Number(v.price), stock: Number(v.stock), lowStockThreshold: Number(v.lowStockThreshold) })),
    };
    try {
      if (isNew) await api.post("/admin/products", payload);
      else await api.put(`/admin/products/${id}`, payload);
      navigate("/admin/products");
    } catch (e) { setError(apiError(e)); setBusy(false); }
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { sku: "", size: "M", color: "", price: form.basePrice, stock: 0, lowStockThreshold: 5 }] });
  const setVariant = (i: number, patch: Partial<VariantForm>) => setForm({ ...form, variants: form.variants.map((v, idx) => idx === i ? { ...v, ...patch } : v) });

  return (
    <div>
      <AdminHeader title={isNew ? "New product" : `Edit · ${form.name}`} action={<button onClick={save} disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save"}</button>} />
      {error && <div className="mb-4"><ErrorNote message={error} /></div>}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block"><span className="label-caps text-muted">Name</span><input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block"><span className="label-caps text-muted">Base price (paise)</span><input type="number" className="input mt-1" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></label>
        <label className="block"><span className="label-caps text-muted">Craft</span>
          <select className="input mt-1" value={form.craftId} onChange={(e) => setForm({ ...form, craftId: e.target.value })}>
            <option value="">—</option>{crafts?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="label-caps text-muted">Category</span>
          <select className="input mt-1" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">—</option>{categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="label-caps text-muted">Fabric</span><input className="input mt-1" value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} /></label>
        <label className="block"><span className="label-caps text-muted">Status</span>
          <select className="input mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="md:col-span-2 block"><span className="label-caps text-muted">Description</span><textarea className="input mt-1" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label className="md:col-span-2 block"><span className="label-caps text-muted">Care instructions</span><input className="input mt-1" value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} /></label>
      </div>

      {/* Images */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between"><p className="label-caps text-gold">Images</p><button onClick={() => setForm({ ...form, images: [...form.images, { url: "", alt: "" }] })} className="text-xs text-rust">+ Add image URL</button></div>
        {form.images.map((im, i) => (
          <input key={i} className="input mb-2" placeholder="https://…" value={im.url} onChange={(e) => setForm({ ...form, images: form.images.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x) })} />
        ))}
      </div>

      {/* Variants */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between"><p className="label-caps text-gold">Variants</p><button onClick={addVariant} className="text-xs text-rust">+ Add variant</button></div>
        <div className="space-y-2">
          {form.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
              <input className="input" placeholder="SKU" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} />
              <input className="input" placeholder="Size" value={v.size} onChange={(e) => setVariant(i, { size: e.target.value })} />
              <input className="input" placeholder="Color" value={v.color} onChange={(e) => setVariant(i, { color: e.target.value })} />
              <input className="input" type="number" placeholder="Price" value={v.price} onChange={(e) => setVariant(i, { price: Number(e.target.value) })} />
              <input className="input" type="number" placeholder="Stock" value={v.stock} disabled={!isNew && !!v.id} title={!isNew && v.id ? "Adjust stock from Inventory" : ""} onChange={(e) => setVariant(i, { stock: Number(e.target.value) })} />
            </div>
          ))}
        </div>
        {!isNew && <p className="mt-2 text-xs text-muted">Existing variant stock is managed in Inventory to keep an audit trail.</p>}
      </div>
    </div>
  );
}

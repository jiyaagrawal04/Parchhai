import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AddressInput } from "@parchhai/types";
import { useAddresses } from "@/lib/hooks";
import { api, apiError } from "@/lib/api";
import { ErrorNote, PageLoader } from "@/components/ui";

const empty: AddressInput = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", type: "HOME", isDefault: false };

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const qc = useQueryClient();
  const [form, setForm] = useState<AddressInput>(empty);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  if (isLoading) return <PageLoader />;

  const save = async () => {
    try {
      await api.post("/me/addresses", form);
      await qc.invalidateQueries({ queryKey: ["addresses"] });
      setForm(empty); setOpen(false); setMsg("");
    } catch (e) { setMsg(apiError(e)); }
  };
  const remove = async (id: string) => {
    await api.delete(`/me/addresses/${id}`);
    await qc.invalidateQueries({ queryKey: ["addresses"] });
  };

  const field = (key: keyof AddressInput, label: string, required = true) => (
    <div>
      <label className="label-caps text-muted">{label}</label>
      <input className="input mt-1" value={String(form[key] ?? "")} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl text-indigo">Addresses</h2>
        <button onClick={() => setOpen(!open)} className="btn-secondary">{open ? "Cancel" : "Add address"}</button>
      </div>
      {msg && <div className="mt-4"><ErrorNote message={msg} /></div>}

      {open && (
        <div className="mt-6 grid gap-4 card p-5 md:grid-cols-2">
          {field("name", "Full name")}
          {field("phone", "Phone")}
          <div className="md:col-span-2">{field("line1", "Address line 1")}</div>
          <div className="md:col-span-2">{field("line2", "Address line 2", false)}</div>
          {field("city", "City")}
          {field("state", "State")}
          {field("pincode", "Pincode")}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Set as default</label>
          <div className="md:col-span-2"><button onClick={save} className="btn-primary">Save address</button></div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {addresses?.map((a) => (
          <div key={a.id} className="card p-5 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{a.name} {a.isDefault && <span className="chip ml-2">Default</span>}</p>
              <button onClick={() => remove(a.id)} className="text-muted hover:text-rust">Remove</button>
            </div>
            <p className="mt-1 text-muted">{a.phone}</p>
            <p className="text-muted">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

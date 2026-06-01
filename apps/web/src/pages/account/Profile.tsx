import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { api, apiError } from "@/lib/api";
import { ErrorNote } from "@/components/ui";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? "" });
  }, [user]);

  const save = async () => {
    try {
      await api.patch("/me/profile", form);
      setMsg("Profile updated ✓");
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-2xl text-indigo">Profile</h2>
      {msg && <div className="mt-4"><ErrorNote message={msg} /></div>}
      <div className="mt-6 space-y-5">
        <div><label className="label-caps text-muted">Name</label><input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label-caps text-muted">Email</label><input className="input mt-1" value={user?.email ?? ""} disabled /></div>
        <div><label className="label-caps text-muted">Phone</label><input className="input mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <button onClick={save} className="btn-primary">Save changes</button>
      </div>
    </div>
  );
}

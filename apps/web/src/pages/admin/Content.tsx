import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "@/lib/api";
import { AdminHeader, Table, Td } from "@/components/admin";
import { Badge, PageLoader } from "@/components/ui";
import { MediaUpload } from "@/components/admin/MediaUpload";

interface Post { id: string; title: string; slug: string; status: string; author: string | null; }

export default function Content() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", excerpt: "", body: "", author: "Parchhai Studio", coverImage: "", status: "PUBLISHED" });
  const [msg, setMsg] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "journal"],
    queryFn: async () => (await api.get("/admin/cms/journal")).data.data as Post[],
  });

  const create = async () => {
    try {
      await api.post("/admin/cms/journal", { ...form, coverImage: form.coverImage || undefined });
      await qc.invalidateQueries({ queryKey: ["admin", "journal"] });
      setForm({ title: "", excerpt: "", body: "", author: "Parchhai Studio", coverImage: "", status: "PUBLISHED" }); setMsg("Post saved ✓");
    } catch (e) { setMsg(apiError(e)); }
  };
  const remove = async (id: string) => { await api.delete(`/admin/cms/journal/${id}`); await qc.invalidateQueries({ queryKey: ["admin", "journal"] }); };

  return (
    <div>
      <AdminHeader title="Content" subtitle="Journal & editorial" />
      {msg && <p className="mb-4 text-sm text-rust">{msg}</p>}

      <div className="mb-8 card p-5">
        <p className="label-caps mb-3 text-gold">New journal post</p>
        <div className="grid gap-3">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <p className="label-caps mb-1 text-muted">Cover image</p>
            <div className="max-w-xs"><MediaUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} /></div>
          </div>
          <input className="input" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea className="input" rows={4} placeholder="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <div className="flex gap-3">
            <select className="input max-w-[160px]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option>
            </select>
            <button onClick={create} className="btn-primary">Save post</button>
          </div>
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <Table head={["Title", "Author", "Status", ""]}>
          {data?.map((p) => (
            <tr key={p.id}>
              <Td className="font-medium">{p.title}</Td>
              <Td className="text-muted">{p.author}</Td>
              <Td><Badge tone={p.status === "PUBLISHED" ? "success" : "warn"}>{p.status}</Badge></Td>
              <Td><button onClick={() => remove(p.id)} className="text-xs text-rust hover:underline">Delete</button></Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

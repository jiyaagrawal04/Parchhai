import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CraftDTO } from "@parchhai/types";
import { useCrafts } from "@/lib/hooks";
import { api, apiError } from "@/lib/api";
import { AdminHeader } from "@/components/admin";
import { PageLoader } from "@/components/ui";
import { MediaUpload } from "@/components/admin/MediaUpload";

export default function AdminCrafts() {
  const { data: crafts, isLoading } = useCrafts();
  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminHeader title="Crafts" subtitle="Edit each craft's details, hero image, and video" />
      <div className="grid gap-6">
        {crafts?.map((craft) => <CraftRow key={craft.id} craft={craft} />)}
      </div>
    </div>
  );
}

function CraftRow({ craft }: { craft: CraftDTO }) {
  const qc = useQueryClient();
  const [name, setName] = useState(craft.name);
  const [region, setRegion] = useState(craft.region);
  const [story, setStory] = useState(craft.story);
  const [dyes, setDyes] = useState(craft.dyes.join(", "));
  const [heroImage, setHeroImage] = useState(craft.heroImage ?? "");
  const [videoUrl, setVideoUrl] = useState(craft.videoUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setBusy(true);
    setMsg("");
    try {
      await api.put(`/admin/crafts/${craft.id}`, {
        name,
        region,
        story,
        dyes: dyes.split(",").map((d) => d.trim()).filter(Boolean),
        heroImage: heroImage || undefined,
        videoUrl: videoUrl || undefined,
      });
      await qc.invalidateQueries({ queryKey: ["crafts"] });
      await qc.invalidateQueries({ queryKey: ["craft"] });
      setMsg("Saved ✓");
    } catch (e) {
      setMsg(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="grid gap-5 md:grid-cols-[1fr_auto]">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="label-caps text-muted">Name</span><input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label className="block"><span className="label-caps text-muted">Region</span><input className="input mt-1" value={region} onChange={(e) => setRegion(e.target.value)} /></label>
          </div>
          <label className="block"><span className="label-caps text-muted">Story</span><textarea rows={5} className="input mt-1" value={story} onChange={(e) => setStory(e.target.value)} /></label>
          <label className="block"><span className="label-caps text-muted">Natural dyes (comma-separated)</span><input className="input mt-1" value={dyes} onChange={(e) => setDyes(e.target.value)} placeholder="Indigo, Madder, Harda" /></label>
        </div>
        <div className="grid w-full gap-4 md:w-64">
          <div>
            <p className="label-caps mb-1 text-muted">Hero image</p>
            <MediaUpload value={heroImage} onChange={setHeroImage} />
          </div>
          <div>
            <p className="label-caps mb-1 text-muted">Craft video (≤50MB)</p>
            <MediaUpload value={videoUrl} accept="video/*" onChange={setVideoUrl} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button onClick={save} disabled={busy} className="btn-primary disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
        {msg && <span className="text-sm text-rust">{msg}</span>}
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { api, unwrap } from "@/lib/api";

const isVideoUrl = (u: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);

/** Admin media uploader — click or drag a file to upload to Supabase Storage,
 *  with a live preview and a paste-a-URL fallback. */
export function MediaUpload({
  value,
  onChange,
  accept = "image/*",
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = unwrap<{ url: string; key: string }>(await api.post("/admin/uploads", fd));
      onChange(url);
    } catch {
      setErr("Upload failed — check the file size (max 50 MB) and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className="relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-outline bg-surface-container-low transition-colors hover:border-primary"
      >
        {value ? (
          isVideoUrl(value) ? (
            <video src={value} className="h-full w-full object-cover" muted />
          ) : (
            <img src={value} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <span className="px-4 text-center text-xs text-on-surface-variant">Click or drag a file to upload</span>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">Uploading…</div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a URL"
        className="input mt-2 text-xs"
      />
      {err && <p className="mt-1 text-xs text-rust">{err}</p>}
    </div>
  );
}

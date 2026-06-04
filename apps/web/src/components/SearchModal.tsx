import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { Modal } from "@/components/Overlay";
import { MIcon } from "@/components/Reveal";

export function SearchModal() {
  const { closeSearch } = useUI();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const active = debounced.length >= 2;
  const { data, isFetching } = useProducts({ q: debounced, pageSize: 6 });
  const results = active ? (data?.items ?? []) : [];

  const go = (path: string) => {
    closeSearch();
    navigate(path);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounced) go(`/shop?q=${encodeURIComponent(debounced)}`);
  };

  return (
    <Modal onClose={closeSearch} align="top" className="w-full max-w-xl p-0">
      <form onSubmit={submit} className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
        <MIcon name="search" className="text-2xl text-on-surface-variant" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for kurtis, crafts, colours…"
          className="flex-1 bg-transparent text-body-lg outline-none placeholder:text-on-surface-variant/50"
        />
        {isFetching && active && <MIcon name="progress_activity" className="animate-spin text-on-surface-variant" />}
      </form>

      <div className="max-h-[50vh] overflow-y-auto">
        {!active && <p className="px-5 py-8 text-center text-sm text-on-surface-variant">Type at least 2 letters to search.</p>}
        {active && results.length === 0 && !isFetching && (
          <p className="px-5 py-8 text-center text-sm text-on-surface-variant">No matches for “{debounced}”.</p>
        )}
        {results.map((p) => (
          <button key={p.id} onClick={() => go(`/product/${p.slug}`)} className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-container">
            <div className="h-16 w-14 shrink-0 bg-surface-container">
              {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1">
              {p.craft && <p className="label-caps text-[10px] text-secondary">{p.craft.name}</p>}
              <p className="text-sm text-primary">{p.name}</p>
            </div>
            <span className="label-caps text-on-surface-variant">{formatINR(p.basePrice)}</span>
          </button>
        ))}
        {active && results.length > 0 && (
          <button onClick={() => go(`/shop?q=${encodeURIComponent(debounced)}`)} className="block w-full border-t border-outline-variant px-5 py-3 text-center label-caps text-[11px] text-secondary hover:bg-surface-container">
            See all results for “{debounced}”
          </button>
        )}
      </div>
    </Modal>
  );
}

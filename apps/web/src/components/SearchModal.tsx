import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { craftOf, listProducts } from "@/data/catalog";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { Modal } from "@/components/Overlay";
import { MIcon } from "@/components/Reveal";

const QUICK = ["Tops", "Kurtas", "Ajrakh", "Bagru", "Dabu"];

export function SearchModal() {
  const { closeSearch } = useUI();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const term = q.trim();
  const active = term.length >= 2;
  const results = useMemo(() => (active ? listProducts({ q: term }).slice(0, 6) : []), [active, term]);

  const go = (path: string) => {
    closeSearch();
    navigate(path);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term) go(`/shop?q=${encodeURIComponent(term)}`);
  };

  return (
    <Modal onClose={closeSearch} align="top" className="w-full max-w-xl p-0">
      <form onSubmit={submit} className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
        <MIcon name="search" className="text-2xl text-on-surface-variant" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for tops, kurtas, crafts"
          className="flex-1 bg-transparent text-body-lg outline-none placeholder:text-on-surface-variant/50"
        />
      </form>

      <div className="max-h-[50vh] overflow-y-auto">
        {!active && (
          <div className="px-5 py-6">
            <p className="label-caps mb-3 text-[10px] text-on-surface-variant">Explore</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map((k) => (
                <button key={k} onClick={() => setQ(k)} className="chip hover:border-primary">{k}</button>
              ))}
            </div>
          </div>
        )}
        {active && results.length === 0 && <p className="px-5 py-8 text-center text-sm text-on-surface-variant">No matches for "{term}".</p>}
        {results.map((p) => (
          <button key={p.slug} onClick={() => go(`/product/${p.slug}`)} className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-container">
            <div className="h-16 w-14 shrink-0 bg-surface-container">
              {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="label-caps text-[10px] text-secondary">{craftOf(p)?.name}</p>
              <p className="text-sm text-primary">{p.name}</p>
            </div>
            <span className="label-caps text-on-surface-variant">{formatINR(p.price)}</span>
          </button>
        ))}
        {active && results.length > 0 && (
          <button onClick={() => go(`/shop?q=${encodeURIComponent(term)}`)} className="block w-full border-t border-outline-variant px-5 py-3 text-center label-caps text-[11px] text-secondary hover:bg-surface-container">
            See all results for "{term}"
          </button>
        )}
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { useProducts } from "@/lib/hooks";
import { ProductCard } from "@/components/ProductCard";
import { Empty } from "@/components/ui";

export default function Search() {
  const [q, setQ] = useState("");
  const { data } = useProducts(q.length >= 2 ? { q, pageSize: 24 } : { pageSize: 0 });
  return (
    <div className="container-px py-12">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for kurtis, Ajrakh, corsets…"
        className="w-full border-b-2 border-indigo bg-transparent pb-4 font-serif text-3xl outline-none placeholder:text-muted"
      />
      <div className="mt-10">
        {q.length < 2 ? (
          <p className="text-sm text-muted">Type at least 2 characters.</p>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        ) : (
          <Empty title="Nothing found" hint={`No results for "${q}"`} />
        )}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { ProductListItemDTO } from "@parchhai/types";
import { formatINR } from "@/lib/format";

export const ProductCard = ({ p }: { p: ProductListItemDTO }) => (
  <Link to={`/product/${p.slug}`} className="group block">
    <div className="slow-zoom aspect-[3/4] bg-line/40">
      {p.image ? (
        <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted">No image</div>
      )}
    </div>
    <div className="mt-3 flex items-start justify-between gap-3">
      <div>
        {p.craft && <p className="label-caps text-gold">{p.craft.name}</p>}
        <h3 className="mt-1 font-serif text-lg leading-tight text-indigo group-hover:text-rust">{p.name}</h3>
      </div>
      <p className="shrink-0 font-semibold">{formatINR(p.basePrice)}</p>
    </div>
    {!p.inStock && <p className="mt-1 text-xs text-rust">Sold out</p>}
  </Link>
);

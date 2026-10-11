import { Link } from "react-router-dom";
import { craftOf, isInStock, type Product } from "@/data/catalog";
import { formatINR } from "@/lib/format";

export const ProductCard = ({ p }: { p: Product }) => {
  const craft = craftOf(p);
  const image = p.images[0];
  return (
    <Link to={`/product/${p.slug}`} className="group block">
      <div className="slow-zoom aspect-[3/4] bg-line/40">
        {image ? (
          <img src={image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          {craft && <p className="label-caps text-gold">{craft.name}</p>}
          <h3 className="mt-1 font-serif text-lg leading-tight text-indigo group-hover:text-rust">{p.name}</h3>
        </div>
        <p className="shrink-0 font-semibold">{formatINR(p.price)}</p>
      </div>
      {!isInStock(p) && <p className="mt-1 text-xs text-rust">Sold out</p>}
    </Link>
  );
};

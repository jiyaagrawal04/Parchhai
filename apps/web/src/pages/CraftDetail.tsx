import { Link, useParams } from "react-router-dom";
import { getCraft, listProducts } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";

export default function CraftDetail() {
  const { slug = "" } = useParams();
  const craft = getCraft(slug);
  if (!craft) {
    return (
      <div className="container-px py-20 text-center">
        <h1 className="font-headline-md text-2xl text-primary">Craft not found</h1>
        <Link to="/crafts" className="btn-primary mt-6">All crafts</Link>
      </div>
    );
  }
  const products = listProducts({ craft: slug }).slice(0, 8);

  return (
    <div>
      <section className="relative h-[60vh] bg-indigo-deep">
        <img src={craft.image} alt={craft.name} className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-px pb-12 text-ivory">
            <p className="label-caps text-gold">{craft.region}</p>
            <h1 className="mt-2 text-6xl">{craft.name}</h1>
          </div>
        </div>
      </section>

      <section className="container-px grid gap-12 py-16 md:grid-cols-[2fr_1fr]">
        <div className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-ink/85">{craft.story}</div>
        <div>
          <p className="label-caps mb-3 text-gold">Natural dyes</p>
          <ul className="space-y-2 text-sm">{craft.dyes.map((d) => <li key={d} className="border-b border-line pb-2">{d}</li>)}</ul>
        </div>
      </section>

      {products.length > 0 && (
        <section className="container-px pb-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl text-indigo">Shop {craft.name}</h2>
            <Link to={`/shop?craft=${craft.slug}`} className="label-caps text-rust hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {products.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

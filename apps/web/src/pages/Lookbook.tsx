import { Link } from "react-router-dom";
import { useProducts } from "@/lib/hooks";
import { formatINR } from "@/lib/format";
import { PageLoader } from "@/components/ui";

// Varied aspect ratios give the magazine-masonry rhythm of the Stitch lookbook.
const RATIOS = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-square", "aspect-[4/3]", "aspect-[3/4]"];
const TAGS = ["Hand-blocked", "Heritage Structure", "Fluid Set", "Textile Detail", "Limited Series", "New Arrival"];

export default function Lookbook() {
  const { data, isLoading } = useProducts({ pageSize: 12, sort: "newest" });
  if (isLoading) return <PageLoader />;
  const items = data?.items ?? [];

  return (
    <main className="mx-auto max-w-screen-2xl px-5 pb-section-gap pt-12 md:px-margin-desktop">
      <header className="mb-20 max-w-4xl">
        <span className="label-caps mb-4 block text-secondary">The Collection</span>
        <h1 className="mb-8 font-display-lg text-5xl leading-tight text-primary md:text-display-lg">
          The Silhouette of <span className="font-normal italic">Indigo</span>
        </h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          A visual journey through the heritage of block-printing, reimagined into sharp contemporary silhouettes. Each piece is a conversation between the artisan's hand and the modern pulse.
        </p>
      </header>

      <div className="lookbook-grid">
        {items.map((p, i) => (
          <div key={p.id} className="lookbook-item group relative overflow-hidden bg-surface-container">
            <Link to={`/product/${p.slug}`} className={`slow-zoom relative block ${RATIOS[i % RATIOS.length]}`}>
              <img src={p.image ?? ""} alt={p.name} className="h-full w-full object-cover" />
              <div className="image-overlay absolute inset-0 flex flex-col justify-end p-8 text-surface">
                <p className="label-caps mb-2 uppercase opacity-80">{TAGS[i % TAGS.length]}</p>
                <h3 className="mb-4 font-headline-md text-2xl md:text-headline-md">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-body-md font-bold">{formatINR(p.basePrice)}</span>
                  <span className="bg-surface px-6 py-2 label-caps text-primary transition-all group-hover:bg-secondary group-hover:text-surface">View Details</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-section-gap flex flex-col items-center border-t border-outline/10 pt-24 text-center">
        <h2 className="mb-8 max-w-xl font-headline-lg text-3xl text-primary md:text-headline-lg">The complete collection is now live.</h2>
        <p className="mb-12 max-w-lg text-body-md text-on-surface-variant">
          Explore the full range of meticulously crafted garments designed for the discerning individual.
        </p>
        <Link to="/shop" className="bg-primary px-12 py-5 label-caps uppercase tracking-widest text-surface transition-all duration-500 hover:bg-secondary">Go to Shop</Link>
      </section>
    </main>
  );
}

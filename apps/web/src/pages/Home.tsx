import { Link } from "react-router-dom";
import { useBanners, useCrafts, useProducts } from "@/lib/hooks";
import { formatINR } from "@/lib/format";
import { Reveal, MIcon } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";

const CRAFT_MARQUEE = ["Ajrakh", "Bagru", "Dabu", "Bagh"];

export default function Home() {
  const { data: banners } = useBanners();
  const { data: crafts } = useCrafts();
  const { data: featured } = useProducts({ pageSize: 8, sort: "newest" });
  const hero = banners?.find((b) => b.placement === "home_hero");
  const items = featured?.items ?? [];
  const editorial = items.slice(0, 2);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-screen w-full items-center overflow-hidden px-5 md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <img
            src={hero?.image ?? "https://picsum.photos/seed/parchhai-hero/1600/2000"}
            alt=""
            className="h-full w-full object-cover object-center brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-primary/30" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <span className="label-caps mb-6 block tracking-[0.3em] text-surface-variant">{hero?.subtitle ?? "Autumn / Winter '24"}</span>
          <h1 className="mb-8 font-display-lg text-5xl leading-[1.05] text-surface md:text-display-lg">
            Wear the <br />
            <span className="font-light italic">reflection</span> of India.
          </h1>
          <p className="mb-12 max-w-xl text-body-lg text-surface-variant/90">
            Parchhai revives centuries-old block-printing traditions through contemporary silhouettes. Each piece is a dialogue between ancestral hands and modern souls.
          </p>
          <div className="flex flex-col gap-6 sm:flex-row">
            <Link to="/shop" className="border border-transparent bg-surface px-10 py-5 text-center label-caps text-primary transition-all duration-300 hover:bg-secondary hover:text-surface">
              Shop the Collection
            </Link>
            <Link to="/crafts" className="border border-surface px-10 py-5 text-center label-caps text-surface transition-all duration-300 hover:bg-surface/10">
              Our Craft Story
            </Link>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-surface/60 md:flex">
          <span className="text-[10px] uppercase tracking-widest">Explore</span>
          <div className="relative h-12 w-px overflow-hidden bg-surface/30">
            <div className="absolute left-0 top-0 h-1/2 w-full animate-bounce bg-surface" />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="overflow-hidden border-y border-outline/10 bg-primary py-12 text-surface">
        <div className="marquee-container">
          <div className="marquee-content flex items-center gap-12">
            {[...CRAFT_MARQUEE, ...CRAFT_MARQUEE].map((c, i) => (
              <span key={i} className="flex items-center gap-12">
                <span className="px-8 font-display-lg text-3xl italic opacity-40 md:text-headline-lg">{c}</span>
                <MIcon name="auto_awesome" className="text-secondary" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial grid */}
      <section className="bg-surface px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="mb-6 font-headline-lg text-3xl text-primary md:text-headline-lg">The Geometry of Tradition</h2>
            <p className="text-body-md text-on-surface-variant">
              Our latest drop focuses on the mathematical precision of hand-carved woodblocks — the intersection of architectural structure and fluid textiles.
            </p>
          </div>
          <Link to="/crafts" className="label-caps border-b border-secondary pb-1 text-secondary hover:opacity-70">View All Crafts</Link>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          {editorial[0] && (
            <Reveal className="md:col-span-5">
              <Link to={`/product/${editorial[0].slug}`} className="group block">
                <div className="slow-zoom relative mb-6 aspect-[4/5] bg-surface-variant">
                  <img src={editorial[0].image ?? ""} alt={editorial[0].name} className="h-full w-full object-cover" />
                  <div className="absolute right-4 top-4 bg-surface/90 px-4 py-1 backdrop-blur-md">
                    <span className="label-caps text-[11px] text-primary">Limited Edition</span>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline-md text-2xl text-primary md:text-headline-md">{editorial[0].name}</h3>
                    <p className="label-caps text-[11px] text-on-surface-variant">Hand-printed {editorial[0].craft?.name}</p>
                  </div>
                  <span className="text-body-md text-primary">{formatINR(editorial[0].basePrice)}</span>
                </div>
              </Link>
            </Reveal>
          )}
          {editorial[1] && (
            <Reveal delay={150} className="flex flex-col justify-center md:col-span-7">
              <Link to={`/product/${editorial[1].slug}`} className="group block">
                <div className="slow-zoom relative mb-6 aspect-[16/10] bg-surface-variant md:ml-12">
                  <img src={editorial[1].image ?? ""} alt={editorial[1].name} className="h-full w-full object-cover" />
                </div>
                <div className="flex items-start justify-between md:ml-12">
                  <div>
                    <h3 className="font-headline-md text-2xl text-primary md:text-headline-md">{editorial[1].name}</h3>
                    <p className="label-caps text-[11px] text-on-surface-variant">{editorial[1].craft?.name} Collection</p>
                  </div>
                  <span className="text-body-md text-primary">{formatINR(editorial[1].basePrice)}</span>
                </div>
              </Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* Shop by craft */}
      <section className="bg-surface px-5 pb-24 md:px-margin-desktop">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="label-caps mb-2 text-secondary">Provenance</p>
            <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Shop by craft</h2>
          </div>
          <Link to="/crafts" className="label-caps text-secondary hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {crafts?.map((c) => (
            <Link key={c.id} to={`/crafts/${c.slug}`} className="slow-zoom group relative aspect-[3/4] bg-surface-variant">
              <img src={c.heroImage ?? ""} alt={c.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
              <div className="absolute bottom-4 left-4 text-surface">
                <p className="font-display-lg text-2xl">{c.name}</p>
                <p className="text-xs text-surface/70">{c.region}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New in */}
      <section className="bg-surface px-5 pb-section-gap md:px-margin-desktop">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="label-caps mb-2 text-secondary">New in</p>
            <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Just arrived</h2>
          </div>
          <Link to="/shop" className="label-caps text-secondary hover:underline">Shop all</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-gutter gap-y-12 md:grid-cols-4">
          {items.slice(2, 6).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}

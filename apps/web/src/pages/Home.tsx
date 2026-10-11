import { Link } from "react-router-dom";
import { CRAFTS, FEATURED_COLLECTION, bestSellers, byTag, newArrivals, type Product } from "@/data/catalog";
import { HOME_IMG } from "@/data/images";
import { ANNOUNCEMENTS, INSTAGRAM_URL, SITE } from "@/data/site";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { Reveal, MIcon } from "@/components/Reveal";

const QuickViewBtn = ({ slug, onOpen }: { slug: string; onOpen: (s: string) => void }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onOpen(slug);
    }}
    className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface/95 px-5 py-2 label-caps text-[10px] text-primary opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:bg-primary hover:text-on-primary group-hover:opacity-100"
  >
    Quick View
  </button>
);

const ProductTile = ({ p, onQuickView, badge }: { p: Product; onQuickView: (s: string) => void; badge?: string }) => (
  <Link to={`/product/${p.slug}`} className="group block">
    <div className="slow-zoom relative mb-5 aspect-[4/5] bg-surface-variant">
      {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
      {badge && <span className="absolute left-4 top-4 bg-primary px-3 py-1 text-[10px] uppercase tracking-tight text-on-primary">{badge}</span>}
      <QuickViewBtn slug={p.slug} onOpen={onQuickView} />
    </div>
    <div className="text-center">
      <h4 className="mb-1 text-body-md text-primary group-hover:underline">{p.name}</h4>
      <p className="label-caps text-on-surface-variant">{formatINR(p.price)}</p>
    </div>
  </Link>
);

export default function Home() {
  const { openQuickView } = useUI();
  const featured = byTag(FEATURED_COLLECTION.tag, 4);
  const arrivals = newArrivals(8);
  const best = bestSellers(8);

  return (
    <div>
      {/* 1. Hero */}
      <section className="relative flex h-screen w-full items-center overflow-hidden px-5 md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <img src={HOME_IMG.hero} alt="" className="h-full w-full object-cover object-center brightness-[0.7]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <Reveal className="relative z-10 max-w-3xl">
          <h1 className="mb-6 font-display-lg text-5xl leading-[1.05] text-white md:text-display-lg">
            Style Your <br />
            <span className="font-normal italic">Shadow</span>
          </h1>
          <p className="mb-10 max-w-lg text-body-lg text-white/85">
            Parchhai means reflection. The living crafts of Indian hand-block printing, reimagined in contemporary silhouettes. Naturally dyed, printed by hand, made to be lived in.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/shop" className="bg-white px-10 py-4 text-center label-caps text-primary transition-all duration-300 hover:bg-secondary hover:text-white">
              Shop Collection
            </Link>
            <Link to="/crafts" className="border border-white px-10 py-4 text-center label-caps text-white transition-all duration-300 hover:bg-white hover:text-primary">
              Discover Craft
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 2. Featured collection (Navratri) */}
      {featured.length > 0 && (
        <section className="bg-surface-container-low px-5 py-24 md:px-margin-desktop">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-gutter">
            <Reveal className="md:col-span-5">
              <Link to={`/shop?collection=${FEATURED_COLLECTION.tag}`} className="slow-zoom relative block aspect-[4/5] overflow-hidden bg-surface-variant">
                <img src={FEATURED_COLLECTION.image} alt={FEATURED_COLLECTION.name} className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                  <span className="label-caps mb-2 block text-[11px] text-white/80">{FEATURED_COLLECTION.eyebrow}</span>
                  <h2 className="font-display-lg text-3xl md:text-headline-lg">{FEATURED_COLLECTION.name}</h2>
                </div>
              </Link>
            </Reveal>
            <div className="md:col-span-7">
              <Reveal delay={100} className="mb-10">
                <p className="max-w-xl text-body-lg text-on-surface-variant">{FEATURED_COLLECTION.blurb}</p>
                <Link to={`/shop?collection=${FEATURED_COLLECTION.tag}`} className="label-caps mt-5 inline-flex items-center gap-2 border-b border-primary pb-1 text-primary hover:opacity-70">
                  Shop the collection <MIcon name="arrow_forward" className="text-[16px]" />
                </Link>
              </Reveal>
              <div className="grid grid-cols-2 gap-4 md:gap-gutter lg:grid-cols-4">
                {featured.map((p, i) => (
                  <Reveal key={p.slug} delay={150 + i * 100}>
                    <ProductTile p={p} onQuickView={openQuickView} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Announcement bar */}
      <section className="overflow-hidden bg-primary py-3 text-on-primary">
        <div className="marquee-container">
          <div className="marquee-content">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                {ANNOUNCEMENTS.map((a, i) => (
                  <span key={`${k}-${i}`} className="mx-8 inline-flex items-center gap-8 align-middle">
                    <span className="label-caps text-[11px]">{a}</span>
                    <span className="text-secondary">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Heritage crafts: Ajrakh, Bagru, Dabu, Dabu-Bagru */}
      <section className="bg-surface px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="mb-12 text-center">
          <span className="label-caps mb-3 block text-secondary">Provenance</span>
          <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Our Heritage Crafts</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-md text-on-surface-variant">
            Tracing the rhythmic stamping of wooden blocks across the heartlands of India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-gutter lg:grid-cols-4">
          {CRAFTS.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 4) * 100}>
              <Link to={`/crafts/${c.slug}`} className="group relative block overflow-hidden">
                <div className="slow-zoom aspect-[3/4]">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <h3 className="font-headline-md text-2xl text-white md:text-3xl">{c.name}</h3>
                  <p className="label-caps text-[10px] text-white/70">{c.region}</p>
                  <span className="mt-2 flex items-center gap-1 label-caps text-[10px] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explore <MIcon name="arrow_forward" className="text-[14px]" />
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/0 transition-all duration-300 group-hover:ring-white/30" />
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/crafts" className="label-caps inline-flex items-center gap-2 border-b border-primary pb-1 text-primary hover:opacity-70">
            View All Crafts <MIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </section>

      {/* 5. New arrivals */}
      {arrivals.length > 0 && (
        <section className="bg-surface-container-low px-5 py-24 md:px-margin-desktop">
          <div className="mb-16 text-center">
            <span className="label-caps mb-4 block text-on-surface-variant">Just Arrived</span>
            <h2 className="font-display-lg text-4xl text-primary md:text-display-lg">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {arrivals.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 120}>
                <ProductTile p={p} onQuickView={openQuickView} badge={i === 0 ? "New In" : undefined} />
              </Reveal>
            ))}
          </div>
          <div className="mt-20 text-center">
            <Link to="/shop?collection=new" className="label-caps inline-flex items-center gap-2 border-b border-primary pb-1 text-primary hover:opacity-70">
              View All Arrivals <MIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        </section>
      )}

      {/* 6. Best sellers carousel */}
      {best.length > 0 && (
        <section className="overflow-hidden py-24">
          <Reveal className="mb-12 flex items-center justify-between px-5 md:px-margin-desktop">
            <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Best Sellers</h2>
            <Link to="/shop?collection=bestseller" className="label-caps text-on-surface-variant hover:text-secondary">Shop all</Link>
          </Reveal>
          <Reveal delay={150} className="no-scrollbar flex gap-gutter overflow-x-auto px-5 pb-4 md:px-margin-desktop">
            {best.map((p) => (
              <Link key={p.slug} to={`/product/${p.slug}`} className="group w-[240px] shrink-0 md:w-[280px]">
                <div className="slow-zoom relative mb-4 aspect-[3/4] bg-surface-container">
                  {p.images[0] && <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
                  <QuickViewBtn slug={p.slug} onOpen={openQuickView} />
                </div>
                <h4 className="label-caps mb-1 text-primary">{p.name}</h4>
                <p className="label-caps text-on-surface-variant">{formatINR(p.price)}</p>
              </Link>
            ))}
          </Reveal>
        </section>
      )}

      {/* 7. Editorial banner */}
      <section className="relative flex h-[80vh] w-full items-center justify-center text-center">
        <img src={HOME_IMG.editorialBanner} alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.65]" />
        <Reveal className="relative z-10 px-5">
          <h2 className="mb-6 font-display-lg text-4xl text-white md:text-display-lg">
            Crafted by heritage. <br />
            <span className="font-normal italic">Styled for today.</span>
          </h2>
          <Link to="/story" className="inline-block bg-white px-12 py-4 label-caps text-primary transition-all hover:bg-secondary hover:text-white">
            View Our Story
          </Link>
        </Reveal>
      </section>

      {/* 8. Craft story */}
      <section className="bg-surface-container-high py-24">
        <div className="grid grid-cols-1 items-center gap-16 px-5 md:grid-cols-2 md:px-margin-desktop">
          <Reveal>
            <div className="slow-zoom aspect-[4/5] overflow-hidden">
              <img src={HOME_IMG.craftStory} alt="Hand-carved printing blocks" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h2 className="mb-8 font-headline-lg text-3xl text-primary md:text-headline-lg">The Rhythm of the Block</h2>
            <p className="mb-6 text-body-lg italic text-on-surface-variant">
              "A single yard of fabric represents thousands of rhythmic stamps, hours of precision, and a lineage of knowledge passed down through generations."
            </p>
            <p className="mb-10 text-body-md text-on-surface-variant">
              Parchhai celebrates the human touch in an automated world. Every slight variation in print is not a flaw, but a signature of the artisan, dyed with natural minerals and vegetable extracts.
            </p>
            <Link to="/crafts" className="inline-block bg-primary px-10 py-4 label-caps text-on-primary hover:bg-secondary">
              Our Artisan Community
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 9. Instagram */}
      <section className="border-t border-outline-variant/30 bg-surface-container-low px-5 py-24 md:px-margin-desktop">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 font-headline-lg text-3xl text-primary md:text-headline-lg">Follow the drops</h2>
          <p className="mb-10 text-body-md text-on-surface-variant">
            New collections, artisan stories and exclusive previews land on Instagram first. Orders are placed there too, in a DM with us.
          </p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-primary px-12 py-4 label-caps text-on-primary hover:opacity-90">
            @{SITE.instagramHandle} <MIcon name="arrow_outward" className="text-[18px]" />
          </a>
        </div>
      </section>
    </div>
  );
}

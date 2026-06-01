import { Link } from "react-router-dom";
import { useCrafts } from "@/lib/hooks";
import { PageLoader } from "@/components/ui";
import { Reveal, MIcon } from "@/components/Reveal";

export default function Crafts() {
  const { data: crafts, isLoading } = useCrafts();
  if (isLoading) return <PageLoader />;

  return (
    <div>
      {/* Hero */}
      <header className="mx-auto max-w-4xl px-5 pb-24 pt-24 text-center md:px-margin-desktop md:pb-section-gap">
        <span className="label-caps mb-4 block text-secondary">Our Provenance</span>
        <h1 className="mb-8 font-display-lg text-5xl leading-tight tracking-tighter text-primary md:text-display-lg">The Geometry of Heritage</h1>
        <p className="text-body-lg leading-relaxed text-on-surface-variant">
          Every thread tells a story of an ancestor's hands. We collaborate with master artisans in four historic clusters across India to revive techniques that have weathered centuries.
        </p>
      </header>

      <main className="space-y-24 pb-section-gap md:space-y-section-gap">
        {crafts?.map((c, i) => {
          const imageRight = i % 2 === 0;
          return (
            <Reveal key={c.id}>
              <section className="grid grid-cols-1 items-center gap-gutter px-5 md:grid-cols-12 md:px-margin-desktop">
                {/* Text */}
                <div className={`space-y-2 ${imageRight ? "md:col-span-4 md:order-1" : "md:col-span-5 md:order-2 md:pl-margin-desktop"}`}>
                  <div className="mb-4 flex items-center gap-2">
                    <MIcon name="location_on" fill className="text-secondary" />
                    <span className="label-caps tracking-widest text-on-surface-variant">{c.region.toUpperCase()}</span>
                  </div>
                  <h2 className="font-headline-lg text-4xl text-primary md:text-headline-lg">{c.name}</h2>
                  <p className="pr-4 text-body-md text-on-surface-variant">{c.story}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {c.dyes.slice(0, 4).map((d) => <span key={d} className="chip">{d}</span>)}
                  </div>
                  <div className="pt-6">
                    <Link to={`/shop?craft=${c.slug}`} className="group flex items-center gap-2 label-caps text-primary">
                      <span>Shop {c.name} pieces</span>
                      <MIcon name="arrow_forward" className="text-sm transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                {/* Image */}
                <div className={`group relative overflow-hidden ${imageRight ? "md:col-span-8 md:order-2" : "md:col-span-7 md:order-1"}`}>
                  <Link to={`/crafts/${c.slug}`} className="slow-zoom block">
                    <img src={c.heroImage ?? ""} alt={c.name} className="h-[420px] w-full object-cover md:h-[600px]" />
                  </Link>
                  <div className="absolute bottom-6 right-6 border border-outline/10 bg-surface/80 p-4 text-xs label-caps text-primary backdrop-blur-md">
                    {c.dyes[0] ?? "Natural dye"} resist
                  </div>
                </div>
              </section>
            </Reveal>
          );
        })}

        {/* Closing CTA */}
        <Reveal>
          <section className="mt-8 flex flex-col items-center border-t border-outline/10 px-5 pt-24 text-center md:px-margin-desktop">
            <h2 className="mb-8 max-w-xl font-headline-lg text-3xl text-primary md:text-headline-lg">The complete collection is now live.</h2>
            <Link to="/shop" className="bg-primary px-12 py-5 label-caps uppercase tracking-widest text-surface transition-all duration-500 hover:bg-secondary">Go to Shop</Link>
          </section>
        </Reveal>
      </main>
    </div>
  );
}

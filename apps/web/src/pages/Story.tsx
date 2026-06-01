import { Reveal, MIcon } from "@/components/Reveal";

const TIMELINE: [string, string][] = [
  ["1924", "Foundational Heritage"],
  ["1988", "The First Loom"],
  ["2014", "Global Collective"],
  ["2024", "Parchhai Launch"],
  ["FUTURE", "Zero Impact Goal"],
];

const ARTISANS: { name: string; role: string; seed: string }[] = [
  { name: "Ibrahim Khatri", role: "Master Dyer • Ajrakhpur, Gujarat", seed: "artisan-ibrahim" },
  { name: "Meera Devi", role: "Master Weaver • Chanderi, MP", seed: "artisan-meera" },
  { name: "Siddharth Rao", role: "Block Architect • Bagru, Rajasthan", seed: "artisan-sid" },
];

export default function Story() {
  return (
    <main>
      {/* Definition hero */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center md:px-margin-desktop">
        <Reveal>
          <h1 className="mb-12 max-w-4xl font-display-lg text-5xl text-primary md:text-display-lg">The Shadow of Heritage.</h1>
        </Reveal>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-gutter md:grid-cols-12">
          <Reveal delay={200} className="text-left md:col-span-5">
            <p className="label-caps mb-4 text-secondary">Definition</p>
            <h2 className="mb-6 font-headline-lg text-3xl italic text-primary md:text-headline-lg">Parchhai /pərˈtʃʰaɪ/</h2>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              In Hindustani, it means shadow or reflection. To us, it represents the silhouette of the past cast upon the textiles of the future. Every block-print is a reflection of the artisan's soul, preserving a lineage that refuses to fade.
            </p>
          </Reveal>
          <Reveal delay={400} className="md:col-span-7">
            <div className="slow-zoom aspect-[4/5] w-full bg-surface-variant p-2">
              <img src="https://picsum.photos/seed/parchhai-block/1000/1200" alt="" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pull quote */}
      <section className="bg-primary px-5 py-24 text-surface md:px-margin-desktop md:py-section-gap">
        <Reveal className="mx-auto max-w-5xl text-center">
          <MIcon name="format_quote" fill className="mb-8 text-6xl text-secondary-container" />
          <blockquote className="mb-8 font-display-lg text-3xl italic leading-tight md:text-headline-lg">
            "Sustainability is not a modern trend for us; it is the ancestral rhythm of the loom, the natural bleed of the dye, and the dignity of the hand that crafts."
          </blockquote>
          <cite className="label-caps not-italic tracking-widest">The Artisan's Manifesto</cite>
        </Reveal>
      </section>

      {/* Sustainability */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <Reveal>
            <img src="https://picsum.photos/seed/parchhai-dye/1000/1000" alt="" className="aspect-square w-full object-cover" />
          </Reveal>
          <Reveal delay={200} className="flex flex-col gap-12">
            <div>
              <h3 className="mb-4 font-headline-md text-2xl text-primary md:text-headline-md">Natural Dye Integrity</h3>
              <p className="text-body-md text-on-surface-variant">We exclusively use plant-based pigments — Indigofera, Madder Root, and Pomegranate peels. Our water cycles are closed, returning only purity to the earth from which our colours are born.</p>
            </div>
            <div className="border-l-2 border-secondary pl-8">
              <h3 className="mb-4 font-headline-md text-2xl text-primary md:text-headline-md">The Fair-Wage Promise</h3>
              <p className="text-body-md text-on-surface-variant">Every artisan is a shareholder in our journey. We bypass middlemen to ensure 40% higher than industry-standard wages, supporting the weaving clusters across Kutch and Bagru.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Timeline strip */}
      <section className="overflow-hidden border-y border-outline-variant/30 bg-surface-container py-24">
        <div className="flex gap-20 overflow-x-auto px-5 md:gap-32 md:px-margin-desktop">
          {TIMELINE.map(([year, label]) => (
            <div key={year} className="flex shrink-0 flex-col">
              <span className="font-display-lg text-headline-lg text-secondary/30">{year}</span>
              <span className="label-caps text-primary">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Artisan portraits */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <Reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="mb-4 font-display-lg text-3xl text-primary md:text-headline-lg">Our Craftsmen.</h2>
            <p className="text-body-md text-on-surface-variant">Meeting the hands that breathe life into Parchhai. These are not workers; they are custodians of a thousand-year-old language.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {ARTISANS.map((a, i) => (
            <Reveal key={a.name} delay={i * 150} className={i === 1 ? "md:mt-10" : ""}>
              <div className="mb-6 aspect-[3/4] overflow-hidden bg-surface-dim">
                <img src={`https://picsum.photos/seed/${a.seed}/800/1000`} alt={a.name} className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0" />
              </div>
              <h4 className="font-headline-md text-2xl text-primary md:text-headline-md">{a.name}</h4>
              <span className="label-caps text-secondary">{a.role}</span>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

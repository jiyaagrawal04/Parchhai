import { Link } from "react-router-dom";
import { useBanners, useCategories, useCrafts, useProducts } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";
import { Reveal, MIcon } from "@/components/Reveal";

const QuickViewBtn = ({ slug, onOpen }: { slug: string; onOpen: (s: string) => void }) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(slug); }}
    className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface/95 px-5 py-2 label-caps text-[10px] text-primary opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-300 hover:bg-primary hover:text-on-primary group-hover:opacity-100"
  >
    Quick View
  </button>
);

// Editorial imagery for purely-presentational sections (mirrors the approved Stitch mockup).
const IMG = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuA11L-4F8sDBxje2nMy6fAqDXbx8AiFT4UfRHogbhxLoUY7AoXD5OqvoKPpOvw1XRTtVj_1HrZwqM4oRj-GFzFHmGVDGgVP1wrbg_fbfbcjh_0wwSjel7ZHLpQOZyJC6_F57VQ71veZLF3gOVWNhpPzLjoLTtIpRxjXyYbqJa5XlGOH6v_GhOAwAzoEIYB4WO-rkkQ2yAD4uovdZ6S69JvdrOxjku0O4zW0STnsm-yyEURva8YbKbR7lCUC4PPji38lbUNTs2Bmosf7",
  craftStory: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBLDNjy8LWewoQBz99c8t1glybdImOmehgelYD3tfWvI8J6EIAiLCqoF1X5BBDolRHk-RGMAbUevspLHROWup1VY94vQxsZ5nI227Z_N4qKyqSsegfSPeF7USldaeujoWiEg0BrUT1Hh2GmIG0fPhfmyb-clwBsUtc0DrCxiDxh6JWlCyrklAV3-YFvJR6hvZykFgZDl6vn-m-fVEYn2u64Wpzep92PBneVkT3ifAnPO2kOk8kaQJ19Ckd5dYmVeDelxGQIiwX6DNv",
  editorialBanner: "https://lh3.googleusercontent.com/aida-public/AB6AXuADfgrExiFO5HcXnR6IzkdMLWCfBr03sy2pjJxfhvq0RaEI4cTLLhTgvwSLSeLbP-qn-ZQs27BxjUKZH0vnULQ76eu08oqPGB52SL1mBRJNJGYaVOvXseHPBBZsQENGIVpkPBcwu6XhJuWFlOlUNEPSn9tzHmrCuR2DIBkw8WA1r_M__9s0xm7bia55p_KLlNoA3yqqMreYPwHN4-Iw5LVZLXhyoXBBDGEo3OnNe0-V9q7_SpwlLp1oFvE-kx7wJznMNdmapwyu99SH",
  shopLook: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKKdP0JaTaJvusA4zVbvLzY_O8L3Pr6uNWbkvyXJyzERnhpmyJ2lUjmXoovunW3aS1vWrFdpbH61g68F7ov3EgriZ4PxwCLBm009W3Eqxtd_ZubOuur8MO3dU1nRM20aQ7MhLxwn8zhNUzNG_LGXW1nSW7NMQXXSIfamOyMM-tLXxX1TxQIQELGcAF2ytF814uFCWVckzwGWHXd46przRomajB8ad1w4helQI_qW2Sx2Wi5gDGD2_qiFvPlVKLIu1A9TTHVY5QguH4",
};

const CATEGORY_IMG = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_AJdEu0PtT6oL7B3DTi1r4wL6uC7TDL9wFJqaKujOA1fqlRa2drU0X-vA95aGKzrWG80KvRMdnIRi4cESnXsbVL22H3o73t1msvrCTliWxOz8B91k7AxPsk14opZ6ZCY49JTEjBxmmYDEjZqg2uZEV08NLH-bPKqzhV4odIlkNAfFPvRLqc8KwpNl4J8-mo-VBeE_hw1PSAVnQysYNK18aC4OwVUoy-rFw9oQZZy5Ey2ctP3FBqMPrILY3VmWeBpFiNydnGA2YV4r",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCPrVnPIppafkqOS3Wic_iIgvYdPwh_4Sd0k-kFJN6282pUG_WOkL8W11Qjl_otlVighQ9rP4-1GlTtd_TufmHT4IDsZIq-Vj7jSpdFoV1VQi4vpmru57XCM1lF32TreW-g36pZMGTvmSve_MZZ4_OCpCkCvcVpW3twWrufSLdD3sEjDrj2A9ul90SrdNqKBaV10y9l80-LXy6B8qUPokS4J19A_a_wkbQfkB4xO1vPcZ-0hri2rbFg7Mbh1xVsB1qYGQtI21CLfZ_g",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBSDtJHp9QmJHlCuOldNld1rteKQLRYig0phICr342K4xJdnCnhXEWLsJz0K75Kvy3Q2yRGcAEVT1_G9nfKhl0AfjOxUDbSZKsUTIbQduyHAsCW_1tzQAhR3cp5ctAkiUkhMbmeuR8J4s6No5ucwPGg9D2pJbJpCywkTjB2fLFu3wGJL-xd4oT37nZjgvAUbjAaaRsQiOZWltZ_9PzYzXNkzS0ofkCuVekbBZVi1xcTt5NMQ8VfrPfd2NFQ6PGJliGp69rBcRVn0Ick",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA_cWdjalZFGr524njHh7V5JaAwWQEsxgJBu_8YO6xEBJnZHf7IjZovyspfgb0Igvb8K-KnfrQaX2UDr-tUrT-_K_hiIb7cfgtH7DN6hV7KK8Je6Vh2Tz8X70DCRjQWOOuYqp4UA1aAPDlZacl6B8nkXJiniz6fgqLzp5YdSeV58p9yDJ4nbAqh_Qzuumai1IaKmgVSJNshe72JClJ5uYoXwAr94yMHo6buhSGg-lDjyJlW3JoBfN70lc4_ajuviWiIDmCI4qhQdsTK",
];

const COMMUNITY_IMG = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA41odvAmqiSVICGLGqvtf8wOXPKWue0RpRojMIRWCeVeowwJlZsvunCjG0owQ_JHQdXnxF0ik0sOIr4uQVmSpN0-1V_5poGLfXce4MipmumcYVw0Lgb_YtpTy7AvaQDEBggRnKdrIAD1FNd4TSl8E9JBcW7zmp45zANB1LX4rfEGVAWMVgtWsYrQRcA_4C1UDAfnEJMTcVE0fZ-zBrEoriPdBX3GBx7ZMmUg22EGUOtWPfzxdocM6JOjrdsHgdQn4gZ7mL-kt_jh0x",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAH7sYGcSFWeviWdY_64gjSh9oY0zlSWSugm4EzVdr2UTAPDxMPv0pFKCpSv8voTtF2LvzfjPZkTcuexD8CqI6jU6dmyFA5w-5FtyVCCeVZM5wRStd1-sy9AjXq-cRgPOuxhUhyHSttkJ66vber7q5ys_4JkdJGPBhmvCn0NVwR1fNMYM6Rx8Qt4kgdy6vIRKiZTI0-U0n2gTTBFAsgs86pGCkoRR_ZxhiAeNqHGr5h_ZkIoW4kOgseEjrrMpALiety9glZneiVZnjZ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBUG81KcfR-5n0RzoSKkesfQGJ5erbLz2VKD_PmtaXeLeLnG8218fQQcMe9c1YR8pGdPuriFePZ3e8XNGC0SOb2PWA97Eqeoj0OR4LqEF2UaIFNu5S8qLH7z5xGdtY7vMwF8Y-J22yRsmKyqbLx41HjrRaGq_Zm8s3GvQrbuzN8UdRj2S8Q0w60MfrRlGoz5rj3WfGKsFM7AOoE7NNgloMZimZdvNTfPmokQb9b429OhAUKFlFVb9rRBFWlVBALndVtWmJ-cAwviQ5L",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBL9VT_PSgiGzYGSAAi-lYT0DCzUbqN5faqqH5nF1Dt46n8KUenbsnXZgWFoNts9UpGEJu286fR2fN0DtNuPM2h153xlon2uqQer7elXImevZlxt2rWtk5iZzjOv4dw1CxFqdd6YHFfXC6OJ7UVnl8DuRR5rqj7Gre18uKqYF5IMi74WJcxidTPcviPykDKHKBKMMqzIv0vMLP6lBYMjaUfuFEnLBNCqKl4koWZCyB6v0FMJWm4dp9m8DCzg1mFHSEYwdp8K017FOEq",
];

// Curated imagery per craft (falls back to the DB heroImage for any new crafts added later).
const CRAFT_IMG: Record<string, string> = {
  ajrakh: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzIl-73DtJqZdu5Hq6CY7AW8UNEr6S5IZfZNKSxJ3OFtLY01eebLuKiTh1MpXIwbHlv4TAuWVElwWqjj1NKyQA7dYGy2a5tBmkvvktEBGKpL7a6fRe5yIgouxebotSdA39MmikPo18wittmX1oVZNa9L5GXPpgVSL0tD-hAQek-mcyiSBNB7q8pdg97nJGWLrL3RV3CFxorAmU5w7GcDzPQOA0yrDZ9jKaUU7MsFDyj_xqD7YzCiXi7bjaAIju5U83hFhtPPOBVVfa",
  bagru: "https://lh3.googleusercontent.com/aida-public/AB6AXuACbZ8ZgkqZUtQHCEdTNyy1hmCllmXR8A6ZqvIOubQBoaUCE5YIPk9nS1xpTRnxnvwynXmv-p9250hbZX-uCKD4ta0EVf3YczO7sqzEz8_gnGWPcfAH3bbcVFRs_r9DuvdDqhAROKlvSrp8OzS9cka9ZY_t979gGML5-rZQcHyD4stSU8hNybkHy9MPGLiPljQx77hGQDpiuN3G9I-7B4TYPCdRqXMilQElJ-9QHk8ZXUVG_uLHgyGRUjCbZLfxu_agchUBChQQ-FMW",
  dabu: "https://lh3.googleusercontent.com/aida-public/AB6AXuAptDlNCZb40MUszL_n7VP2RT1YyN_RbYRS3yZjZq0gAZbzt-8gC_MaWSeylG2xaX1OEDlQhdp5gWJSsB_t6DmFCpa4Sst-sp3kD8bXm0sPfcoijDhEN_Ax1szRnttFHHxbbq5wIIK5irnpWcAHTxOb949mNQyvDH8VsiTIVfzX9wxXsrOKXLSOotXcpJv-5rG8yyy3qVm2ZPuNkBFQxxSxCs_l91zLyzJw2vz86gAbC1R__cYI1IP3by1I_S26WR1ImhFy8Y0pdvGJ",
  "dabu-bagru": "https://lh3.googleusercontent.com/aida-public/AB6AXuBCBExL9QHwYnljfYpnpbx3svxDAYlwJ6Xqb5reaHZcaASKcB37b7BioKtmsBWmWh4zgzA6ZlaX4Te2wW4MtaeN1QqnMfj8kKTAtT-OUb-HbmhhRx6U1-lnGR5neLrvY9IGnZiRqngjg6nQAO1Vm1tn30XGCk610J_YNajSir0Hl2pkwOyzQdITv6rsHfGHsu85V0p3qwK0aeWIhsbBk8lT-usQNRkuYJ5Ds_byxQTOtemNJIoX2s2JaVNo9fLMt6msmJj6NugxjX7Z",
};

const ANNOUNCE = [
  "Free delivery over ₹999",
  "WELCOME10 — 10% off your first order (min ₹999)",
  "WELCOME5 — 5% off (min ₹599)",
  "Hand-block printed in India",
  "Naturally dyed · slow fashion",
];

export default function Home() {
  const { data: banners } = useBanners();
  const { data: crafts } = useCrafts();
  const { data: categories } = useCategories();
  const { data: newest } = useProducts({ pageSize: 8, sort: "newest" });
  const { data: popular } = useProducts({ pageSize: 8, sort: "popular" });
  const { openQuickView } = useUI();

  const hero = banners?.find((b) => b.placement === "home_hero");
  const arrivals = (newest?.items ?? []).slice(0, 4);
  const bestSellers = (popular?.items ?? []).slice(0, 8);
  const heritageCrafts = crafts ?? [];

  return (
    <div>
      {/* 1. Hero */}
      <section className="relative flex h-screen w-full items-center overflow-hidden px-5 md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <img src={hero?.image && !hero.image.includes("picsum.photos") ? hero.image : IMG.hero} alt="" className="h-full w-full object-cover object-center brightness-[0.7]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <Reveal className="relative z-10 max-w-3xl">
          <h1 className="mb-6 font-display-lg text-5xl leading-[1.05] text-white md:text-display-lg">
            Style Your <br />
            <span className="font-normal italic">Shadow</span>
          </h1>
          <p className="mb-10 max-w-lg text-body-lg text-white/85">
            Parchhai means reflection — the living crafts of Indian hand-block printing, reimagined in contemporary silhouettes. Naturally dyed, printed by hand, made to be lived in.
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

      {/* 2. Announcement ticker — scrolling */}
      <section className="overflow-hidden bg-primary py-3 text-on-primary">
        <div className="marquee-container">
          <div className="marquee-content">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                {ANNOUNCE.map((a, i) => (
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

      {/* 3. Heritage crafts — clean uniform grid (scales to any number of crafts) */}
      <section className="bg-surface px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="mb-12 text-center">
          <span className="label-caps mb-3 block text-secondary">Provenance</span>
          <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Our Heritage Crafts</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-md text-on-surface-variant">
            Tracing the rhythmic stamping of wooden blocks across the heartlands of India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-gutter lg:grid-cols-4">
          {heritageCrafts.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 100}>
              <Link to={`/crafts/${c.slug}`} className="group relative block overflow-hidden">
                <div className="slow-zoom aspect-[3/4]">
                  <img src={CRAFT_IMG[c.slug] ?? c.heroImage ?? ""} alt={c.name} className="h-full w-full object-cover" />
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

      {/* 4. New arrivals — staggered product grid */}
      <section className="bg-surface-container-low px-5 py-24 md:px-margin-desktop">
        <div className="mb-16 text-center">
          <span className="label-caps mb-4 block text-on-surface-variant">Just Arrived</span>
          <h2 className="font-display-lg text-4xl text-primary md:text-display-lg">New Arrivals</h2>
        </div>
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {arrivals.map((p, i) => (
            <Reveal key={p.id} delay={i * 120}>
              <Link to={`/product/${p.slug}`} className="group block">
                <div className="slow-zoom relative mb-6 aspect-[4/5] bg-surface-variant">
                  {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
                  {i === 0 && <span className="absolute left-4 top-4 bg-primary px-3 py-1 text-[10px] uppercase tracking-tight text-on-primary">New In</span>}
                  <QuickViewBtn slug={p.slug} onOpen={openQuickView} />
                </div>
                <div className="text-center">
                  <h4 className="mb-1 text-body-md text-primary group-hover:underline">{p.name}</h4>
                  <p className="label-caps text-on-surface-variant">{formatINR(p.basePrice)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-20 text-center">
          <Link to="/shop" className="label-caps inline-flex items-center gap-2 border-b border-primary pb-1 text-primary hover:opacity-70">
            View All Arrivals <MIcon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </section>

      {/* 5. Best sellers carousel */}
      {bestSellers.length > 0 && (
        <section className="overflow-hidden py-24">
          <Reveal className="mb-12 flex items-center justify-between px-5 md:px-margin-desktop">
            <h2 className="font-headline-lg text-3xl text-primary md:text-headline-lg">Best Sellers</h2>
            <Link to="/shop?sort=popular" className="label-caps text-on-surface-variant hover:text-secondary">Shop all</Link>
          </Reveal>
          <Reveal delay={150} className="no-scrollbar flex gap-gutter overflow-x-auto px-5 pb-4 md:px-margin-desktop">
            {bestSellers.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group w-[280px] shrink-0">
                <div className="slow-zoom relative mb-4 aspect-[3/4] bg-surface-container">
                  {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
                  <QuickViewBtn slug={p.slug} onOpen={openQuickView} />
                </div>
                <h4 className="label-caps mb-1 text-primary">{p.name}</h4>
                <p className="label-caps text-on-surface-variant">{formatINR(p.basePrice)}</p>
              </Link>
            ))}
          </Reveal>
        </section>
      )}

      {/* 6. Shop by category — dark section */}
      <section className="bg-primary py-24 text-on-primary">
        <div className="grid grid-cols-2 gap-gutter px-5 md:grid-cols-4 md:px-margin-desktop">
          {(categories ?? []).slice(0, 4).map((c, i) => (
            <Reveal key={c.id} delay={i * 120}>
              <Link to={`/shop?category=${c.slug}`} className="group flex flex-col items-center text-center">
                <div className="slow-zoom mb-6 aspect-square w-full overflow-hidden bg-white/10">
                  <img src={CATEGORY_IMG[i % CATEGORY_IMG.length]} alt={c.name} className="h-full w-full object-cover opacity-80" />
                </div>
                <h3 className="font-headline-md text-2xl group-hover:italic">{c.name}</h3>
                <span className="label-caps mt-2 text-[11px] opacity-60">Explore All</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. Editorial banner */}
      <section className="relative flex h-[80vh] w-full items-center justify-center text-center">
        <img src={IMG.editorialBanner} alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.65]" />
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
              <img src={IMG.craftStory} alt="Hand-carved printing blocks" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h2 className="mb-8 font-headline-lg text-3xl text-primary md:text-headline-lg">The Rhythm of the Block</h2>
            <p className="mb-6 text-body-lg italic text-on-surface-variant">
              “A single yard of fabric represents thousands of rhythmic stamps, hours of precision, and a lineage of knowledge passed down through generations.”
            </p>
            <p className="mb-10 text-body-md text-on-surface-variant">
              Parchhai celebrates the human touch in an automated world. Every slight variation in print is not a flaw, but a signature of the artisan — dyed with natural minerals and vegetable extracts.
            </p>
            <Link to="/crafts" className="inline-block bg-primary px-10 py-4 label-caps text-on-primary hover:bg-secondary">
              Our Artisan Community
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 9. Community grid */}
      <section className="px-5 py-24 md:px-margin-desktop">
        <div className="mb-16 text-center">
          <h2 className="mb-2 font-headline-md text-2xl text-primary md:text-headline-md">#ParchhaiCircle</h2>
          <p className="label-caps text-on-surface-variant">Share your style journey with us</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {COMMUNITY_IMG.map((src, i) => (
            <Reveal key={i} delay={i * 100} className="slow-zoom aspect-square overflow-hidden bg-surface-container">
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 10. Newsletter */}
      <section className="border-t border-outline-variant/30 bg-surface-container-low px-5 py-24 md:px-margin-desktop">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-6 font-headline-lg text-3xl text-primary md:text-headline-lg">Join the Parchhai Circle</h2>
          <p className="mb-10 text-body-md text-on-surface-variant">Be the first to explore new collections, artisan stories, and exclusive previews.</p>
          <form className="flex flex-col gap-4 md:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input className="flex-1 border-b border-primary bg-transparent px-0 py-4 outline-none placeholder:text-on-surface-variant/60" placeholder="Your Email Address" type="email" />
            <button className="whitespace-nowrap bg-primary px-12 py-4 label-caps text-on-primary hover:opacity-90" type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

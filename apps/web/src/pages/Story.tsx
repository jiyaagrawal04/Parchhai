import { Link } from "react-router-dom";
import { Reveal, MIcon } from "@/components/Reveal";

const IMG = {
  meaning:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBLDNjy8LWewoQBz99c8t1glybdImOmehgelYD3tfWvI8J6EIAiLCqoF1X5BBDolRHk-RGMAbUevspLHROWup1VY94vQxsZ5nI227Z_N4qKyqSsegfSPeF7USldaeujoWiEg0BrUT1Hh2GmIG0fPhfmyb-clwBsUtc0DrCxiDxh6JWlCyrklAV3-YFvJR6hvZykFgZDl6vn-m-fVEYn2u64Wpzep92PBneVkT3ifAnPO2kOk8kaQJ19Ckd5dYmVeDelxGQIiwX6DNv",
  hero:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA11L-4F8sDBxje2nMy6fAqDXbx8AiFT4UfRHogbhxLoUY7AoXD5OqvoKPpOvw1XRTtVj_1HrZwqM4oRj-GFzFHmGVDGgVP1wrbg_fbfbcjh_0wwSjel7ZHLpQOZyJC6_F57VQ71veZLF3gOVWNhpPzLjoLTtIpRxjXyYbqJa5XlGOH6v_GhOAwAzoEIYB4WO-rkkQ2yAD4uovdZ6S69JvdrOxjku0O4zW0STnsm-yyEURva8YbKbR7lCUC4PPji38lbUNTs2Bmosf7",
  ourStory:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBCBExL9QHwYnljfYpnpbx3svxDAYlwJ6Xqb5reaHZcaASKcB37b7BioKtmsBWmWh4zgzA6ZlaX4Te2wW4MtaeN1QqnMfj8kKTAtT-OUb-HbmhhRx6U1-lnGR5neLrvY9IGnZiRqngjg6nQAO1Vm1tn30XGCk610J_YNajSir0Hl2pkwOyzQdITv6rsHfGHsu85V0p3qwK0aeWIhsbBk8lT-usQNRkuYJ5Ds_byxQTOtemNJIoX2s2JaVNo9fLMt6msmJj6NugxjX7Z",
  craft:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAptDlNCZb40MUszL_n7VP2RT1YyN_RbYRS3yZjZq0gAZbzt-8gC_MaWSeylG2xaX1OEDlQhdp5gWJSsB_t6DmFCpa4Sst-sp3kD8bXm0sPfcoijDhEN_Ax1szRnttFHHxbbq5wIIK5irnpWcAHTxOb949mNQyvDH8VsiTIVfzX9wxXsrOKXLSOotXcpJv-5rG8yyy3qVm2ZPuNkBFQxxSxCs_l91zLyzJw2vz86gAbC1R__cYI1IP3by1I_S26WR1ImhFy8Y0pdvGJ",
  sustain:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCzIl-73DtJqZdu5Hq6CY7AW8UNEr6S5IZfZNKSxJ3OFtLY01eebLuKiTh1MpXIwbHlv4TAuWVElwWqjj1NKyQA7dYGy2a5tBmkvvktEBGKpL7a6fRe5yIgouxebotSdA39MmikPo18wittmX1oVZNa9L5GXPpgVSL0tD-hAQek-mcyiSBNB7q8pdg97nJGWLrL3RV3CFxorAmU5w7GcDzPQOA0yrDZ9jKaUU7MsFDyj_xqD7YzCiXi7bjaAIju5U83hFhtPPOBVVfa",
};

const VALUES: { title: string; body: string }[] = [
  { title: "Craft Matters", body: "Behind every print is a pair of hands, a carved block, and a memory passed down through generations. We treat that craft as the hero — never the afterthought." },
  { title: "Quality Over Quantity", body: "We don't chase the calendar of fast fashion. We make fewer, finer pieces in pure cotton — meant to be worn, loved, and kept far beyond a single season." },
  { title: "Heritage Made Modern", body: "Tradition shouldn't live only in a museum or a wedding trunk. We translate age-old prints into silhouettes that belong in your everyday, contemporary wardrobe." },
  { title: "Fashion With Meaning", body: "What you wear can carry a story. Every Parchhai piece keeps a craft alive, supports the artisan who made it, and lets you wear culture with intention." },
];

const JOURNEY: { year: string; label: string }[] = [
  { year: "2025", label: "Founded in the first year of college" },
  { year: "2025–26", label: "Tested the market, listened, learned" },
  { year: "2026", label: "Relaunched — refined, built to last" },
];

const FOUNDERS: { initials: string; name: string; role: string; bio: string }[] = [
  {
    initials: "JA",
    name: "Jiya Agrawal",
    role: "Founder",
    bio: "Jiya started Parchhai in 2025, in the first year of her college, with a single conviction — that India's hand-block crafts belong in the way young India dresses today. She leads the brand's creative vision, shaping a label where heritage feels current, intentional, and quietly luxurious.",
  },
  {
    initials: "SK",
    name: "Saanvi Kaul",
    role: "Co-Founder",
    bio: "Saanvi joined the idea early and helped shape it into a brand. Together they tested the market, listened closely, and returned in 2026 with a sharper vision. She shapes how Parchhai meets the world — its voice, its community, and its devotion to the artisans behind the cloth.",
  },
];

export default function Story() {
  return (
    <main>
      {/* SECTION 0 — The meaning of Parchhai */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <p className="label-caps mb-5 text-secondary">The Meaning of Parchhai</p>
            <h1 className="mb-3 font-display-lg text-5xl text-primary md:text-6xl">Parchhai</h1>
            <p className="mb-8 font-headline-md text-xl italic text-on-surface-variant">/pərˈtʃʰaɪ/ — in Hindustani, shadow or reflection.</p>
            <p className="mb-6 text-body-lg leading-relaxed text-on-surface-variant">
              To us, it is the silhouette of the past cast upon the textiles of the future. Every block printed by hand is a reflection of the artisan's soul — a lineage that refuses to fade.
            </p>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              We did not set out to build a clothing label. We set out to keep a reflection alive — and to let you carry it with you.
            </p>
          </Reveal>
          <Reveal delay={200} className="md:col-span-6">
            <div className="slow-zoom aspect-[4/5] w-full overflow-hidden bg-surface-container">
              <img src={IMG.meaning} alt="Hand-carved printing blocks resting on indigo-dyed cloth" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 1 — Hero banner */}
      <section className="relative flex min-h-[90vh] w-full items-center overflow-hidden">
        <img src={IMG.hero} alt="" className="absolute inset-0 h-full w-full object-cover brightness-[0.6]" />
        <Reveal className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-margin-desktop">
          <h2 className="font-display-lg text-5xl leading-[1.05] text-white md:text-display-lg">More Than Clothing.</h2>
          <p className="mt-5 font-headline-lg text-2xl italic text-white/90 md:text-3xl">
            A Reflection of Culture.<br />A Reflection of Self.
          </p>
          <p className="mt-8 max-w-xl text-body-lg text-white/80">
            Parchhai exists to bring India's authentic hand-block printed textiles into the modern wardrobe — where craft that has lived for centuries meets the way you dress, move, and live today.
          </p>
        </Reveal>
      </section>

      {/* SECTION 2 — Our Story */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <Reveal>
            <div className="slow-zoom aspect-[4/5] w-full overflow-hidden bg-surface-container">
              <img src={IMG.ourStory} alt="Hand-block printed garments in a sunlit atelier" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={200}>
            <p className="label-caps mb-5 text-secondary">Our Story</p>
            <h2 className="mb-8 font-display-lg text-3xl text-primary md:text-headline-lg">It began with a single length of cloth.</h2>
            <div className="space-y-5 text-body-md leading-relaxed text-on-surface-variant">
              <p>We fell for the quiet magic of Indian hand-block printing — the rhythm of a carved block meeting cotton, the imperfections that make every metre one of a kind, the patience of a craft measured in generations, not minutes.</p>
              <p>And we watched it slip away. These prints, once part of everyday life, were fading from everyday wardrobes — reserved for occasions, or replaced by the machine-made.</p>
              <p>Parchhai was born to change that: to make heritage feel relevant to a younger generation. We take authentic hand-block printed cottons and cut them into contemporary silhouettes — pieces you'll actually reach for on an ordinary Tuesday.</p>
              <p>We are, at heart, a bridge — between the artisan and the wardrobe, between where we come from and how we choose to live now.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 3 — What we believe */}
      <section className="bg-surface-container-low px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <Reveal className="mb-16 text-center">
          <p className="label-caps mb-3 text-secondary">What We Believe</p>
          <h2 className="font-display-lg text-3xl text-primary md:text-headline-lg">Our quiet convictions.</h2>
        </Reveal>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px overflow-hidden border border-outline-variant/40 bg-outline-variant/40 md:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={(i % 2) * 120} className="bg-surface-container-low p-8 md:p-12">
              <span className="font-display-lg text-2xl text-outline-variant">0{i + 1}</span>
              <h3 className="mb-3 mt-4 font-headline-md text-2xl text-primary">{v.title}</h3>
              <p className="text-body-md leading-relaxed text-on-surface-variant">{v.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 4 — The Craft */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <Reveal delay={150} className="md:order-2">
            <div className="slow-zoom aspect-[4/5] w-full overflow-hidden bg-surface-container">
              <img src={IMG.craft} alt="An artisan pressing a wooden block onto cotton" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal className="md:order-1">
            <p className="label-caps mb-5 text-secondary">The Craft</p>
            <h2 className="mb-8 font-display-lg text-3xl text-primary md:text-headline-lg">Printed by hand, block by block.</h2>
            <div className="space-y-5 text-body-md leading-relaxed text-on-surface-variant">
              <p>Hand-block printing is slow on purpose. A design is hand-carved into teak, dipped in natural dye, and pressed onto cotton — one careful impression at a time, repeated across the length of every metre.</p>
              <p>The artisan is not a machine operator; they are the author. The slight shift of a motif, the gentle bleed of an indigo, the breath of negative space — these are signatures, not flaws. No two pieces are ever truly identical.</p>
              <p>To preserve this craft is to protect the people who carry it, and the knowledge that lives in their hands. When you wear Parchhai, you keep that knowledge in circulation — and the craftsperson behind it, in work.</p>
            </div>
            <Link to="/crafts" className="label-caps mt-8 inline-flex items-center gap-2 border-b border-primary pb-1 text-primary hover:opacity-70">
              Explore the crafts <MIcon name="arrow_forward" className="text-[16px]" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* SECTION 5 — Meet the Founders */}
      <section className="bg-surface-container px-5 py-24 md:px-margin-desktop md:py-section-gap">
        <Reveal className="mb-12 text-center">
          <p className="label-caps mb-3 text-secondary">Meet the Founders</p>
          <h2 className="font-display-lg text-3xl text-primary md:text-headline-lg">The vision behind the reflection.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-body-md text-on-surface-variant">
            Parchhai began in 2025, in Jiya's first year of college — a small idea carried by a big conviction. Saanvi soon joined, and together they spent the next year testing the market, listening, and learning. In 2026, they relaunched Parchhai: refined, intentional, and built for the long run.
          </p>
        </Reveal>

        {/* Founding journey */}
        <Reveal delay={150} className="mx-auto mb-16 flex max-w-4xl flex-col items-stretch justify-center gap-px overflow-hidden border border-outline-variant/40 bg-outline-variant/40 sm:flex-row">
          {JOURNEY.map((j) => (
            <div key={j.year} className="flex-1 bg-surface px-6 py-6 text-center">
              <p className="font-display-lg text-2xl text-secondary">{j.year}</p>
              <p className="label-caps mt-2 text-[10px] text-on-surface-variant">{j.label}</p>
            </div>
          ))}
        </Reveal>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-gutter sm:grid-cols-2">
          {FOUNDERS.map((f, i) => (
            <Reveal key={f.name} delay={i * 150} className="bg-surface p-8 text-center md:p-10">
              <div className="mx-auto mb-6 flex aspect-square w-28 items-center justify-center border border-outline-variant bg-surface-container-low">
                <span className="font-display-lg text-4xl text-primary">{f.initials}</span>
              </div>
              <h3 className="font-headline-md text-2xl text-primary">{f.name}</h3>
              <p className="label-caps mt-1 text-secondary">{f.role}</p>
              <p className="mt-5 text-body-md leading-relaxed text-on-surface-variant">{f.bio}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 6 — Looking ahead */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center md:px-margin-desktop md:py-section-gap">
        <Reveal>
          <p className="label-caps mb-3 text-secondary">Looking Ahead</p>
          <h2 className="mb-8 font-display-lg text-3xl text-primary md:text-headline-lg">A reflection, carried forward.</h2>
          <div className="mx-auto max-w-2xl space-y-5 text-body-lg leading-relaxed text-on-surface-variant">
            <p>We see hand-block printed fashion becoming a natural part of the modern wardrobe — not a costume, but a choice. We see the artisan communities behind our cloth celebrated, not hidden. And we see a community of people who wear their values as easily as they wear their clothes.</p>
            <p>Our promise is timelessness: pieces that outlive trends, that gather meaning with every wear, that you'll one day pass on.</p>
          </div>
          <p className="mx-auto mt-12 max-w-2xl font-display-lg text-2xl italic text-primary md:text-3xl">
            Parchhai is your shadow in cloth — the past, reflected in everything you choose to become.
          </p>
          <Link to="/shop" className="label-caps mt-10 inline-block bg-primary px-12 py-4 text-on-primary transition-opacity hover:opacity-90">
            Wear the Reflection
          </Link>
        </Reveal>
      </section>
    </main>
  );
}

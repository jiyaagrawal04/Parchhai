import { Link } from "react-router-dom";
import { useJournal } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { Empty, PageLoader, SectionTitle } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export default function Journal() {
  const { data: posts, isLoading } = useJournal();
  if (isLoading) return <PageLoader />;
  return (
    <div className="container-px py-12">
      <SectionTitle eyebrow="Stories" title="The Journal" />
      {posts && posts.length > 0 ? (
        <div className="grid gap-10 md:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 100}>
              <Link to={`/journal/${p.slug}`} className="group block">
                <div className="slow-zoom aspect-[4/3] bg-line">
                  {p.coverImage && <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted">{p.publishedAt ? formatDate(p.publishedAt) : ""}</p>
                  <h3 className="mt-1 font-serif text-xl text-indigo group-hover:text-rust">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-ink/70">{p.excerpt}</p>}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <Empty title="No stories yet" />
      )}
    </div>
  );
}

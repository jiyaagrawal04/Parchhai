import { Link, useParams } from "react-router-dom";
import { useJournalPost } from "@/lib/hooks";
import { formatDate } from "@/lib/format";
import { PageLoader } from "@/components/ui";

export default function JournalPost() {
  const { slug = "" } = useParams();
  const { data: post, isLoading } = useJournalPost(slug);
  if (isLoading) return <PageLoader />;
  if (!post) return <div className="container-px py-20">Story not found.</div>;
  return (
    <article className="container-px mx-auto max-w-3xl py-12">
      <Link to="/journal" className="label-caps text-rust">← Journal</Link>
      <h1 className="mt-6 text-5xl text-indigo">{post.title}</h1>
      <p className="mt-3 text-sm text-muted">{post.author} · {post.publishedAt ? formatDate(post.publishedAt) : ""}</p>
      {post.coverImage && <img src={post.coverImage} alt="" className="mt-8 aspect-[16/9] w-full object-cover" />}
      <div className="mt-8 whitespace-pre-line text-lg leading-relaxed text-ink/85">{post.body}</div>
      <div className="mt-8 flex gap-2">{post.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
    </article>
  );
}

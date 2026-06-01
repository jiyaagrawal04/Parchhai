import { cx } from "@/lib/format";
import type { ReactNode } from "react";

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cx("h-6 w-6 animate-spin rounded-full border-2 border-line border-t-indigo", className)} />
);

export const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <Spinner />
  </div>
);

export const Empty = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
    <p className="font-serif text-2xl text-indigo">{title}</p>
    {hint && <p className="text-sm text-muted">{hint}</p>}
  </div>
);

export const ErrorNote = ({ message }: { message: string }) => (
  <div className="border border-rust/30 bg-rust/5 px-4 py-3 text-sm text-rust">{message}</div>
);

export const SectionTitle = ({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="label-caps mb-2 text-gold">{eyebrow}</p>}
      <h2 className="text-3xl md:text-4xl text-indigo">{title}</h2>
    </div>
    {children}
  </div>
);

export const Badge = ({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warn" | "danger" | "muted" }) => {
  const tones = {
    default: "bg-indigo/10 text-indigo",
    success: "bg-green-700/10 text-green-800",
    warn: "bg-gold/15 text-gold",
    danger: "bg-rust/10 text-rust",
    muted: "bg-ink/5 text-muted",
  };
  return <span className={cx("inline-flex items-center px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide", tones[tone])}>{children}</span>;
};

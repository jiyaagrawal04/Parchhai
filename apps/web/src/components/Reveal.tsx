import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";

/** Fades + slides children in on first scroll into view (matches the Stitch reveal-on-scroll). */
export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cx("reveal-on-scroll", shown && "visible", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/** Material Symbols Outlined icon. */
export const MIcon = ({ name, className, fill }: { name: string; className?: string; fill?: boolean }) => (
  <span className={cx("material-symbols-outlined", fill && "fill", className)}>{name}</span>
);

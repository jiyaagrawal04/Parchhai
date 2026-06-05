import { cx } from "@/lib/format";

// Text version of the Parchhai logo — orange wordmark with the "hh" in deep brown
// (matching the brand logo). `light` flips the "hh" to cream for dark backgrounds.
const ORANGE = "#B85A1B";
const BROWN = "#3D1A06";

export function Wordmark({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cx("font-serif font-bold lowercase leading-none tracking-tight", className)} style={{ color: ORANGE }}>
      parc<span style={{ color: light ? "#faf5ec" : BROWN }}>hh</span>ai
    </span>
  );
}

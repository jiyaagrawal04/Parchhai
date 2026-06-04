import { Tag } from "lucide-react";

export const OFFERS = [
  { code: "WELCOME10", desc: "10% off your first order · min ₹999" },
  { code: "WELCOME5", desc: "5% off · min ₹599" },
];

/** Prominent "pop" display of the active coupon codes. */
export function CouponList({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="label-caps mb-2 text-[10px] text-on-surface-variant">Available offers</p>
      <div className="space-y-2">
        {OFFERS.map((o) => (
          <div
            key={o.code}
            className="flex items-center gap-3 border border-dashed border-secondary/50 bg-secondary/5 px-3 py-2.5 transition-transform hover:scale-[1.02]"
          >
            <Tag size={16} className="shrink-0 text-secondary" />
            <div className="leading-tight">
              <p className="label-caps text-[11px] text-secondary">{o.code}</p>
              <p className="text-[11px] text-on-surface-variant">{o.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

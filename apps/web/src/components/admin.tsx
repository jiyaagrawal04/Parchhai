import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export const AdminHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-3xl text-indigo">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="card p-5">
    <p className="label-caps text-muted">{label}</p>
    <p className="mt-2 font-serif text-3xl text-indigo">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
  </div>
);

export const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="overflow-x-auto border border-line bg-paper">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-line bg-ivory">
        <tr>{head.map((h) => <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  </div>
);

export const Td = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cx("px-4 py-3 align-middle", className)}>{children}</td>
);

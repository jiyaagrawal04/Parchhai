import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardSummary } from "@parchhai/types";
import { api, unwrap } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { AdminHeader, StatCard } from "@/components/admin";
import { PageLoader } from "@/components/ui";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => unwrap<DashboardSummary>(await api.get("/admin/reports/dashboard")),
  });
  if (isLoading || !data) return <PageLoader />;

  return (
    <div>
      <AdminHeader title="Dashboard" subtitle="Store performance at a glance" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Revenue (today)" value={formatINR(data.revenueToday)} />
        <StatCard label="Revenue (30d)" value={formatINR(data.revenue30d)} hint={`${data.orders30d} orders`} />
        <StatCard label="Orders today" value={String(data.ordersToday)} />
        <StatCard label="Pending fulfilment" value={String(data.pendingOrders)} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard label="Low stock" value={String(data.lowStockCount)} hint="variants at/below threshold" />
        <StatCard label="Pending returns" value={String(data.pendingReturns)} />
        <StatCard label="Reviews to moderate" value={String(data.pendingReviews)} />
      </div>

      <div className="mt-8 card p-6">
        <p className="label-caps mb-4 text-gold">Revenue · last 14 days</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.revenueSeries.map((d) => ({ ...d, revenue: d.revenue / 100 }))}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9E3B2E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#9E3B2E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => String(d).slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
            <Area type="monotone" dataKey="revenue" stroke="#9E3B2E" fill="url(#rev)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 card p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps text-gold">Top products (30d)</p>
          <Link to="/admin/reports" className="text-xs text-rust hover:underline">Full reports →</Link>
        </div>
        <ul className="divide-y divide-line">
          {data.topProducts.map((p) => (
            <li key={p.name} className="flex justify-between py-2 text-sm">
              <span>{p.name}</span>
              <span className="text-muted">{p.units} units · {formatINR(p.revenue)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useSearchParams } from "react-router-dom";
import { useCategories, useCrafts, useProducts } from "@/lib/hooks";
import { ProductCard } from "@/components/ProductCard";
import { Empty, PageLoader, SectionTitle } from "@/components/ui";
import { cx } from "@/lib/format";

const SIZES = ["XS", "S", "M", "L", "XL"];
const SORTS: [string, string][] = [
  ["newest", "Newest"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
  ["rating", "Top rated"],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { data: crafts } = useCrafts();
  const { data: categories } = useCategories();

  const query = {
    craft: params.get("craft") ?? undefined,
    category: params.get("category") ?? undefined,
    size: params.get("size") ?? undefined,
    sort: params.get("sort") ?? "newest",
    inStock: params.get("inStock") ?? undefined,
    page: Number(params.get("page") ?? 1),
    pageSize: 12,
  };
  const { data, isLoading } = useProducts(query);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const hasFilters = Boolean(query.craft || query.category || query.size || query.inStock);

  // Compact dropdown — label sits above, "All …" is the clear option.
  const Dropdown = ({ label, paramKey, options }: { label: string; paramKey: string; options: [string, string][] }) => (
    <label className="flex flex-col gap-1">
      <span className="label-caps text-[10px] text-gold">{label}</span>
      <select
        value={params.get(paramKey) ?? ""}
        onChange={(e) => setParam(paramKey, e.target.value || undefined)}
        className="min-w-[130px] border-b border-line bg-transparent py-1.5 text-sm outline-none focus:border-gold"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );

  return (
    <div className="container-px py-12">
      <SectionTitle eyebrow="The collection" title="Shop all" />

      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-y border-line py-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Dropdown label="Craft" paramKey="craft" options={(crafts ?? []).map((c) => [c.slug, c.name])} />
          <Dropdown label="Category" paramKey="category" options={(categories ?? []).map((c) => [c.slug, c.name])} />
          <Dropdown label="Size" paramKey="size" options={SIZES.map((s) => [s, s])} />
          <label className="flex items-center gap-2 pb-1.5 text-sm">
            <input type="checkbox" checked={params.get("inStock") === "true"} onChange={(e) => setParam("inStock", e.target.checked ? "true" : undefined)} />
            In stock
          </label>
          {hasFilters && (
            <button onClick={() => setParams(new URLSearchParams())} className="pb-1.5 text-sm text-rust hover:underline">
              Clear all
            </button>
          )}
        </div>

        <label className="flex flex-col gap-1">
          <span className="label-caps text-[10px] text-gold">Sort by</span>
          <select
            value={query.sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="min-w-[170px] border-b border-line bg-transparent py-1.5 text-sm outline-none focus:border-gold"
          >
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-muted">{data?.meta?.total ?? 0} pieces</p>

      {/* Products (full width) */}
      <div className="mt-6">
        {isLoading ? (
          <PageLoader />
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
            {data.meta && data.meta.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setParam("page", String(n))} className={cx("h-9 w-9 text-sm", n === query.page ? "bg-indigo text-ivory" : "border border-line hover:border-indigo")}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <Empty title="No pieces found" hint="Try clearing some filters." />
        )}
      </div>
    </div>
  );
}

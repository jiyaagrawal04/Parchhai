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

  const FilterGroup = ({ title, options, paramKey }: { title: string; options: [string, string][]; paramKey: string }) => (
    <div className="border-b border-line py-5">
      <p className="label-caps mb-3 text-gold">{title}</p>
      <div className="space-y-1.5">
        {options.map(([val, label]) => {
          const active = params.get(paramKey) === val;
          return (
            <button
              key={val}
              onClick={() => setParam(paramKey, active ? undefined : val)}
              className={cx("block text-sm", active ? "text-rust" : "text-ink hover:text-rust")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="container-px py-12">
      <SectionTitle eyebrow="The collection" title="Shop all" />
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <aside>
          <FilterGroup title="Craft" paramKey="craft" options={(crafts ?? []).map((c) => [c.slug, c.name])} />
          <FilterGroup title="Category" paramKey="category" options={(categories ?? []).map((c) => [c.slug, c.name])} />
          <FilterGroup title="Size" paramKey="size" options={SIZES.map((s) => [s, s])} />
          <div className="py-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={params.get("inStock") === "true"} onChange={(e) => setParam("inStock", e.target.checked ? "true" : undefined)} />
              In stock only
            </label>
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted">{data?.meta?.total ?? 0} pieces</p>
            <select value={query.sort} onChange={(e) => setParam("sort", e.target.value)} className="border border-line bg-transparent px-3 py-2 text-sm">
              {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
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
    </div>
  );
}

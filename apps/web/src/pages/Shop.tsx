import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES, COLLECTIONS, CRAFTS, getCategory, getCraft, listProducts, type SortKey } from "@/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Empty, SectionTitle } from "@/components/ui";

const SIZES = ["XS", "S", "M", "L"];
const SORTS: [SortKey, string][] = [
  ["newest", "Newest"],
  ["bestsellers", "Best sellers first"],
  ["price_asc", "Price: Low to High"],
  ["price_desc", "Price: High to Low"],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();

  const filter = {
    craft: params.get("craft") ?? undefined,
    category: params.get("category") ?? undefined,
    size: params.get("size") ?? undefined,
    collection: params.get("collection") ?? undefined,
    q: params.get("q") ?? undefined,
    inStock: params.get("inStock") === "true",
    sort: (params.get("sort") as SortKey) || "newest",
  };
  const items = useMemo(() => listProducts(filter), [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const hasFilters = Boolean(filter.craft || filter.category || filter.size || filter.collection || filter.q || filter.inStock);

  const title = filter.q
    ? `Results for "${filter.q}"`
    : COLLECTIONS.find((c) => c.slug === filter.collection)?.name ??
      getCategory(filter.category ?? "")?.name ??
      (getCraft(filter.craft ?? "") ? `${getCraft(filter.craft ?? "")!.name} pieces` : "Shop all");

  // Compact dropdown. Label sits above, "All" is the clear option.
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
      <SectionTitle eyebrow="The collection" title={title} />

      {/* Filter + sort bar */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-y border-line py-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Dropdown label="Collection" paramKey="collection" options={COLLECTIONS.map((c) => [c.slug, c.name])} />
          <Dropdown label="Category" paramKey="category" options={CATEGORIES.map((c) => [c.slug, c.name])} />
          <Dropdown label="Craft" paramKey="craft" options={CRAFTS.map((c) => [c.slug, c.name])} />
          <Dropdown label="Size" paramKey="size" options={SIZES.map((s) => [s, s])} />
          {hasFilters && (
            <button onClick={() => setParams(new URLSearchParams())} className="pb-1.5 text-sm text-rust hover:underline">
              Clear all
            </button>
          )}
        </div>

        <label className="flex flex-col gap-1">
          <span className="label-caps text-[10px] text-gold">Sort by</span>
          <select
            value={filter.sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="min-w-[170px] border-b border-line bg-transparent py-1.5 text-sm outline-none focus:border-gold"
          >
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-muted">{items.length} {items.length === 1 ? "piece" : "pieces"}</p>

      <div className="mt-6">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        ) : (
          <Empty title="No pieces found" hint="Try clearing some filters." />
        )}
      </div>
    </div>
  );
}

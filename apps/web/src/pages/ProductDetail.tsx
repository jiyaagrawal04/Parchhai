import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAddToCart, useProduct, useProductReviews, useToggleWishlist } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { api, apiError } from "@/lib/api";
import { formatINR, cx } from "@/lib/format";
import { PageLoader } from "@/components/ui";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const { data: p, isLoading } = useProduct(slug);
  const { data: reviews } = useProductReviews(slug);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { user } = useAuth();

  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [activeImg, setActiveImg] = useState(0);
  const [msg, setMsg] = useState("");
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<string>("");

  const selectedColor = color || p?.colors[0] || "";
  const variant = useMemo(
    () => p?.variants.find((v) => v.color === selectedColor && v.size === size),
    [p, selectedColor, size],
  );

  if (isLoading) return <PageLoader />;
  if (!p) return <div className="container-px py-20">Product not found.</div>;

  const add = async () => {
    if (!variant) return setMsg("Please select a size.");
    setMsg("");
    try {
      await addToCart.mutateAsync({ variantId: variant.id, qty: 1 });
      setMsg("Added to bag ✓");
    } catch (e) {
      setMsg(apiError(e));
    }
  };

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) return setPincodeResult("Enter a 6-digit pincode");
    try {
      const { data } = await api.get("/catalog/pincode", { params: { pincode } });
      const r = data.data;
      setPincodeResult(r.serviceable ? `Delivers in ~${r.etaDays} days${r.codAvailable ? " · COD available" : ""}` : "Not serviceable");
    } catch (e) {
      setPincodeResult(apiError(e));
    }
  };

  return (
    <div className="container-px py-12">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[3/4] bg-line/40">
            {p.images[activeImg] && <img src={p.images[activeImg].url} alt={p.name} className="h-full w-full object-cover" />}
          </div>
          <div className="mt-3 flex gap-3">
            {p.images.map((im, i) => (
              <button key={im.id} onClick={() => setActiveImg(i)} className={cx("h-20 w-16 overflow-hidden border", i === activeImg ? "border-indigo" : "border-line")}>
                <img src={im.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          {p.craft && <p className="label-caps text-gold">{p.craft.name} · Hand-blocked</p>}
          <h1 className="mt-2 text-4xl text-indigo">{p.name}</h1>
          <p className="mt-3 text-2xl font-semibold">{formatINR(variant?.price ?? p.basePrice)}</p>
          {p.ratingCount > 0 && <p className="mt-1 text-sm text-muted">★ {p.ratingAvg.toFixed(1)} ({p.ratingCount})</p>}

          <p className="mt-6 leading-relaxed text-ink/80">{p.description}</p>

          {/* Colors */}
          {p.colors.length > 1 && (
            <div className="mt-8">
              <p className="label-caps mb-2 text-muted">Colour: {selectedColor}</p>
              <div className="flex gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => { setColor(c); setSize(""); }} className={cx("border px-4 py-2 text-sm", c === selectedColor ? "border-indigo bg-indigo text-ivory" : "border-line")}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="mt-6">
            <p className="label-caps mb-2 text-muted">Size</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s) => {
                const v = p.variants.find((x) => x.color === selectedColor && x.size === s);
                const disabled = !v || v.stock === 0;
                return (
                  <button key={s} disabled={disabled} onClick={() => setSize(s)} className={cx("h-11 w-12 border text-sm", size === s ? "border-indigo bg-indigo text-ivory" : "border-line", disabled && "cursor-not-allowed text-muted line-through")}>
                    {s}
                  </button>
                );
              })}
            </div>
            {variant && variant.stock <= 5 && variant.stock > 0 && <p className="mt-2 text-xs text-rust">Only {variant.stock} left</p>}
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={add} disabled={addToCart.isPending} className="btn-primary flex-1">Add to bag</button>
            <button
              onClick={() => (user ? variant && toggleWishlist.mutate(variant.id) : (window.location.href = "/login"))}
              className="btn-secondary"
              aria-label="Wishlist"
            >
              <Heart size={18} />
            </button>
          </div>
          {msg && <p className="mt-3 text-sm text-rust">{msg}</p>}

          {/* Pincode */}
          <div className="mt-8 border-t border-line pt-6">
            <p className="label-caps mb-2 text-muted">Check delivery</p>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="input max-w-[160px]" />
              <button onClick={checkPincode} className="btn-ghost border border-line">Check</button>
            </div>
            {pincodeResult && <p className="mt-2 text-sm text-ink/70">{pincodeResult}</p>}
          </div>

          {/* Details */}
          <dl className="mt-8 space-y-2 border-t border-line pt-6 text-sm">
            {p.fabric && <div className="flex gap-2"><dt className="w-32 text-muted">Fabric</dt><dd>{p.fabric}</dd></div>}
            {p.artisanCluster && <div className="flex gap-2"><dt className="w-32 text-muted">Cluster</dt><dd>{p.artisanCluster}</dd></div>}
            {p.careInstructions && <div className="flex gap-2"><dt className="w-32 text-muted">Care</dt><dd>{p.careInstructions}</dd></div>}
          </dl>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 border-t border-line pt-12">
        <h2 className="text-3xl text-indigo">Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <p className="text-gold">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
                {r.title && <p className="mt-2 font-serif text-lg text-indigo">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm text-ink/80">{r.body}</p>}
                <p className="mt-3 text-xs text-muted">— {r.author}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No reviews yet. Purchased this? Share your thoughts from your orders.</p>
        )}
      </section>
    </div>
  );
}

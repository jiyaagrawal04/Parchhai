import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist, useToggleWishlist, useAddToCart } from "@/lib/hooks";
import { formatINR } from "@/lib/format";
import { Empty, PageLoader } from "@/components/ui";

export default function Wishlist() {
  const { data: items, isLoading } = useWishlist();
  const toggle = useToggleWishlist();
  const addToCart = useAddToCart();

  if (isLoading) return <PageLoader />;
  if (!items || items.length === 0) return <Empty title="Your wishlist is empty" hint="Tap the heart on any product to save it." />;

  return (
    <div>
      <h2 className="text-2xl text-indigo">Wishlist</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.id} className="group">
            <Link to={`/product/${it.slug}`} className="slow-zoom block aspect-[3/4] bg-line/40">
              {it.image && <img src={it.image} alt={it.productName} className="h-full w-full object-cover" />}
            </Link>
            <div className="mt-2 flex items-start justify-between">
              <div>
                <p className="font-serif text-indigo">{it.productName}</p>
                <p className="text-xs text-muted">{it.color} · {it.size}</p>
                <p className="mt-1 text-sm font-semibold">{formatINR(it.price)}</p>
              </div>
              <button onClick={() => toggle.mutate(it.variantId)} className="text-rust"><Heart size={18} fill="currentColor" /></button>
            </div>
            <button onClick={() => addToCart.mutate({ variantId: it.variantId, qty: 1 })} className="btn-secondary mt-2 w-full py-2 text-xs">Add to bag</button>
          </div>
        ))}
      </div>
    </div>
  );
}

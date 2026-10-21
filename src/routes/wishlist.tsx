import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { products } from "@/data/catalog";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — AIDAH The Label" },
      { name: "description", content: "Your curated wishlist of handcrafted lehengas, silk sets, and occasion dresses." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { slugs, toggle } = useWishlist();
  const { add } = useCart();

  const wishedProducts = products.filter((p) => slugs.includes(p.slug));

  const handleMoveToBag = (product: typeof products[0]) => {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      size: product.sizes[0] || "M",
      color: product.colors[0]?.name || "Original",
      qty: 1,
      maxQty: product.stock[product.sizes[0] || "M"] ?? 10,
    });
    toggle(product.slug);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="eyebrow text-gold">Curated Wishlist</p>
        <h1 className="display-2 mt-2 text-3xl sm:text-4xl text-foreground">Saved Creations</h1>
      </div>

      {wishedProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-card">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" strokeWidth={1} />
          <h2 className="font-display text-2xl">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Click the heart icon on any silhouette to curate your personal dream wardrobe.
          </p>
          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
            >
              Explore Boutique <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {wishedProducts.map((p) => (
            <div key={p.id} className="group relative rounded-2xl border border-border bg-card p-3 shadow-xs flex flex-col justify-between">
              <div>
                <Link to={"/product/$slug" as any} params={{ slug: p.slug } as any} className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-cream">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(p.slug);
                    }}
                    aria-label="Remove from wishlist"
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-rose hover:bg-background transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                <div className="mt-3">
                  <Link to={"/product/$slug" as any} params={{ slug: p.slug } as any}>
                    <h3 className="font-display text-base text-foreground hover:text-rose-deep transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs font-semibold text-foreground">
                    {formatINR(p.price)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleMoveToBag(p)}
                className="mt-4 w-full rounded-full border border-charcoal bg-transparent py-2 text-xs uppercase tracking-wider text-charcoal hover:bg-charcoal hover:text-ivory transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Move to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

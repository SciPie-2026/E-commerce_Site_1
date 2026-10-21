import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/catalog";
import { formatINR } from "@/lib/format";
import { useWishlist } from "@/lib/wishlist-context";

const badgeStyles: Record<string, string> = {
  New: "bg-charcoal text-ivory",
  Sale: "bg-rose text-white",
  Bestseller: "bg-gold-soft text-charcoal",
  "Limited Edition": "bg-cream text-cocoa border border-gold/40",
};

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { has, toggle } = useWishlist();
  const wished = has(product.slug);

  return (
    <article className="group relative">
      <Link to={"/product/$slug" as any} params={{ slug: product.slug } as any} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-cream">
          <img
            src={product.images[0]}
            alt={product.name}
            width={1024}
            height={1280}
            loading={priority ? "eager" : "lazy"}
            className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          {product.badge && (
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.15em] ${badgeStyles[product.badge]}`}>
              {product.badge}
            </span>
          )}
          {product.compareAtPrice && (
            <span className="absolute left-3 bottom-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-rose-deep">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% off
            </span>
          )}
        </div>
      </Link>

      <button
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggle(product.slug)}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-background"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-rose text-rose" : "text-cocoa"}`} strokeWidth={1.5} />
      </button>

      <div className="mt-4 px-1">
        <Link to={"/product/$slug" as any} params={{ slug: product.slug } as any}>
          <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-rose-deep">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 flex items-baseline gap-2 text-sm">
          <span className="font-medium">{formatINR(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-muted-foreground line-through">{formatINR(product.compareAtPrice)}</span>
          )}
        </p>
      </div>
    </article>
  );
}

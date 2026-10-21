import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Check,
  Share2,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scissors,
  Star,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { products, type Product } from "@/data/catalog";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { ProductCard } from "@/components/site/product-card";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) {
      throw notFound();
    }
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — AIDAH The Label` : "Product — AIDAH" },
        {
          name: "description",
          content: p?.description || "Handcrafted designer wear from Aidah The Label boutique, Gurugram.",
        },
        { property: "og:title", content: p?.name },
        { property: "og:description", content: p?.description },
        { property: "og:image", content: p?.images[0] },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "M");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || "Rose");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "care" | "fit" | "shipping">("details");

  const isWished = has(product.slug);
  const stockAvailable = product.stock[selectedSize] ?? 10;
  const isOutOfStock = stockAvailable <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[selectedImage] ?? product.images[0] ?? "",
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
      maxQty: stockAvailable,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categorySlugs.some((c) => product.categorySlugs.includes(c)))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-cocoa">
        <Link to="/" className="hover:text-rose-deep">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <Link to="/shop" className="hover:text-rose-deep">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate text-foreground font-medium">{product.name}</span>
      </nav>

      {/* Main product showcase */}
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left: Gallery (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[640px] shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-16 sm:h-24 sm:w-20 overflow-hidden rounded-xl border-2 transition-all shrink-0 ${
                      selectedImage === idx ? "border-gold ring-2 ring-gold/30 shadow-md" : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-gold/20 bg-cream/50 shadow-xl">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover object-top transition-all duration-500"
              />

              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-charcoal/90 px-3.5 py-1 text-xs uppercase tracking-[0.2em] font-medium text-ivory backdrop-blur-sm">
                  {product.badge}
                </span>
              )}

              <button
                onClick={() => toggle(product.slug)}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/85 shadow-md backdrop-blur-md transition-transform hover:scale-110"
              >
                <Heart className={`h-5 w-5 ${isWished ? "fill-rose text-rose" : "text-cocoa"}`} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Atelier assurance badges */}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Handcrafted</p>
                <p className="text-muted-foreground">In Small Batches</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Scissors className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Custom Fit</p>
                <p className="text-muted-foreground">Made-to-Measure</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Gurugram Atelier</p>
                <p className="text-muted-foreground">Baani City Centre</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Express Shipping</p>
                <p className="text-muted-foreground">Domestic &amp; Global</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions (5 Cols) */}
        <div className="flex flex-col lg:col-span-5">
          <p className="eyebrow text-gold">Aidah The Label · Couture Collection</p>
          <h1 className="display-2 mt-2 font-display text-3xl sm:text-4xl text-foreground">
            {product.name}
          </h1>

          {/* Reviews & SKU */}
          <div className="mt-3 flex items-center justify-between border-b border-border pb-4 text-xs text-cocoa">
            <div className="flex items-center gap-1.5">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <span className="font-medium text-foreground">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} boutique reviews)</span>
            </div>
            <span className="text-muted-foreground tracking-wider uppercase">SKU: {product.sku}</span>
          </div>

          {/* Pricing */}
          <div className="mt-5 flex items-baseline gap-4">
            <span className="font-display text-3xl font-medium text-foreground">
              {formatINR(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-rose/15 px-3 py-1 text-xs font-semibold text-rose-deep">
                  {Math.round((1 - product.price / product.compareAtPrice) * 100)}% Privilege Savings
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-cocoa">Taxes included. Hand-delivered in archival Aidah packaging.</p>

          {/* Description */}
          <p className="mt-6 text-sm leading-relaxed text-cocoa">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">Colour: <span className="text-cocoa font-normal">{selectedColor}</span></span>
              </div>
              <div className="mt-2.5 flex items-center gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    aria-label={`Select color ${c.name}`}
                    className={`relative h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      selectedColor === c.name ? "border-charcoal ring-2 ring-gold ring-offset-2 scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Select Size</span>
              <Link to={"/size-guide" as any} className="text-rose-deep underline-offset-2 hover:underline">
                Size &amp; Fit Guide
              </Link>
            </div>
            <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {product.sizes.map((size) => {
                const stock = product.stock[size] ?? 5;
                const isAvailable = stock > 0;
                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 rounded-xl border text-xs font-medium tracking-wide transition-all ${
                      selectedSize === size
                        ? "border-charcoal bg-charcoal text-ivory shadow-md"
                        : isAvailable
                        ? "border-border bg-background hover:border-gold hover:bg-secondary"
                        : "border-border/40 bg-muted/30 text-muted-foreground line-through cursor-not-allowed"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {isOutOfStock ? (
              <p className="mt-2 text-xs text-rose-deep">Currently crafted to order — standard delivery 7–10 days.</p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Only {stockAvailable} atelier pieces ready in size {selectedSize}.</p>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* Quantity */}
            <div className="flex h-13 w-32 items-center justify-between rounded-full border border-border bg-background px-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="text-lg text-cocoa transition-colors hover:text-foreground"
              >
                −
              </button>
              <span className="text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                aria-label="Increase quantity"
                className="text-lg text-cocoa transition-colors hover:text-foreground"
              >
                +
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 rounded-full px-8 py-3.5 text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 shadow-md ${
                added
                  ? "bg-emerald-700 text-white"
                  : "bg-charcoal text-ivory hover:bg-rose-deep hover:shadow-lg"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to Your Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to Shopping Bag • {formatINR(product.price * quantity)}
                </>
              )}
            </button>
          </div>

          {/* Bespoke notice */}
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold-soft/10 p-4 text-xs text-cocoa">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Bespoke Made-to-Measure Available
            </p>
            <p className="mt-1">
              Need custom sleeve length, neckline alterations, or matching blouse tailoring? Contact our Gurugram concierge after ordering or visit Baani City Centre.
            </p>
          </div>

          {/* Accordion Tabs */}
          <div className="mt-8 border-t border-border pt-4">
            <div className="flex border-b border-border text-xs">
              {(["details", "care", "fit", "shipping"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 px-3 font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-gold text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "details" ? "Fabric & Craft" : tab === "care" ? "Care Guide" : tab === "fit" ? "Fit Notes" : "Delivery"}
                </button>
              ))}
            </div>

            <div className="py-4 text-xs leading-relaxed text-cocoa">
              {activeTab === "details" && (
                <div className="space-y-2">
                  <p><strong>Fabric:</strong> {product.fabric}</p>
                  <p><strong>Occasion:</strong> {product.occasion}</p>
                  <p><strong>Atelier Craft:</strong> Hand-finished by master karigars with French seams, concealed zippers, and pure silk lining.</p>
                </div>
              )}
              {activeTab === "care" && (
                <div className="space-y-2">
                  <p><strong>Care:</strong> {product.care}</p>
                  <p>Store in breathable cotton muslin garment bag provided with your order away from direct sunlight.</p>
                </div>
              )}
              {activeTab === "fit" && (
                <div className="space-y-2">
                  <p><strong>Silhouette Fit:</strong> {product.fit}</p>
                  <p>Model is 5'8" wearing size S. We offer complimentary fitting adjustments at our Baani City Centre boutique.</p>
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2">
                  <p><strong>Domestic Delivery:</strong> Dispatched in 2–4 business days via express courier across India.</p>
                  <p><strong>Studio Pickup:</strong> Ready within 24 hours at Baani City Centre, Sector 63, Gurugram.</p>
                  <p><strong>Returns:</strong> 14-day hassle-free boutique alterations and size exchange policy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-border pt-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow text-gold">Curated Complements</p>
              <h2 className="display-2 mt-2 text-2xl sm:text-3xl">You May Also Cherish</h2>
            </div>
            <Link to="/shop" className="group hidden items-center gap-2 text-xs tracking-wide text-cocoa hover:text-rose-deep sm:flex">
              Explore All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

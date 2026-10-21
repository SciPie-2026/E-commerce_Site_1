import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { ProductCard } from "@/components/site/product-card";
import {
  products, collections, allSizes, allColors, allFabrics, allOccasions,
  type Product,
} from "@/data/catalog";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — AIDAH" },
      { name: "description", content: "Browse the full AIDAH boutique — dresses, ethnic wear, co-ord sets and more. Filter by category, size, colour, occasion, fabric and price." },
      { property: "og:title", content: "Shop All — AIDAH" },
      { property: "og:description", content: "Browse the full AIDAH boutique — dresses, ethnic wear, co-ord sets and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const merchandiseCollections = collections.filter((c) =>
  !["new-arrivals", "best-sellers", "sale", "seasonal-collections"].includes(c.slug)
);

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "popular";

function ShopPage() {
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(25000);
  const [sort, setSort] = useState<SortKey>("featured");
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { add } = useCart();

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (query && !`${p.name} ${p.description} ${p.fabric}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (cats.length && !p.categorySlugs.some((s) => cats.includes(s))) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s) && (p.stock[s] ?? 0) > 0)) return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c.name))) return false;
      if (occasions.length && !occasions.includes(p.occasion)) return false;
      if (fabrics.length && !fabrics.includes(p.fabric)) return false;
      if (inStockOnly && !p.sizes.some((s) => (p.stock[s] ?? 0) > 0)) return false;
      if (p.price > priceMax) return false;
      return true;
    });
    switch (sort) {
      case "newest": list = [...list].sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0)); break;
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "popular": list = [...list].sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: break;
    }
    return list;
  }, [query, cats, sizes, colors, occasions, fabrics, inStockOnly, priceMax, sort]);

  const activeFilters = [
    ...cats.map((c) => merchandiseCollections.find((m) => m.slug === c)?.name ?? c),
    ...sizes, ...colors, ...occasions,
    ...fabrics.map((f) => f.split(" ")[0]),
    ...(inStockOnly ? ["In stock"] : []),
    ...(priceMax < 25000 ? [`Under ${formatINR(priceMax)}`] : []),
  ];

  const clearAll = () => {
    setCats([]); setSizes([]); setColors([]); setOccasions([]); setFabrics([]);
    setInStockOnly(false); setPriceMax(25000); setQuery("");
  };

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3 text-cocoa">Category</p>
        <div className="space-y-2">
          {merchandiseCollections.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-sm text-cocoa hover:text-foreground">
              <input type="checkbox" checked={cats.includes(c.slug)} onChange={() => toggle(cats, setCats, c.slug)} className="h-4 w-4 rounded accent-[var(--rose)]" />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3 text-cocoa">Price</p>
        <input type="range" min={2000} max={25000} step={500} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-full accent-[var(--rose)]" aria-label="Maximum price" />
        <p className="mt-1 text-xs text-muted-foreground">Up to {formatINR(priceMax)}</p>
      </div>

      <div>
        <p className="eyebrow mb-3 text-cocoa">Size</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button key={s} onClick={() => toggle(sizes, setSizes, s)}
              className={`h-9 w-11 rounded-lg border text-xs tracking-wide transition-colors ${sizes.includes(s) ? "border-charcoal bg-charcoal text-ivory" : "border-border bg-background hover:border-rose"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3 text-cocoa">Colour</p>
        <div className="flex flex-wrap gap-3">
          {allColors.map((c) => (
            <button key={c.name} aria-label={c.name} title={c.name} onClick={() => toggle(colors, setColors, c.name)}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${colors.includes(c.name) ? "border-charcoal ring-2 ring-ring ring-offset-2" : "border-border"}`}
              style={{ backgroundColor: c.hex }} />
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3 text-cocoa">Occasion</p>
        <div className="space-y-2">
          {allOccasions.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2.5 text-sm text-cocoa hover:text-foreground">
              <input type="checkbox" checked={occasions.includes(o)} onChange={() => toggle(occasions, setOccasions, o)} className="h-4 w-4 rounded accent-[var(--rose)]" />
              {o}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3 text-cocoa">Fabric</p>
        <div className="space-y-2">
          {allFabrics.map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2.5 text-sm text-cocoa hover:text-foreground">
              <input type="checkbox" checked={fabrics.includes(f)} onChange={() => toggle(fabrics, setFabrics, f)} className="h-4 w-4 rounded accent-[var(--rose)]" />
              {f}
            </label>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-cocoa">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 rounded accent-[var(--rose)]" />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6">
      <Reveal>
        <p className="eyebrow text-gold">The Boutique</p>
        <h1 className="display-2 mt-2">Shop All</h1>
        <p className="mt-3 max-w-lg text-sm text-cocoa">
          Every piece in the atelier, in one place. Handcrafted lehengas, pure linen sets,
          and luxury occasion wear from our Baani City Centre boutique in Gurugram.
        </p>
      </Reveal>

      <div className="mt-10 flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="Product filters">
          {FilterPanel}
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dresses, fabrics…"
                aria-label="Search products"
                className="w-full rounded-full border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
              />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort products"
              className="rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 rounded-full border border-input px-4 py-2.5 text-sm lg:hidden">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> Filters
            </button>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <span key={f} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{f}</span>
              ))}
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-rose-deep underline-offset-2 hover:underline">
                <X className="h-3 w-3" /> Clear all
              </button>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="mt-16 rounded-3xl border border-dashed border-border p-16 text-center">
              <p className="font-display text-2xl">Nothing matches — yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Try softening a filter, or browse the full collection.</p>
              <button onClick={clearAll} className="mt-6 rounded-full bg-primary px-7 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-rose-deep">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
              {filtered.map((p) => (
                <div key={p.id} className="group/card">
                  <ProductCard product={p} />
                  <button
                    onClick={() => setQuickView(p)}
                    className="mt-2 w-full rounded-full border border-border py-2 text-xs tracking-[0.15em] uppercase opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 hover:bg-secondary"
                  >
                    Quick view
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="animate-fade-up absolute inset-y-0 right-0 w-80 max-w-[88vw] overflow-y-auto bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-xl">Filters</p>
              <button aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X className="h-5 w-5" strokeWidth={1.5} /></button>
            </div>
            {FilterPanel}
            <button onClick={() => setFiltersOpen(false)} className="mt-8 w-full rounded-full bg-primary py-3 text-sm text-primary-foreground">
              Show {filtered.length} pieces
            </button>
          </div>
        </div>
      )}

      {/* Quick view */}
      {quickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setQuickView(null)} />
          <div className="animate-fade-up relative grid max-h-[90vh] w-full max-w-3xl gap-6 overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl sm:grid-cols-2 sm:p-8">
            <button aria-label="Close quick view" onClick={() => setQuickView(null)} className="absolute right-4 top-4 text-cocoa hover:text-foreground"><X className="h-5 w-5" strokeWidth={1.5} /></button>
            <img src={quickView.images[0]} alt={quickView.name} width={1024} height={1280} loading="lazy" className="h-72 w-full rounded-2xl object-cover sm:h-full" />
            <div>
              <p className="eyebrow text-gold">{quickView.occasion}</p>
              <h3 className="display-2 mt-2 text-2xl">{quickView.name}</h3>
              <p className="mt-2 flex gap-2 text-sm"><span className="font-medium">{formatINR(quickView.price)}</span>
                {quickView.compareAtPrice && <span className="text-muted-foreground line-through">{formatINR(quickView.compareAtPrice)}</span>}</p>
              <p className="mt-4 text-sm leading-relaxed text-cocoa">{quickView.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {quickView.sizes.map((s) => (
                  <span key={s} className={`rounded-lg border px-3 py-1.5 text-xs ${(quickView.stock[s] ?? 0) > 0 ? "border-border" : "border-border text-muted-foreground line-through"}`}>{s}</span>
                ))}
              </div>
              <button
                onClick={() => {
                  const size = quickView.sizes.find((s) => (quickView.stock[s] ?? 0) > 0);
                  if (size) add({
                    productId: quickView.id, slug: quickView.slug, name: quickView.name,
                    image: quickView.images[0] ?? "", price: quickView.price, size,
                    color: quickView.colors[0]?.name ?? "Default", qty: 1, maxQty: quickView.stock[size] ?? 1,
                  });
                  setQuickView(null);
                }}
                className="mt-6 w-full rounded-full bg-primary py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-rose-deep"
              >
                Add to bag
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">Pick size &amp; colour on the product page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

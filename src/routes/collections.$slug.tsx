import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { collections, products } from "@/data/catalog";
import { ProductCard } from "@/components/site/product-card";
import { ArrowLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const col = collections.find((c) => c.slug === params.slug);
    if (!col) {
      throw notFound();
    }
    let colProducts = products.filter((p) => {
      if (params.slug === "new-arrivals") return p.badge === "New";
      if (params.slug === "best-sellers") return p.badge === "Bestseller" || p.rating >= 4.8;
      if (params.slug === "sale") return !!p.compareAtPrice;
      if (params.slug === "seasonal-collections") return true;
      return p.categorySlugs.includes(params.slug);
    });

    if (colProducts.length === 0) {
      colProducts = products.slice(0, 6);
    }
    return { collection: col, products: colProducts };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.collection;
    return {
      meta: [
        { title: c ? `${c.name} — AIDAH The Label` : "Collection — AIDAH" },
        { name: "description", content: c?.description || "Curated boutique collections from Aidah The Label, Gurugram." },
        { property: "og:title", content: c?.name },
        { property: "og:description", content: c?.description },
      ],
    };
  },
  component: CollectionDetailPage,
});

function CollectionDetailPage() {
  const { collection, products: colProducts } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-cocoa">
        <Link to="/" className="hover:text-rose-deep">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <Link to="/shop" className="hover:text-rose-deep">Collections</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate text-foreground font-medium">{collection.name}</span>
      </nav>

      {/* Collection Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/20 bg-gradient-to-r from-cream via-blush/30 to-cream p-8 sm:p-14 shadow-lg">
        <div className="max-w-2xl">
          <p className="eyebrow text-gold">Aidah Atelier Curation</p>
          <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">
            {collection.name}
          </h1>
          <p className="mt-3 text-base text-rose-deep font-medium">
            {collection.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cocoa">
            {collection.description}
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{colProducts.length} handcrafted pieces</span>
            <span>•</span>
            <span>Baani City Centre, Gurugram</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-12">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {colProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Back to shop */}
      <div className="mt-16 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-8 py-3 text-xs tracking-wide uppercase text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Browse All Boutique Pieces
        </Link>
      </div>
    </div>
  );
}

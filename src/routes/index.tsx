import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, MapPin, Play } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { ProductCard } from "@/components/site/product-card";
import { products, collections, logoImg } from "@/data/catalog";
import heroImg from "@/assets/hero-campaign.jpg";
import floralImg from "@/assets/category-floral.jpg";
import ethnicImg from "@/assets/category-ethnic.jpg";
import editorialImg from "@/assets/lookbook-editorial.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIDAH The Label — Handcrafted Designer Wear | Gurugram Atelier" },
      {
        name: "description",
        content:
          "Discover dreamy handcrafted lehengas, pre-draped saree gowns, pure linen co-ords and occasion wear by Aidah The Label. Visit our boutique at Baani City Centre, Sector 63, Gurugram.",
      },
      { property: "og:title", content: "AIDAH The Label — Handcrafted Designer Wear | Gurugram" },
      {
        property: "og:description",
        content: "Dreamy lehengas, liquid silk drapes, and organic linen co-ords hand-finished at our Gurugram boutique atelier.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/logo.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const newArrivals = products.filter((p) => p.badge === "New").slice(0, 4);
const bestSellers = products.filter((p) => p.badge === "Bestseller" || p.rating >= 4.8).slice(0, 4);
const featuredCollections = ["ethnic-wear", "co-ord-sets", "evening-wear", "party-wear", "floral-dresses"]
  .map((s) => collections.find((c) => c.slug === s)!)
  .filter(Boolean);

const runwayReels = [
  {
    src: "/media/reels/reel-1.mp4",
    title: "The Twirl of Gulabi Bagh",
    tagline: "Multicolor Silk Organza Lehenga",
  },
  {
    src: "/media/reels/reel-2.mp4",
    title: "Liquid Silk in Motion",
    tagline: "Seraphina Saree Gown",
  },
  {
    src: "/media/reels/reel-3.mp4",
    title: "Resort Breeze Silhouette",
    tagline: "Camille Tiered Maxi",
  },
  {
    src: "/media/reels/reel-4.mp4",
    title: "The Ice-Blue Cape & Dhoti",
    tagline: "Valeria Couture Set",
  },
];

function Index() {
  return (
    <div className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-16">
          <div className="relative z-10 animate-fade-up">
            <h1 className="display-1 text-foreground">
              Made for Your Most <em className="font-normal italic text-rose-deep">Beautiful</em> Moments.
            </h1>
            <p className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-cocoa">
              Heirloom-worthy lehengas, pure linen co-ords, and dreamy occasion wear —
              designed in our atelier at Baani City Centre, Gurugram, hand-finished in small batches,
              and made to be twirled in.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-rose-deep"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
              <Link
                to={"/collections/new-arrivals" as any}
                className="inline-flex items-center rounded-full border border-gold/50 px-8 py-3.5 text-sm tracking-wide text-foreground transition-colors hover:bg-secondary"
              >
                New Arrivals
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-xs text-cocoa">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-gold" strokeWidth={1.5} />
                <span>Boutique: Baani City Centre, Sec 63, Gurugram</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "150ms" }}>
            {/* soft decorative blobs */}
            <div className="petal absolute -left-8 -top-8 h-40 w-40 bg-blush/70 animate-drift" aria-hidden="true" />
            <div className="petal absolute -bottom-10 right-10 h-28 w-28 bg-rose/25 animate-drift" aria-hidden="true" style={{ animationDelay: "-6s" }} />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/20 shadow-2xl shadow-blush">
              <img
                src={heroImg}
                alt="Aidah Designer House & Boutique peach organza kurta flatlay with handcrafted threadwork"
                width={1080}
                height={1920}
                className="h-[460px] w-full object-cover object-center sm:h-[540px] lg:h-[620px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-ivory">
                <div>
                  <p className="eyebrow text-gold-soft">Atelier Showcase</p>
                  <p className="font-display text-2xl">The Noor Organza Set</p>
                  <p className="text-xs text-ivory/80">Hand-finished chikankari &amp; lace craft</p>
                </div>
                <Link
                  to="/shop"
                  className="rounded-full bg-ivory/90 px-4 py-2 text-xs font-medium tracking-wide text-charcoal backdrop-blur-sm transition-colors hover:bg-ivory"
                >
                  View Look
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* gentle marquee strip */}
        <div className="border-y border-border bg-secondary/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 py-4 text-[0.7rem] tracking-[0.22em] uppercase text-cocoa sm:px-6">
            <span>Baani City Centre, Gurugram</span><span className="text-gold">✦</span>
            <span>Pure Silk &amp; Handloom Weaves</span><span className="text-gold">✦</span>
            <span>Hand-finished in Small Batches</span><span className="text-gold">✦</span>
            <span>Designed In-House</span><span className="text-gold">✦</span>
            <span>Worldwide Delivery</span>
          </div>
        </div>
      </section>

      {/* ── Featured categories ──────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold">The Wardrobe</p>
            <h2 className="display-2 mt-2">Shop by Mood</h2>
          </div>
          <Link to="/shop" className="group hidden items-center gap-2 text-sm tracking-wide text-cocoa transition-colors hover:text-rose-deep sm:flex">
            View all collections <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {/* Big tile 1: Ethnic Wear */}
          <Reveal className="group relative overflow-hidden rounded-3xl sm:col-span-2 lg:row-span-2" delay={0}>
            <Link to={"/collections/ethnic-wear" as any} className="block h-full">
              <img
                src={ethnicImg}
                alt="Gulabi Bagh twirling lehenga set with multicolor floral embroidery"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full min-h-[380px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-ivory">
                <p className="eyebrow text-gold-soft">Handcrafted Lehengas &amp; Sets</p>
                <p className="font-display text-3xl">Ethnic Wear</p>
                <p className="mt-1 text-xs text-ivory/80">Heritage resham, zari booti &amp; gota borders</p>
              </div>
            </Link>
          </Reveal>

          {/* Tile 2: Floral Resort */}
          <Reveal className="group relative overflow-hidden rounded-3xl" delay={100}>
            <Link to={"/collections/floral-dresses" as any} className="block">
              <img
                src={floralImg}
                alt="Camille tiered blush floral resort maxi dress"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full min-h-[250px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 text-ivory">
                <p className="font-display text-2xl">Floral &amp; Resort</p>
                <p className="text-[0.7rem] text-ivory/80">Airy mulmul &amp; shadow stripes</p>
              </div>
            </Link>
          </Reveal>

          {/* Tile 3: Evening Gowns */}
          <Reveal className="group relative overflow-hidden rounded-3xl" delay={200}>
            <Link to={"/collections/evening-wear" as any} className="block">
              <img
                src={editorialImg}
                alt="Valeria ice-blue draped dhoti and sheer lace cape set"
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full min-h-[250px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 text-ivory">
                <p className="font-display text-2xl">Party Wear &amp; Capes</p>
                <p className="text-[0.7rem] text-ivory/80">Draped dhoti &amp; lace jackets</p>
              </div>
            </Link>
          </Reveal>

          {/* Remaining collection quick-links */}
          {featuredCollections.slice(1, 3).map((c, i) => (
            <Reveal key={c.slug} className="group relative overflow-hidden rounded-3xl" delay={300 + i * 100}>
              <Link
                to={"/collections/$slug" as any}
                params={{ slug: c.slug } as any}
                className="flex h-full min-h-[120px] flex-col justify-between bg-blush/50 p-6 transition-colors hover:bg-blush"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl">{c.name}</span>
                  <ArrowRight className="h-4 w-4 text-cocoa transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </div>
                <p className="text-xs text-cocoa/80">{c.tagline}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── New arrivals ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold">Just In from the Atelier</p>
            <h2 className="display-2 mt-2">New Arrivals</h2>
          </div>
          <Link
            to={"/collections/new-arrivals" as any}
            className="group hidden items-center gap-2 text-sm tracking-wide text-cocoa transition-colors hover:text-rose-deep sm:flex"
          >
            See everything new <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {newArrivals.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Runway & Atelier Video Reels ─────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-gold">
              <Play className="h-4 w-4 fill-gold text-gold" />
              <p className="eyebrow text-gold">Runway in Motion</p>
            </div>
            <h2 className="display-2 mt-2">Dresses Made to be Twirled In</h2>
          </div>
          <p className="hidden text-sm text-cocoa sm:block">Watch our designs come alive in movement.</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {runwayReels.map((reel, i) => (
            <Reveal key={reel.src} delay={i * 100} className="group relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-lg">
              <div className="aspect-[9/16] w-full overflow-hidden bg-charcoal/10">
                <video
                  src={reel.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-ivory pointer-events-none">
                <p className="font-display text-lg leading-tight">{reel.title}</p>
                <p className="mt-1 text-[0.7rem] text-ivory/80">{reel.tagline}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Seasonal banner ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] border border-gold/20 shadow-xl">
          <img
            src={editorialImg}
            alt="Valeria ice-blue draped couture look from the Aidah festive edit"
            width={1600}
            height={1008}
            loading="lazy"
            className="h-[380px] w-full object-cover sm:h-[460px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14">
            <p className="eyebrow text-gold-soft">Festive Capsule</p>
            <h2 className="display-2 mt-3 max-w-md text-ivory">The Ivory Hour</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/85">
              Champagne golds, liquid satin drapes, and resham threadwork made for candlelit
              sangeets and cocktail celebrations.
            </p>
            <Link
              to={"/collections/seasonal-collections" as any}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-ivory px-7 py-3 text-sm tracking-wide text-charcoal transition-colors hover:bg-blush"
            >
              Shop the Edit <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Best sellers ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold">Community Favourites</p>
            <h2 className="display-2 mt-2">Best Sellers</h2>
          </div>
          <Link
            to={"/collections/best-sellers" as any}
            className="group hidden items-center gap-2 text-sm tracking-wide text-cocoa transition-colors hover:text-rose-deep sm:flex"
          >
            Shop all favourites <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
          </Link>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {bestSellers.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Gurugram Boutique & Atelier Story ─────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal className="grid items-center gap-10 rounded-[2.5rem] bg-cream/70 p-8 sm:p-14 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-gold">
              <MapPin className="h-4 w-4" />
              <p className="eyebrow text-gold">Gurugram Atelier</p>
            </div>
            <h2 className="display-2 mt-2">Aidah Designer House &amp; Boutique</h2>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-cocoa">
              Located at <strong>Baani City Centre, Sector 63, Gurugram</strong>, Aidah is
              founded on the intimacy of Indian couture craftsmanship. Every piece begins with handpicked
              fabrics — pure silk organza, handloom Ikat, certified European flax linen, and raw silk.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cocoa/90">
              Our in-house master tailors and karigars hand-finish every hem, sequin, and tassel booti,
              ensuring that each garment carries a soul and story of its own.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={"/about" as any}
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3 text-sm tracking-wide text-ivory transition-colors hover:bg-rose-deep"
              >
                Visit Our Studio <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center rounded-full border border-gold/50 px-7 py-3 text-sm tracking-wide text-charcoal transition-colors hover:bg-background"
              >
                Shop Online
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-gold/30 shadow-xl">
            <img
              src={heroImg}
              alt="Aidah Designer House & Boutique atelier curation flatlay"
              width={1080}
              height={1080}
              loading="lazy"
              className="h-[360px] w-full object-cover sm:h-[440px]"
            />
          </div>
        </Reveal>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <Reveal className="text-center">
          <p className="eyebrow text-gold">Patron Love</p>
          <h2 className="display-2 mt-2">Words from Our Patrons</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              quote: "The Gulabi Bagh lehenga was the talk of my sister's sangeet. The twirl is effortlessly light and the resham embroidery is pure perfection.",
              name: "Ananya R.",
              city: "Gurugram",
            },
            {
              quote: "Visited their Baani City Centre studio and picked up the Aurora sage silk co-ord. The fit and fabric texture are unlike anything on the high street.",
              name: "Priya S.",
              city: "Delhi NCR",
            },
            {
              quote: "The Seraphina saree gown makes getting ready so easy. Elegant, modern, and draped like couture. Outstanding craftsmanship!",
              name: "Meher K.",
              city: "Mumbai",
            },
          ].map((t, i) => (
            <Reveal key={t.name} delay={i * 120} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <p className="font-display text-lg leading-relaxed italic text-foreground">“{t.quote}”</p>
              <p className="mt-5 text-xs tracking-[0.2em] uppercase text-cocoa">{t.name} · {t.city}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-blush px-8 py-16 text-center sm:px-16 border border-gold/20">
          <div className="petal absolute -left-10 -top-10 h-36 w-36 bg-rose/25 animate-float" aria-hidden="true" />
          <div className="petal absolute -bottom-8 -right-6 h-28 w-28 bg-gold-soft/40 animate-drift" aria-hidden="true" />
          <p className="eyebrow text-rose-deep">Letters from the Atelier</p>
          <h2 className="display-2 mx-auto mt-3 max-w-xl">First Looks, Soft Launches &amp; Curated Drops</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-cocoa">
            Join the Aidah inner circle for private previews, custom fittings at our Gurugram studio, and small-batch drop alerts.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full flex-1 rounded-full border border-gold/40 bg-background px-5 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="rounded-full bg-charcoal px-8 py-3 text-sm tracking-wide text-ivory transition-colors hover:bg-rose-deep">
              Join Circle
            </button>
          </form>
          <p className="mt-3 text-xs text-cocoa/70">Aidah The Label · Baani City Centre, Sector 63, Gurugram</p>
        </Reveal>
      </section>
    </div>
  );
}

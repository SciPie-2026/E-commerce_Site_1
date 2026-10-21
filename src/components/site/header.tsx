import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { collections, logoImg } from "@/data/catalog";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

const mainNav = [
  { label: "New In", to: "/collections/new-arrivals" },
  { label: "Shop All", to: "/shop" },
  { label: "Lookbook", to: "/lookbook" },
  { label: "About", to: "/about" },
] as const;

export function Header() {
  const { count } = useCart();
  const { slugs: wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-charcoal text-ivory">
        <p className="eyebrow mx-auto flex items-center justify-center gap-3 px-4 py-2 text-center text-[0.6rem] sm:text-xs">
          <span>Atelier: Baani City Centre, Sec 63, Gurugram</span>
          <span className="hidden text-gold sm:inline">✦</span>
          <span className="hidden sm:inline">Handcrafted Designer Wear · Small-Batch Drops</span>
          <span className="hidden text-gold md:inline">✦</span>
          <span className="hidden md:inline">Worldwide Shipping</span>
        </p>
      </div>

      {/* Main bar */}
      <div className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left: mobile menu + desktop nav */}
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <nav className="hidden items-center gap-7 text-[0.8rem] tracking-wide lg:flex" aria-label="Primary">
              {mainNav.slice(0, 2).map((item) => (
                <Link
                  key={item.label}
                  to={item.to as any}
                  className="group relative py-2 transition-colors hover:text-rose-deep"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
              {/* Collections dropdown */}
              <div className="group relative py-2">
                <button className="flex items-center gap-1 transition-colors group-hover:text-rose-deep" aria-haspopup="true">
                  Collections
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" strokeWidth={1.5} />
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-2 rounded-2xl border border-border bg-popover p-3 opacity-0 shadow-xl shadow-blush/40 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {collections.slice(0, 10).map((c) => (
                      <Link
                        key={c.slug}
                        to={"/collections/$slug" as any}
                        params={{ slug: c.slug } as any}
                        className="rounded-lg px-3 py-1.5 text-[0.8rem] text-cocoa transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {mainNav.slice(2).map((item) => (
                <Link
                  key={item.label}
                  to={item.to as any}
                  className="group relative py-2 transition-colors hover:text-rose-deep"
                >
                  {item.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 transition-opacity hover:opacity-85">
            <img
              src={logoImg}
              alt="aidah The Label logo"
              width={38}
              height={38}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-gold/40 shadow-sm"
            />
            <div className="flex flex-col items-start leading-none">
              <span className="font-display text-xl tracking-[0.28em] text-foreground sm:text-2xl">
                AIDAH<span className="text-gold">.</span>
              </span>
              <span className="text-[0.52rem] font-medium tracking-[0.25em] text-gold uppercase">
                The Label
              </span>
            </div>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Link to="/shop" aria-label="Search the shop" className="transition-colors hover:text-rose-deep">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link to={"/wishlist" as any} aria-label="Wishlist" className="relative transition-colors hover:text-rose-deep">
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-0.5 text-[0.6rem] font-medium text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to={"/cart" as any} aria-label="Shopping bag" className="relative transition-colors hover:text-rose-deep">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal px-0.5 text-[0.6rem] font-medium text-ivory">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="animate-fade-up absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoImg}
                  alt="aidah The Label logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-gold/40"
                />
                <div className="flex flex-col leading-none">
                  <span className="font-display text-lg tracking-[0.25em]">AIDAH<span className="text-gold">.</span></span>
                  <span className="text-[0.5rem] tracking-[0.2em] text-gold uppercase">The Label</span>
                </div>
              </div>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
              {mainNav.map((item) => (
                <button
                  key={item.label}
                  className="py-3 text-left font-display text-2xl transition-colors hover:text-rose-deep"
                  onClick={() => { setMobileOpen(false); navigate({ to: item.to as any }); }}
                >
                  {item.label}
                </button>
              ))}
              <p className="eyebrow mt-6 text-muted-foreground">Collections</p>
              <div className="mt-2 flex flex-col">
                {collections.slice(0, 10).map((c) => (
                  <button
                    key={c.slug}
                    className="py-2 text-left text-[0.95rem] text-cocoa transition-colors hover:text-rose-deep"
                    onClick={() => { setMobileOpen(false); navigate({ to: "/collections/$slug" as any, params: { slug: c.slug } as any }); }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { collections, logoImg } from "@/data/catalog";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="aidah The Label logo"
              width={42}
              height={42}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40 shadow-sm"
            />
            <div className="flex flex-col leading-none">
              <p className="font-display text-2xl tracking-[0.25em]">AIDAH<span className="text-gold">.</span></p>
              <p className="text-[0.55rem] font-medium tracking-[0.22em] text-gold uppercase">The Label</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cocoa">
            Aidah Designer House &amp; Boutique — heirloom lehengas, luxury linen &amp; silk co-ords,
            and contemporary occasion wear crafted in small batches for your most memorable moments.
          </p>
          <div className="mt-6 flex gap-4 text-cocoa">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-rose-deep"
            >
              <Instagram className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="transition-colors hover:text-rose-deep"
            >
              <Facebook className="h-5 w-5" strokeWidth={1.5} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="transition-colors hover:text-rose-deep"
            >
              <Youtube className="h-5 w-5" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <nav aria-label="Shop links">
          <p className="eyebrow text-cocoa">Shop Collections</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {collections.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to={"/collections/$slug" as any} params={{ slug: c.slug } as any} className="text-cocoa transition-colors hover:text-rose-deep">
                  {c.name}
                </Link>
              </li>
            ))}
            <li><Link to="/shop" className="text-cocoa transition-colors hover:text-rose-deep">Shop All Products</Link></li>
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Company links">
          <p className="eyebrow text-cocoa">The Boutique</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to={"/about" as any} className="text-cocoa transition-colors hover:text-rose-deep">Our Story &amp; Atelier</Link></li>
            <li><Link to={"/lookbook" as any} className="text-cocoa transition-colors hover:text-rose-deep">Runway &amp; Lookbook</Link></li>
            <li><Link to={"/contact" as any} className="text-cocoa transition-colors hover:text-rose-deep">Visit the Studio</Link></li>
            <li><Link to={"/faq" as any} className="text-cocoa transition-colors hover:text-rose-deep">Boutique FAQ</Link></li>
            <li><Link to={"/size-guide" as any} className="text-cocoa transition-colors hover:text-rose-deep">Custom Sizing Guide</Link></li>
          </ul>
        </nav>

        {/* Help & Location */}
        <div>
          <p className="eyebrow text-cocoa">Atelier &amp; Contact</p>
          <ul className="mt-4 space-y-2.5 text-sm text-cocoa">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              <span>Baani City Centre, Sector 63, Gurugram, Haryana, India</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              <span>Mon–Sat, 11am–7pm IST</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
              <span>concierge@aidah.in</span>
            </li>
          </ul>
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <li><Link to={"/shipping-policy" as any} className="hover:underline">Shipping</Link></li>
            <li><Link to={"/returns" as any} className="hover:underline">Returns &amp; Alterations</Link></li>
            <li><Link to={"/privacy" as any} className="hover:underline">Privacy</Link></li>
            <li><Link to={"/terms" as any} className="hover:underline">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} AIDAH The Label. All rights reserved. Handcrafted in India.</p>
          <p className="italic">
            Designer House &amp; Boutique · Baani City Centre, Sec 63, Gurugram
          </p>
        </div>
      </div>
    </footer>
  );
}

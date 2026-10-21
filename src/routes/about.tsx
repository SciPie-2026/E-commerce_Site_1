import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Sparkles, Heart, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-campaign.jpg";
import ethnicImg from "@/assets/category-ethnic.jpg";
import editorialImg from "@/assets/lookbook-editorial.jpg";
import { logoImg } from "@/data/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story & Atelier — AIDAH The Label | Baani City Centre, Gurugram" },
      {
        name: "description",
        content:
          "Discover Aidah The Label — a luxury Indian designer house & boutique based in Baani City Centre, Sector 63, Gurugram. Celebrating heritage weaves, pure silk organza, and artisanal tailoring.",
      },
      { property: "og:title", content: "Our Story & Atelier — AIDAH The Label" },
      { property: "og:image", content: "/logo.jpg" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/20 px-4 py-1 text-xs text-charcoal mb-4">
          <img src={logoImg} alt="Aidah The Label" className="h-4 w-4 rounded-full object-cover" />
          <span className="font-medium tracking-wide">The Atelier Journey</span>
        </div>
        <h1 className="display-1 text-4xl sm:text-6xl text-foreground">
          Crafting Heirlooms for Your <em className="italic font-normal text-rose-deep">Most Beautiful</em> Moments
        </h1>
        <p className="mt-6 text-base text-cocoa leading-relaxed font-light">
          Founded with an obsession for artisanal Indian textiles, ethereal twirls, and intimate boutique tailoring. Welcome to the world of Aidah The Label.
        </p>
      </div>

      {/* Main image grid */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-md">
          <img src={heroImg} alt="Aidah atelier flatlay" className="h-80 w-full object-cover" />
        </div>
        <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-md">
          <img src={ethnicImg} alt="Gulabi Bagh twirling lehenga" className="h-80 w-full object-cover" />
        </div>
        <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-md sm:col-span-2 lg:col-span-1">
          <img src={editorialImg} alt="Aidah editorial drape" className="h-80 w-full object-cover" />
        </div>
      </div>

      {/* Philosophy */}
      <div className="mt-20 grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <p className="eyebrow text-gold">The Philosophy</p>
          <h2 className="display-2 mt-2 text-3xl sm:text-4xl">Slow Fashion, Made with Soul</h2>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-cocoa">
            At <strong>Aidah The Label</strong>, we discard the rush of fast fashion. Every single silhouette is designed in-house at our atelier and crafted in limited micro-batches by skilled generational artisans.
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-cocoa">
            We work exclusively with pure, breathable, and opulent natural textiles — handloom cotton Ikat, pure silk organza, featherweight mulmul, and certified European flax linen. Each piece is finished with French seams, hand-sewn booti tassels, and soft cotton linings that feel divine against the skin.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-6 w-6 text-gold shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl text-foreground">Zero Compromise on Quality</h3>
              <p className="mt-1 text-xs text-cocoa leading-relaxed">
                We believe couture should feel as gentle and comfortable as it looks grand. We refuse synthetic linings or scratchy nets.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Heart className="h-6 w-6 text-rose shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl text-foreground">Bespoke Fit for Every Woman</h3>
              <p className="mt-1 text-xs text-cocoa leading-relaxed">
                Every woman deserves clothes that celebrate her unique form. We provide personalized made-to-measure alterations for all patron orders.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-gold shrink-0 mt-1" />
            <div>
              <h3 className="font-display text-xl text-foreground">Visit Our Gurugram Atelier</h3>
              <p className="mt-1 text-xs text-cocoa leading-relaxed">
                Step inside our flagship boutique at Baani City Centre, Sector 63, Gurugram. Touch the fabrics, meet our stylists, and feel the luxury in person.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Boutique Details Banner */}
      <div className="mt-20 rounded-[2.5rem] bg-cream/70 border border-gold/30 p-8 sm:p-14 text-center">
        <p className="eyebrow text-gold">Physical Boutique &amp; Design Studio</p>
        <h2 className="display-2 mt-2 text-2xl sm:text-4xl text-foreground">Baani City Centre, Sector 63, Gurugram</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cocoa">
          We invite you to experience personalized bridal consultations, trousseau styling, and custom fitting sessions at our studio.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
          >
            Explore Creations <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={"/contact" as any}
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-8 py-3.5 text-xs uppercase tracking-wider text-charcoal hover:bg-background transition-colors"
          >
            Book Studio Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

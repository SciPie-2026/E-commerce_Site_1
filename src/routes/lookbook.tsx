import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-campaign.jpg";
import floralImg from "@/assets/category-floral.jpg";
import ethnicImg from "@/assets/category-ethnic.jpg";
import editorialImg from "@/assets/lookbook-editorial.jpg";

export const Route = createFileRoute("/lookbook")({
  head: () => ({
    meta: [
      { title: "Runway & Lookbook — AIDAH The Label | Gurugram" },
      {
        name: "description",
        content: "Explore the Aidah The Label lookbook: dynamic runway video reels, liquid silks, bridal lehengas, and ethereal silhouettes in motion.",
      },
      { property: "og:title", content: "Runway & Lookbook — AIDAH The Label" },
      { property: "og:image", content: "/logo.jpg" },
    ],
  }),
  component: LookbookPage,
});

const videoReels = [
  { src: "/media/reels/reel-1.mp4", title: "The Twirl of Gulabi Bagh", subtitle: "Handcrafted Silk Organza Lehenga" },
  { src: "/media/reels/reel-2.mp4", title: "Liquid Satin Drape", subtitle: "The Seraphina Saree Gown" },
  { src: "/media/reels/reel-3.mp4", title: "Camille Summer Maxi", subtitle: "Pure Mulmul & Shadow Floral Print" },
  { src: "/media/reels/reel-4.mp4", title: "Valeria Cape & Dhoti Set", subtitle: "Ice-Blue Festive Occasion Wear" },
  { src: "/media/reels/reel-5.mp4", title: "Atelier Fitting Session", subtitle: "Baani City Centre Studio" },
];

const editorialShots = [
  { img: ethnicImg, title: "The Royal Flora Lehenga", caption: "Resham and Zari Booti with scalloped organza border" },
  { img: heroImg, title: "Noor Peach Chikankari Kurta", caption: "Pure organza with artisanal needle lace craft" },
  { img: editorialImg, title: "Valeria Cape Ensemble", caption: "Structured drape with liquid silk dhoti pants" },
  { img: floralImg, title: "Camille Tiered Maxi", caption: "Breezy tiered silhouette designed for resort evenings" },
];

function LookbookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow text-gold">Editorial Archive</p>
        <h1 className="display-1 mt-2 text-4xl sm:text-6xl text-foreground">
          Runway in <em className="italic font-normal text-rose-deep">Motion</em>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-cocoa leading-relaxed font-light">
          Silhouettes designed not just to be admired, but to be moved in. Watch our couture collections twirl, flow, and drape in live motion.
        </p>
      </div>

      {/* Video Reels Section */}
      <div className="mt-16">
        <div className="flex items-center gap-2 mb-6 text-gold">
          <Play className="h-4 w-4 fill-gold" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-charcoal">Runway Video Reels</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {videoReels.map((reel, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-3xl border border-border bg-charcoal shadow-lg">
              <div className="aspect-[9/16] w-full overflow-hidden">
                <video
                  src={reel.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-3 right-3 text-ivory pointer-events-none">
                <p className="font-display text-base font-medium leading-tight">{reel.title}</p>
                <p className="mt-1 text-[0.65rem] text-ivory/80">{reel.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editorial Stills */}
      <div className="mt-24">
        <p className="eyebrow text-gold mb-2">Editorial Stills</p>
        <h2 className="display-2 text-3xl sm:text-4xl">Campaign Photography</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {editorialShots.map((shot, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-3xl border border-gold/20 shadow-xl">
              <img
                src={shot.img}
                alt={shot.title}
                className="h-[480px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-ivory">
                <h3 className="font-display text-2xl">{shot.title}</h3>
                <p className="mt-1 text-xs text-ivory/80">{shot.caption}</p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold-soft hover:underline"
                >
                  Shop Silhouette <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

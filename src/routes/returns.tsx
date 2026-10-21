import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Scissors, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Alterations — AIDAH The Label" },
      { name: "description", content: "Details on our 14-day boutique alterations, size exchanges, and returns policy." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Patron Guarantee</p>
        <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">Returns &amp; Alterations Policy</h1>
        <p className="mt-4 text-sm text-cocoa">Your satisfaction and the perfection of your silhouette are our highest priorities.</p>
      </div>

      <div className="mt-12 space-y-8 text-xs leading-relaxed text-cocoa">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-display text-xl">
            <Scissors className="h-5 w-5 text-gold" />
            <h2>Complimentary Atelier Alterations</h2>
          </div>
          <p>If your piece requires slight fitting adjustments (bust, waist, hem length, or sleeve width), our master tailors will alter it free of charge within 14 days of delivery.</p>
          <p>You may bring the garment to our Baani City Centre, Sector 63, Gurugram boutique or courier it back to our atelier.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-display text-xl">
            <RotateCcw className="h-5 w-5 text-gold" />
            <h2>14-Day Exchanges &amp; Store Credit</h2>
          </div>
          <p>Unworn, unaltered garments with all original boutique tags and security labels attached in their original packaging can be exchanged for another size or store credit valid for 1 year.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-display text-xl">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <h2>Non-Exchangeable Items</h2>
          </div>
          <p>Bespoke custom-made bridal wear tailored to non-standard custom client measurements cannot be returned, but remains eligible for complimentary in-person alterations until you are satisfied.</p>
        </div>
      </div>
    </div>
  );
}

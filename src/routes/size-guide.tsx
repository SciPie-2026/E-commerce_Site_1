import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size & Fit Guide — AIDAH The Label" },
      { name: "description", content: "Comprehensive size chart and made-to-measure fitting guidelines for Aidah The Label silhouettes." },
    ],
  }),
  component: SizeGuidePage,
});

const sizeData = [
  { size: "XS", bust: "32 in (81 cm)", waist: "25 in (64 cm)", hip: "35 in (89 cm)", india: "32" },
  { size: "S", bust: "34 in (86 cm)", waist: "27 in (69 cm)", hip: "37 in (94 cm)", india: "34" },
  { size: "M", bust: "36 in (91 cm)", waist: "29 in (74 cm)", hip: "39 in (99 cm)", india: "36" },
  { size: "L", bust: "38 in (97 cm)", waist: "31 in (79 cm)", hip: "41 in (104 cm)", india: "38" },
  { size: "XL", bust: "40 in (102 cm)", waist: "33 in (84 cm)", hip: "43 in (109 cm)", india: "40" },
  { size: "Custom", bust: "Bespoke", waist: "Bespoke", hip: "Bespoke", india: "Tailored to You" },
];

function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Tailoring &amp; Measurement</p>
        <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">Size &amp; Fit Guide</h1>
        <p className="mt-4 text-sm text-cocoa max-w-xl mx-auto">
          Our silhouettes are crafted to drape effortlessly. Use this chart to determine your standard size, or request custom bespoke tailoring.
        </p>
      </div>

      {/* Size Chart Table */}
      <div className="mt-12 overflow-x-auto rounded-3xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-cream/50 text-[0.7rem] uppercase tracking-wider text-cocoa">
            <tr>
              <th className="p-4 sm:p-5">Size</th>
              <th className="p-4 sm:p-5">Bust</th>
              <th className="p-4 sm:p-5">Waist</th>
              <th className="p-4 sm:p-5">Hip</th>
              <th className="p-4 sm:p-5">Indian Standard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sizeData.map((row) => (
              <tr key={row.size} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4 sm:p-5 font-semibold text-foreground">{row.size}</td>
                <td className="p-4 sm:p-5 text-cocoa">{row.bust}</td>
                <td className="p-4 sm:p-5 text-cocoa">{row.waist}</td>
                <td className="p-4 sm:p-5 text-cocoa">{row.hip}</td>
                <td className="p-4 sm:p-5 text-cocoa">{row.india}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How to measure */}
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 text-xs text-cocoa">
          <h3 className="font-display text-lg text-foreground mb-2">1. Bust</h3>
          <p>Measure across the fullest part of your chest, keeping the tape horizontal and comfortably relaxed.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-xs text-cocoa">
          <h3 className="font-display text-lg text-foreground mb-2">2. Natural Waist</h3>
          <p>Measure around the narrowest contour of your torso, typically one inch above your navel.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 text-xs text-cocoa">
          <h3 className="font-display text-lg text-foreground mb-2">3. Lower Hip</h3>
          <p>Stand with feet together and measure around the widest point of your hips and seat.</p>
        </div>
      </div>

      {/* Bespoke Fitting Banner */}
      <div className="mt-16 rounded-3xl bg-cream/70 border border-gold/30 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
            <Scissors className="h-5 w-5 text-gold" /> Need Custom Measurements?
          </h2>
          <p className="mt-1 text-xs text-cocoa max-w-lg">
            Visit our studio at Baani City Centre, Sector 63, Gurugram for a complimentary professional fitting session, or submit your bespoke measurements online.
          </p>
        </div>
        <Link
          to={"/contact" as any}
          className="rounded-full bg-charcoal px-8 py-3 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors shrink-0"
        >
          Book Studio Fitting
        </Link>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AIDAH The Label" },
      { name: "description", content: "Terms of service and boutique conditions for Aidah The Label." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Legal Terms</p>
        <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">Terms of Service</h1>
        <p className="mt-4 text-sm text-cocoa">General conditions governing orders with Aidah The Label.</p>
      </div>

      <div className="mt-12 space-y-6 text-xs leading-relaxed text-cocoa rounded-3xl border border-border bg-card p-8 shadow-xs">
        <h2 className="font-display text-xl text-foreground">Boutique Orders &amp; Craftsmanship</h2>
        <p>By placing an order with Aidah The Label (Aidah Designer House &amp; Boutique, Baani City Centre, Sector 63, Gurugram), you acknowledge that our garments are hand-finished in small batches. Slight organic variations in handloom slubs, embroidery knots, and dyed colors are hallmarks of authentic artisanal craftsmanship.</p>

        <h2 className="font-display text-xl text-foreground mt-6">Pricing &amp; Availability</h2>
        <p>All prices are listed in Indian Rupees (INR) and include applicable domestic GST. We reserve the right to limit quantities per client on limited edition drops.</p>

        <h2 className="font-display text-xl text-foreground mt-6">Intellectual Property</h2>
        <p>All silhouette designs, patterns, photography, video reels, and brand assets are the exclusive intellectual property of Aidah The Label.</p>
      </div>
    </div>
  );
}

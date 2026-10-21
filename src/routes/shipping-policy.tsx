import { createFileRoute } from "@tanstack/react-router";
import { Truck, MapPin, Globe } from "lucide-react";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy — AIDAH The Label" },
      { name: "description", content: "Learn about Aidah The Label delivery timelines, local studio pickup at Baani City Centre Gurugram, and global shipping." },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Boutique Logistics</p>
        <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">Shipping &amp; Delivery Policy</h1>
        <p className="mt-4 text-sm text-cocoa">Handcrafted pieces delivered securely in luxury archival packaging.</p>
      </div>

      <div className="mt-12 space-y-8 text-xs leading-relaxed text-cocoa">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-display text-xl">
            <Truck className="h-5 w-5 text-gold" />
            <h2>Domestic Delivery (India)</h2>
          </div>
          <p>We provide complimentary express delivery across India for orders above ₹5,000. For orders under ₹5,000, a nominal boutique courier fee of ₹350 applies.</p>
          <p>Ready atelier pieces are dispatched within 2–4 business days. Custom tailored orders require 7–10 business days for artisanal crafting and inspection.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-display text-xl">
            <MapPin className="h-5 w-5 text-gold" />
            <h2>Local Atelier Pickup (Gurugram)</h2>
          </div>
          <p>Patrons in Delhi NCR may select complimentary in-store pickup at our boutique: <strong>Baani City Centre, Sector 63, Gurugram, Haryana</strong>.</p>
          <p>You will receive a WhatsApp message when your order is ironed, inspected, and waiting in our archival boutique bag.</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-display text-xl">
            <Globe className="h-5 w-5 text-gold" />
            <h2>International Worldwide Shipping</h2>
          </div>
          <p>We ship globally to the US, UK, Canada, UAE, Singapore, Australia, and Europe via DHL Express. Deliveries typically arrive in 5–8 business days from dispatch.</p>
        </div>
      </div>
    </div>
  );
}

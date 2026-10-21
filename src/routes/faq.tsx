import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Boutique FAQ — AIDAH The Label" },
      { name: "description", content: "Frequently asked questions regarding bespoke sizing, orders, craftsmanship, and atelier visits." },
    ],
  }),
  component: FAQPage,
});

const faqs = [
  {
    q: "Where is the Aidah boutique and design studio located?",
    a: "Our flagship boutique and atelier is located at Baani City Centre, Sector 63, Gurugram, Haryana. You are warmly invited to visit us for private styling sessions, custom bridal fittings, and in-person fabric previews.",
  },
  {
    q: "Do you offer custom sizing and bespoke made-to-measure tailoring?",
    a: "Yes! Every Aidah silhouette can be tailored to your precise measurements. You can select 'Custom' or contact our concierge immediately after placing your order with your bust, waist, hip, and height measurements.",
  },
  {
    q: "How long does it take to craft and deliver my order?",
    a: "Ready atelier pieces are dispatched within 2–4 business days. Custom tailored and bridal lehenga orders typically require 7–12 days for hand-finishing, embroidery detailing, and quality inspection.",
  },
  {
    q: "What is your return and alterations policy?",
    a: "We offer a 14-day boutique alterations policy. If any garment does not fit perfectly, our master tailors will alter it free of charge, or you can exchange it for store credit or another silhouette.",
  },
  {
    q: "What fabrics do you use?",
    a: "We use only pure, certified, and breathable natural textiles — pure Mulberry silk organza, handloom Ikat, certified European flax linen, raw silk, and airy cotton mulmul. We never use polyester linings.",
  },
  {
    q: "Do you offer international shipping?",
    a: "Yes, we ship worldwide via DHL Express. International orders are packed in reinforced archival boutique boxes with customs duties pre-calculated at checkout.",
  },
];

function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Help &amp; Concierge</p>
        <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">Frequently Asked Questions</h1>
        <p className="mt-4 text-sm text-cocoa">Everything you need to know about shopping with Aidah The Label.</p>
      </div>

      <div className="mt-12 space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-5 text-left flex justify-between items-center gap-4 transition-colors hover:bg-secondary/40"
            >
              <span className="font-display text-lg text-foreground">{faq.q}</span>
              <ChevronDown
                className={`h-4 w-4 text-cocoa transition-transform duration-300 shrink-0 ${openIdx === idx ? "rotate-180" : ""}`}
              />
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 pt-1 text-xs text-cocoa leading-relaxed border-t border-border/50">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-cream/70 border border-gold/30 p-8 text-center">
        <h2 className="font-display text-xl text-foreground">Still have questions?</h2>
        <p className="mt-2 text-xs text-cocoa">Our Gurugram concierge is available Mon–Sat from 11am to 7pm IST.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            to={"/contact" as any}
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-xs uppercase tracking-wider text-ivory hover:bg-rose-deep transition-colors"
          >
            Contact Concierge <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

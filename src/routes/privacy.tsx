import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AIDAH The Label" },
      { name: "description", content: "Privacy policy and client data protection at Aidah The Label boutique." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="eyebrow text-gold">Legal &amp; Privacy</p>
        <h1 className="display-1 mt-2 text-3xl sm:text-5xl text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-sm text-cocoa">How we protect your personal data and couture preferences.</p>
      </div>

      <div className="mt-12 space-y-6 text-xs leading-relaxed text-cocoa rounded-3xl border border-border bg-card p-8 shadow-xs">
        <h2 className="font-display text-xl text-foreground">Information We Collect</h2>
        <p>When you visit Aidah The Label online or at our Baani City Centre studio, we collect personal information you share with us such as your name, contact phone, delivery address, sizing measurements, and order history.</p>

        <h2 className="font-display text-xl text-foreground mt-6">How Your Data is Used</h2>
        <p>Your details are used strictly to fulfill boutique orders, coordinate made-to-measure tailoring, arrange white-glove delivery, and send invitations to private seasonal drops if you have opted in.</p>

        <h2 className="font-display text-xl text-foreground mt-6">Security &amp; Confidentiality</h2>
        <p>We do not sell, rent, or trade your personal information. Payment processing is secured through certified PCI-DSS compliant gateways.</p>
      </div>
    </div>
  );
}
